// A static host must not receive media attached only to unpublished drafts.
import fs from 'node:fs';
import path from 'node:path';
import { readEntries } from '../src/lib/content.mjs';
const allowed = new Set(
  readEntries()
    .filter((e) => e.status === 'published')
    .flatMap((e) => [e.result.file, e.result.poster])
    .filter(Boolean),
);
const mediaRoot = path.resolve('dist/media');
function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) walk(file);
    else {
      const url = '/media/' + path.relative(mediaRoot, file).split(path.sep).join('/');
      if (!allowed.has(url)) fs.unlinkSync(file);
    }
  }
}
walk(mediaRoot);
console.log('Salida pública: solo archivos de fichas publicadas en dist/media/.');
