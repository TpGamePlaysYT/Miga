import fs from 'node:fs';
import path from 'node:path';
export const categories = ['Retratos', 'Productos', 'Mascotas', 'Gastronomía', 'Fondos', 'Cine'];
export const root = path.resolve('src/content/prompts');
export function readEntries(directory = root) {
  return fs
    .readdirSync(directory)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const entry = JSON.parse(fs.readFileSync(path.join(directory, f), 'utf8'));
      if (f !== `${entry.slug}.json`) throw new Error(`${f}: el nombre debe coincidir con slug.`);
      return entry;
    });
}
const nonempty = (x) => typeof x === 'string' && x.trim().length > 0;
export function validateEntry(e, { checkFiles = true, publicDir = path.resolve('public') } = {}) {
  const errors = [];
  for (const key of [
    'slug',
    'title',
    'description',
    'audience',
    'use',
    'prompt',
    'aspectRatio',
    'proposedFilename',
  ]) {
    if (!nonempty(e[key])) errors.push(`${key}: obligatorio`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug))
    errors.push('slug: usa minúsculas, números y guiones');
  if (!['image', 'video'].includes(e.type)) errors.push('type: image o video');
  if (!['draft', 'published'].includes(e.status)) errors.push('status: draft o published');
  if (!categories.includes(e.category)) errors.push('category: desconocida');
  if (!/^[1-9]\d*:[1-9]\d*$/.test(e.aspectRatio || ''))
    errors.push('aspectRatio: formato ancho:alto');
  if (!Array.isArray(e.customizable) || !e.customizable.length || !e.customizable.every(nonempty))
    errors.push('customizable: lista de cambios permitidos');
  if (!Array.isArray(e.tags) || !e.tags.length || !e.tags.every(nonempty))
    errors.push('tags: lista no vacía');
  if (e.type === 'video') {
    for (const k of ['action', 'camera'])
      if (!nonempty(e.video?.[k])) errors.push(`video.${k}: obligatorio`);
    if (!(e.video?.durationSeconds > 0 && e.video.durationSeconds <= 60))
      errors.push('video.durationSeconds: entre 1 y 60');
  }
  const r = e.result;
  if (!r || typeof r !== 'object') errors.push('result: obligatorio');
  if (e.status === 'published') {
    for (const key of ['file', 'exactPrompt', 'tool', 'model', 'notes', 'alt', 'testedAt']) {
      if (!nonempty(r?.[key])) errors.push(`result.${key}: obligatorio para publicar`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r?.testedAt || '') || !Number.isFinite(Date.parse(r?.testedAt)))
      errors.push('result.testedAt: fecha ISO válida');
    if (
      !r?.settings ||
      Array.isArray(r.settings) ||
      !Object.keys(r.settings).length ||
      !Object.values(r.settings).every((v) => nonempty(String(v ?? '')))
    )
      errors.push('result.settings: registra los ajustes reales');
    if (!/^[1-9]\d*:[1-9]\d*$/.test(r?.settings?.aspectRatio || ''))
      errors.push('result.settings.aspectRatio: relación de aspecto real obligatoria');
    if (r?.rightsConfirmed !== true)
      errors.push('result.rightsConfirmed: confirma derechos del archivo y referencias');
    if (e.type === 'video' && !nonempty(r?.poster))
      errors.push('result.poster: portada obligatoria');
    if (e.type === 'video' && !(Number(r?.settings?.durationSeconds) > 0))
      errors.push('result.settings.durationSeconds: duración real obligatoria');
  }
  for (const field of ['file', 'poster']) {
    const value = r?.[field];
    if (!value) continue;
    const extension =
      field === 'file' && e.type === 'video' ? /\.(mp4|webm)$/i : /\.(webp|avif|jpg|jpeg|png)$/i;
    if (!/^\/media\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(value) || !extension.test(value)) {
      errors.push(`result.${field}: usa un archivo local válido en /media/`);
    } else if (
      checkFiles &&
      (!fs.existsSync(path.join(publicDir, value)) ||
        fs.statSync(path.join(publicDir, value)).size === 0)
    ) {
      errors.push(`result.${field}: archivo inexistente o vacío`);
    }
  }
  return errors;
}
export function validateCatalog(entries, options) {
  const seen = new Set();
  const errors = [];
  for (const e of entries) {
    if (seen.has(e.slug)) errors.push(`${e.slug}: slug duplicado`);
    seen.add(e.slug);
    errors.push(...validateEntry(e, options).map((message) => `${e.slug}: ${message}`));
  }
  return errors;
}
