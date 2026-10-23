import fs from 'node:fs';
import path from 'node:path';
import { readEntries, root, validateCatalog, validateEntry } from '../src/lib/content.mjs';
const [command = 'check', slug, type = 'image'] = process.argv.slice(2);
if (command === 'check') {
  const entries = readEntries();
  const errors = validateCatalog(entries);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(
    `${entries.length} fichas válidas; ${entries.filter((e) => e.status === 'published').length} publicadas.`,
  );
} else if (command === 'new') {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') || !['image', 'video'].includes(type))
    throw new Error('Uso: npm run content -- new mi-idea image|video');
  const entry = {
    slug,
    type,
    status: 'draft',
    title: 'Nueva idea',
    description: 'Describe la propuesta.',
    category: 'Productos',
    tags: ['editorial'],
    audience: 'Define el público.',
    use: 'Define su uso.',
    prompt: 'Escribe un prompt detallado para probar.',
    aspectRatio: '4:5',
    customizable: ['Producto', 'Paleta'],
    proposedFilename: `${slug}.${type === 'image' ? 'webp' : 'mp4'}`,
    ...(type === 'video'
      ? {
          video: {
            action: 'Describe la acción.',
            camera: 'Describe la cámara.',
            durationSeconds: 8,
          },
        }
      : {}),
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
  };
  fs.writeFileSync(path.join(root, `${slug}.json`), JSON.stringify(entry, null, 2) + '\n', {
    flag: 'wx',
  });
  console.log(`Creado borrador: src/content/prompts/${slug}.json`);
} else if (command === 'publish') {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new Error('Indica un slug válido.');
  const file = path.join(root, `${slug}.json`);
  const entry = JSON.parse(fs.readFileSync(file, 'utf8'));
  entry.status = 'published';
  const errors = validateEntry(entry);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  fs.writeFileSync(file, JSON.stringify(entry, null, 2) + '\n');
  console.log(`Publicado en el catálogo local: ${slug}. Ejecuta npm run build y despliega dist/.`);
} else {
  throw new Error('Comandos: check, new, publish');
}
