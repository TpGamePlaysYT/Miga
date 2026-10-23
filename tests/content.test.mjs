import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readEntries, validateEntry, validateCatalog } from '../src/lib/content.mjs';
const entries = readEntries();
const clone = (e) => ({
  ...structuredClone(e),
  status: 'draft',
  result: {
    file: null,
    poster: null,
    exactPrompt: null,
    tool: null,
    model: null,
    settings: {},
    notes: null,
    alt: null,
    testedAt: null,
    rightsConfirmed: false,
  },
});
test('catálogo editorial completo y válido', () => {
  assert.ok(entries.some((e) => e.type === 'image'));
  assert.ok(entries.some((e) => e.type === 'video'));
  assert.ok(entries.every((e) => ['draft', 'published'].includes(e.status)));
  assert.deepEqual(validateCatalog(entries), []);
  assert.equal(new Set(entries.map((e) => e.slug)).size, entries.length);
});
test('no permite publicar propuestas sin resultados', () => {
  const entry = clone(entries[0]);
  entry.status = 'published';
  const errors = validateEntry(entry);
  assert.ok(errors.some((e) => e.includes('result.file')));
  assert.ok(errors.some((e) => e.includes('exactPrompt')));
  assert.ok(errors.some((e) => e.includes('model')));
  assert.ok(errors.some((e) => e.includes('rightsConfirmed')));
});
test('valida campos de video y duración sugerida', () => {
  const e = clone(entries.find((e) => e.type === 'video'));
  e.video.durationSeconds = 0;
  e.video.camera = '';
  assert.ok(validateEntry(e).some((s) => s.includes('durationSeconds')));
  assert.ok(validateEntry(e).some((s) => s.includes('camera')));
});
test('rechaza rutas ajenas a media y extensiones ejecutables', () => {
  for (const file of [
    '/media/../secret.png',
    'https://example.com/file.webp',
    '/demo/cat.svg',
    '/media/test.html',
  ]) {
    const e = clone(entries[0]);
    e.result.file = file;
    assert.ok(validateEntry(e).some((s) => s.includes('archivo local válido')));
  }
});
test('no publica archivos ausentes', () => {
  const e = clone(entries.find((e) => e.type === 'image'));
  e.result.file = '/media/no-existe.webp';
  assert.ok(validateEntry(e).some((s) => s.includes('inexistente')));
});
test('un video requiere portada y ajustes reales de duración y formato', () => {
  const e = clone(entries.find((e) => e.type === 'video'));
  e.status = 'published';
  const errors = validateEntry(e);
  assert.ok(errors.some((s) => s.includes('poster')));
  assert.ok(errors.some((s) => s.includes('settings.durationSeconds')));
  assert.ok(errors.some((s) => s.includes('settings.aspectRatio')));
});
test('acepta una ficha de imagen documentada con archivo existente', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'miga-test-'));
  fs.mkdirSync(path.join(dir, 'media'));
  fs.writeFileSync(
    path.join(dir, 'media', 'test.png'),
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
      'base64',
    ),
  );
  try {
    const e = clone(entries.find((e) => e.type === 'image'));
    e.status = 'published';
    e.result = {
      file: '/media/test.png',
      poster: null,
      exactPrompt: 'Prompt de una prueba automatizada.',
      tool: 'Prueba local',
      model: 'Fixture',
      settings: { aspectRatio: '1:1' },
      notes: 'Solo prueba.',
      alt: 'Un píxel',
      testedAt: '2026-10-22',
      rightsConfirmed: true,
    };
    assert.deepEqual(validateEntry(e, { publicDir: dir }), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test('rechaza slugs duplicados y campos editoriales incompletos', () => {
  assert.ok(validateCatalog([entries[0], entries[0]]).some((s) => s.includes('duplicado')));
  const e = clone(entries[0]);
  e.customizable = [];
  e.audience = '';
  assert.equal(validateEntry(e).length, 2);
});
