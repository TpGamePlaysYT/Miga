// Uses synthetic fixtures, never Flow results. Files are removed in finally.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { readEntries } from '../src/lib/content.mjs';
const basePath = process.env.TEST_BASE_PATH || '/';
const basePrefix = basePath.replace(/\/$/, '');
const fixtureDir = 'public/media/miga-test-fixture';
const fixtureEntry = 'src/content/prompts/miga-test-video.json';
const draftEntry = 'src/content/prompts/miga-test-draft.json';
for (const file of [fixtureDir, fixtureEntry, draftEntry])
  if (fs.existsSync(file)) throw new Error(`No se sobrescribe ${file}`);
let server, browser;
const build = (env) => {
  const result = spawnSync('npm', ['run', 'build'], {
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  assert.equal(result.status, 0, 'La compilación debe terminar correctamente.');
};
try {
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.copyFileSync('tests/fixtures/synthetic.mp4', `${fixtureDir}/video.mp4`);
  fs.copyFileSync('tests/fixtures/poster.png', `${fixtureDir}/poster.png`);
  fs.copyFileSync('tests/fixtures/poster.png', `${fixtureDir}/unpublished.png`);
  const e = structuredClone(readEntries().find((e) => e.type === 'video'));
  Object.assign(e, {
    slug: 'miga-test-video',
    title: 'Fixture sintética de reproducción',
    status: 'published',
  });
  e.result = {
    file: '/media/miga-test-fixture/video.mp4',
    poster: '/media/miga-test-fixture/poster.png',
    exactPrompt: 'PRUEBA SINTÉTICA LOCAL. No generada en Flow.',
    tool: 'ffmpeg',
    model: 'testsrc2',
    settings: { aspectRatio: '4:3', durationSeconds: 1 },
    notes: 'Archivo sintético exclusivo para pruebas automatizadas, no editorial.',
    alt: 'Patrón de colores de prueba',
    testedAt: '2026-10-22',
    rightsConfirmed: true,
  };
  fs.writeFileSync(fixtureEntry, JSON.stringify(e, null, 2));
  const draft = structuredClone(e);
  draft.slug = 'miga-test-draft';
  draft.status = 'draft';
  draft.type = 'image';
  draft.result.file = '/media/miga-test-fixture/unpublished.png';
  draft.result.poster = null;
  fs.writeFileSync(draftEntry, JSON.stringify(draft, null, 2));
  build({ SITE_URL: 'https://miga.test', BASE_PATH: basePath });
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
  assert.ok(sitemap.includes(`https://miga.test${basePrefix}/prompts/miga-test-video/`));
  assert.ok(
    fs
      .readFileSync('dist/robots.txt', 'utf8')
      .includes(`https://miga.test${basePrefix}/sitemap.xml`),
  );
  assert.ok(!sitemap.includes('/prompts/miga-test-draft/'));
  assert.ok(!fs.existsSync('dist/prompts/miga-test-draft'));
  assert.ok(!fs.existsSync('dist/media/miga-test-fixture/unpublished.png'));
  for (const draft of readEntries().filter((e) => e.status === 'draft'))
    assert.ok(!fs.existsSync(`dist/prompts/${draft.slug}`));
  const home = fs.readFileSync('dist/index.html', 'utf8');
  for (const draft of readEntries().filter((e) => e.status === 'draft'))
    assert.ok(!home.includes(`data-slug="${draft.slug}"`));
  assert.ok(!home.includes('googlesyndication.com'));
  const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.woff2': 'font/woff2',
  };
  server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (basePrefix && !pathname.startsWith(basePrefix + '/')) {
      res.writeHead(404).end();
      return;
    }
    let file = path.resolve('dist', '.' + pathname.slice(basePrefix.length));
    if (!file.startsWith(path.resolve('dist') + path.sep) && file !== path.resolve('dist')) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(4322, '127.0.0.1', resolve);
  });
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] }
      : {}),
  });
  const page = await browser.newPage();
  const requests = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) requests.push(r.url());
  });
  await page.goto(`http://127.0.0.1:4322${basePrefix}/prompts/miga-test-video/`);
  await page.evaluate(() => document.fonts.ready);
  assert.ok(
    await page.locator('[data-poster]').evaluate((img) => img.complete && img.naturalWidth > 0),
  );
  assert.equal(
    await page.locator('link[rel=icon]').getAttribute('href'),
    `${basePrefix}/favicon.svg`,
  );
  const localLinks = await page
    .locator('a[href^="/"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href')));
  assert.ok(localLinks.every((link) => link.startsWith(basePrefix + '/')));
  const styles = await page
    .locator('link[rel=stylesheet]')
    .evaluateAll((nodes) => nodes.map((n) => n.href));
  for (const url of styles)
    assert.ok((await fetch(url)).ok, 'La hoja de estilos debe cargar en la subruta.');
  assert.equal(await page.locator('video').count(), 0);
  assert.equal(requests.length, 0, 'No debe descargar el video antes de la acción.');
  assert.equal(await page.locator('#prompt-text').textContent(), e.result.exactPrompt);
  assert.equal(
    await page.locator('link[rel=canonical]').getAttribute('href'),
    `https://miga.test${basePrefix}/prompts/miga-test-video/`,
  );
  await page.getByRole('button', { name: 'Reproducir Fixture sintética de reproducción' }).click();
  await page.waitForFunction(() => document.querySelector('video')?.currentTime > 0);
  assert.ok(requests.length > 0, 'Se solicitó el video después del clic.');
  assert.ok(requests.every((url) => url.includes(`${basePrefix}/media/`)));
  await page.locator('.save-detail').click();
  await page.goto(`http://127.0.0.1:4322${basePrefix}/guardados/`);
  await page.waitForFunction(() => document.querySelector('[data-card]:not([hidden])'));
  assert.equal(await page.locator('[data-card]:visible').count(), 1);
  await page.locator('.card-link').click();
  await page.getByRole('button', { name: 'Reproducir Fixture sintética de reproducción' }).click();
  await page.waitForFunction(() => document.querySelector('video')?.currentTime > 0);
  assert.ok(await page.locator('video').evaluate((v) => v.controls && v.videoWidth === 320));
  console.log(
    'PUBLICACIÓN: ruta, prompt exacto, canonical, sitemap, exclusión de borradores/archivos y reproducción real verificados.',
  );
} finally {
  await browser?.close();
  if (server?.listening)
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  fs.rmSync(fixtureEntry, { force: true });
  fs.rmSync(draftEntry, { force: true });
  fs.rmSync(fixtureDir, { recursive: true, force: true });
  build({});
  console.log('Fixtures retiradas; dist/ reconstruido con el catálogo real.');
}
