import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readEntries } from '../src/lib/content.mjs';
const entries = readEntries();
test('catálogo y búsqueda combinada, acentos, filtros y orden', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-card]:visible')).toHaveCount(entries.length);
  await page.locator('[data-type-filter="video"]').click();
  await expect(page.locator('[data-card]:visible')).toHaveCount(
    entries.filter((e) => e.type === 'video').length,
  );
  await page.locator('button[data-category="Mascotas"]').click();
  await expect(page.locator('[data-card]:visible')).toHaveCount(
    entries.filter((e) => e.type === 'video' && e.category === 'Mascotas').length,
  );
  await page.getByLabel('Buscar prompts').fill('gato');
  await expect(page.locator('[data-card]:visible')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-card]:visible')).toHaveCount(1);
  await page.locator('[data-clear]').click();
  await page.getByLabel('Buscar prompts').fill('cafe');
  await expect(page.locator('[data-card]:visible').first()).toBeVisible();
  await page.getByLabel('Buscar prompts').fill('zzznothing');
  await expect(page.getByText('No encontramos esa combinación')).toBeVisible();
  await page.locator('[data-clear]').click();
  await page.getByLabel('Ordenar:').selectOption('az');
  const titles = await page
    .locator('[data-card]:visible')
    .evaluateAll((nodes) => nodes.map((n) => n.dataset.title));
  expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'es')));
});
test('guardados persisten, se eliminan y sincronizan entre pestañas', async ({ page, context }) => {
  await page.goto('/prompts/serum-luz-de-manana/');
  await page.locator('.save-detail').click();
  await expect(page.locator('.save-detail')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('.save-detail')).toHaveAttribute('aria-pressed', 'true');
  const second = await context.newPage();
  await second.goto('/guardados/');
  await expect(second.locator('[data-card]:visible')).toHaveCount(1);
  await page.locator('.save-detail').click();
  await expect(second.locator('[data-card]:visible')).toHaveCount(0);
  await expect(second.locator('[data-empty]')).toBeVisible();
});
test('copiar conserva el prompt exacto y confirma visualmente', async ({
  page,
  context,
  browserName,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/prompts/serum-luz-de-manana/');
  const prompt = await page.locator('#prompt-text').textContent();
  await page.getByRole('button', { name: 'Copiar prompt' }).click();
  await expect(page.getByRole('button', { name: '¡Prompt copiado!' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
});
test('cada ficha editorial tiene su página sin errores de consola', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const links = await page
    .locator('.card-link')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href')));
  for (const link of links) {
    const response = await page.goto(link);
    expect(response.status()).toBe(200);
    await expect(page.locator('#prompt-text')).toBeVisible();
    const entry = entries.find((e) => link === `/prompts/${e.slug}/`);
    await expect(
      page.getByText(entry.status === 'draft' ? 'Borrador · sin probar' : 'Resultado probado', {
        exact: true,
      }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test('videos borrador no simulan resultados ni descargan video', async ({ page }) => {
  const media = [];
  page.on('request', (req) => {
    if (/\.(mp4|webm)(\?|$)/.test(req.url())) media.push(req.url());
  });
  await page.goto('/prompts/invernadero-espacial/');
  await expect(page.getByText('Video pendiente de generar')).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
  expect(media).toEqual([]);
});
test('fallo de almacenamiento local se explica sin romper la página', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'setItem', {
      value() {
        throw new Error('blocked');
      },
    });
  });
  await page.goto('/');
  await page.locator('[data-save]').first().click();
  await expect(
    page.getByRole('status').filter({ hasText: 'El navegador no permite guardar' }),
  ).toBeVisible();
  await expect(page.locator('[data-card]:visible')).toHaveCount(entries.length);
});
test('navegación móvil y ausencia de desbordamiento horizontal', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      '/',
      '/prompts/serum-luz-de-manana/',
      '/prompts/invernadero-espacial/',
      '/como-funciona/',
      '/guardados/',
    ]) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeHidden();
});
test('páginas informativas y SEO de desarrollo', async ({ page, request }) => {
  for (const path of ['/acerca/', '/como-funciona/', '/privacidad/', '/terminos/']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  }
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const entry of entries) {
    if (entry.status === 'draft') expect(sitemap).not.toContain(`/prompts/${entry.slug}/`);
    else expect(sitemap).toContain(`/prompts/${entry.slug}/`);
  }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
});
for (const width of [1440, 390])
  test(`accesibilidad WCAG AA en portada y detalle a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/', '/prompts/serum-luz-de-manana/', '/guardados/']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
      ).toEqual([]);
    }
  });
