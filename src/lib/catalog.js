import { readEntries, validateCatalog, categories } from './content.mjs';
export { categories };
export const isDevelopment = import.meta.env.DEV;
export function getCatalog() {
  const entries = readEntries();
  const errors = validateCatalog(entries);
  if (errors.length) throw new Error(errors.join('\n'));
  return entries.filter((e) => isDevelopment || e.status === 'published');
}
export const typeLabel = (type) => (type === 'video' ? 'Video' : 'Imagen');
export const cover = (e) =>
  e.result.poster ||
  (e.type === 'image' && e.result.file) ||
  `/demo/${{ Retratos: 'portrait', Productos: 'product', Mascotas: 'cat', Gastronomía: 'food', Fondos: 'landscape', Cine: 'cinema' }[e.category]}.svg`;
export const isDemo = (e) => !(e.result.poster || (e.type === 'image' && e.result.file));
