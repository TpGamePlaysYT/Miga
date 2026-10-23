import { getCatalog } from '../lib/catalog.js';
export function GET({ site }) {
  const pages = [
    '/',
    '/como-funciona/',
    '/acerca/',
    '/privacidad/',
    '/terminos/',
    ...getCatalog()
      .filter((e) => e.status === 'published')
      .map((e) => `/prompts/${e.slug}/`),
  ];
  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((path) => `<url><loc>${escape(new URL(path, site).href)}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
