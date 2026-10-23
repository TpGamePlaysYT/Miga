/** Public URL for both a root domain and a GitHub Pages project subdirectory. */
export function sitePath(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!path.startsWith('/')) return path;
  if (base && (path === base || path.startsWith(base + '/'))) return path;
  return base + path;
}
