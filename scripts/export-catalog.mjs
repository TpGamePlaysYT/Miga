import fs from 'node:fs';
import { readEntries } from '../src/lib/content.mjs';
const entries = readEntries();
let text =
  '# Catálogo editorial de Miga\n\nGenerado desde `src/content/prompts/*.json` con `npm run catalog:export`. Edita los JSON, no esta copia.\n\nLas ideas iniciales son propuestas sin probar, no tendencias verificadas. Ninguna promete viralidad. Las ilustraciones de la web son demostraciones y no fueron producidas por estos prompts ni por Flow. Los formatos y las duraciones son sugerencias: registra las opciones realmente disponibles en tu versión del modelo.\n';
for (const type of ['image', 'video']) {
  const group = entries.filter((e) => e.type === type);
  text += `\n## ${type === 'image' ? 'Imágenes' : 'Videos'} (${group.length})\n`;
  for (const e of group) {
    text += `\n### ${e.title}\n\n- Ficha: \`src/content/prompts/${e.slug}.json\`\n- Estado: ${e.status}\n- Categoría: ${e.category}\n- Descripción: ${e.description}\n- Público: ${e.audience}\n- Uso: ${e.use}\n- Relación sugerida: ${e.aspectRatio}\n- Archivo propuesto: \`${e.proposedFilename}\`\n- Partes personalizables: ${e.customizable.join('; ')}.\n`;
    if (e.type === 'video')
      text += `- Acción: ${e.video.action}\n- Cámara: ${e.video.camera}\n- Duración sugerida: ${e.video.durationSeconds} segundos.\n`;
    text += `\n**Prompt para probar en Flow**\n\n${e.prompt}\n`;
  }
}
fs.writeFileSync('docs/CATALOGO.md', text);
console.log('Exportado docs/CATALOGO.md');
