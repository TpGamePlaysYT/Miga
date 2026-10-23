import fs from 'node:fs';
import { readEntries, validateCatalog } from '../src/lib/content.mjs';
try {
  process.loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const issues = [];
try {
  const url = new URL(process.env.SITE_URL || '');
  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/' ||
    /(?:\.example|\.test|localhost)$/.test(url.hostname)
  )
    issues.push('SITE_URL: configura tu dominio HTTPS real, sin ruta.');
} catch {
  issues.push('SITE_URL: falta el dominio HTTPS real.');
}
const info = JSON.parse(fs.readFileSync('src/config/site.json', 'utf8'));
for (const key of ['ownerName', 'contactEmail', 'hostingProvider', 'logRetention', 'jurisdiction'])
  if (!info[key]?.trim()) issues.push(`src/config/site.json: completa ${key}.`);
if (info.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.contactEmail))
  issues.push('contactEmail: revisa el formato.');
const entries = readEntries();
issues.push(...validateCatalog(entries));
if (!entries.some((e) => e.status === 'published'))
  issues.push(
    'Catálogo público vacío: publica al menos un resultado probado para lanzar la biblioteca.',
  );
if (issues.length) {
  console.error(
    'Pendiente antes del lanzamiento público:\n' + issues.map((s) => '• ' + s).join('\n'),
  );
  process.exitCode = 1;
} else
  console.log(
    'Configuración de lanzamiento completa. Ejecuta las pruebas, revisa dist/ y despliega.',
  );
