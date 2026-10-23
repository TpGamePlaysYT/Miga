import { sitePath } from '../lib/paths.js';
export function GET({ site }) {
  const body =
    import.meta.env.DEV || site.hostname === 'miga.example'
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\nDisallow: ${sitePath('/guardados/')}\nSitemap: ${new URL(sitePath('/sitemap.xml'), site).href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
