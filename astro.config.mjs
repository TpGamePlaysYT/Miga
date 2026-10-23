import { defineConfig } from 'astro/config';
try {
  process.loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const site = process.env.SITE_URL || 'https://miga.example';
const base = process.env.BASE_PATH || '/';
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base))
  throw new Error('BASE_PATH debe ser / o una ruta como /Miga/.');
if (new URL(site).protocol !== 'https:' || new URL(site).pathname !== '/') {
  throw new Error('SITE_URL debe ser un origen HTTPS, sin ruta.');
}
export default defineConfig({
  site,
  base,
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  server: { host: '0.0.0.0', port: 4321 },
});
