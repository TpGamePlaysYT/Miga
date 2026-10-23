# Añadir tus resultados de Google Flow

El catálogo vive en `src/content/prompts/`. Cada JSON es una ficha y su nombre coincide con `slug`. Es una edición en archivos: se puede usar cualquier editor o la interfaz de archivos de GitHub, sin montar un CMS.

## Probar una de las 30 ideas

1. Ejecuta `npm run dev` y abre una ficha. También tienes todos los textos en [CATALOGO.md](CATALOGO.md).
2. Copia el prompt y adáptalo en Flow. Las relaciones de aspecto y los 8 segundos de video son **sugerencias**, no garantías de compatibilidad. Si el modelo no las admite, usa una opción disponible y anota la diferencia.
3. Usa solo referencias autorizadas. Comprueba anatomía, movimiento, texto, marcas y coherencia antes de dar por bueno el resultado.
4. Descarga la generación. Conserva el original fuera de `public/`; coloca únicamente las versiones que deseas servir dentro de `public/media/`.
5. Para imágenes, preferir WebP o AVIF, ancho aproximado de 1200–1600 px y peso ideal inferior a 300 KB. JPG y PNG también se aceptan. Para videos, MP4 H.264 con `faststart` o WebM; clips breves, preferiblemente menos de 8 MB. Añade siempre una portada WebP, AVIF, JPG o PNG. No subas archivos fuente pesados a la salida pública.

Los nombres propuestos son sugerencias; puedes cambiarlos. Las rutas deben usar letras, números, guiones, guiones bajos y carpetas, sin espacios ni acentos. Ejemplo: `public/media/miga-serum-luz-de-manana.webp` se referencia como `/media/miga-serum-luz-de-manana.webp`.

## Registrar lo que ocurrió realmente

Abre el JSON de la ficha y completa `result`. **No copies el nombre de un modelo de este ejemplo**: registra el que te muestra Flow. El validador no puede comprobar si una generación ocurrió: la exactitud de los datos es una responsabilidad editorial.

```json
{
  "file": "/media/miga-serum-luz-de-manana.webp",
  "poster": null,
  "exactPrompt": "Pega aquí, literalmente, el texto final enviado al generador.",
  "tool": "Google Flow",
  "model": "Nombre y versión que aparezcan en tu sesión",
  "settings": {
    "aspectRatio": "4:5",
    "resolution": "Dimensiones reales del archivo",
    "reference": "Sin referencia, o descripción de la referencia autorizada"
  },
  "notes": "Qué funciona, qué no y qué diferencias hay frente a la idea. Registra también el audio si existe.",
  "alt": "Descripción concreta del archivo final para quien no pueda verlo",
  "testedAt": "2026-10-22",
  "rightsConfirmed": true
}
```

Es un ejemplo de estructura, **no evidencia de una generación real**. Sustituye la fecha, el modelo, el texto y todos los ajustes por los de tu prueba. `rightsConfirmed` solo debe ser `true` cuando hayas comprobado los derechos necesarios sobre el archivo y las referencias. Nunca pongas claves API, contraseñas ni datos privados en el catálogo: las fichas publicadas son públicas.

Para video, usa `file` con extensión `.mp4` o `.webm`, `poster` con la ruta de su portada y agrega `durationSeconds` **real** a `settings`. Conserva la acción y la cámara sugeridas en `video`; documenta cualquier diferencia observada en `result.notes`. Se muestra primero la portada, y el navegador solicita el archivo únicamente después del clic. Los controles nativos permiten pausar y ajustar volumen. Las propuestas iniciales no incluyen diálogo; si incorporas habla, prepara subtítulos y una transcripción antes de publicar ese contenido.

`prompt`, `aspectRatio`, `video` y `proposedFilename` conservan la **propuesta**. `result.exactPrompt`, `result.settings`, `result.file` y las notas registran la **prueba real**. La ficha pública copia el prompt exacto y muestra formato/duración reales, no los sugeridos.

## Publicar una ficha

```sh
npm run content -- check
npm run content -- publish serum-luz-de-manana
npm run build
npm run preview
```

El comando rechaza fichas sin archivo local existente, prompt exacto, herramienta, modelo, formato real, notas, texto alternativo, fecha o confirmación de derechos. Los videos también necesitan portada y duración real. Si pasa, solo cambia `status` a `published`; **no sube nada a Internet**. Revisa el resultado y despliega `dist/` o sube tus cambios al repositorio si conectaste un alojamiento con despliegue automático.

Los borradores se muestran con `npm run dev`. No tienen rutas en producción ni aparecen en su sitemap. La compilación elimina de `dist/media/` los archivos que no estén referenciados por fichas publicadas, incluso si existen localmente en `public/media/`. Guarda todos los resultados dentro de `/media/` para que esta protección se aplique; no uses otras carpetas públicas para borradores.

Para retirar una ficha, cambia `status` a `draft` y reconstruye/despliega. El alojamiento debe reemplazar la salida anterior, no mezclarla: de otro modo pueden quedar archivos antiguos. No reutilices el slug para una idea diferente, porque los guardados usan ese identificador.

## Añadir y editar

```sh
npm run content -- new mi-nueva-idea image
npm run content -- new mi-nueva-escena video
```

El comando no sobrescribe una ficha existente. Completa título, descripción, categoría, público, uso, prompt, formato, etiquetas, partes personalizables y nombre propuesto. Categorías: `Retratos`, `Productos`, `Mascotas`, `Gastronomía`, `Fondos`, `Cine`. No existe contenido de sitios web.

Edita los JSON, valida y recarga el navegador. Si has añadido o retirado una ruta y el servidor no la encuentra, reinicia `npm run dev`. Regenera la copia documental con `npm run catalog:export`. Mantén `status: draft` durante las pruebas; no uses publicaciones ficticias para rellenar la portada.

## Optimización opcional con ffmpeg

No se necesita ffmpeg para ejecutar Miga. Si lo tienes, puedes preparar derivados sin alterar el original:

```sh
ffmpeg -i original.mp4 -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart -c:a aac public/media/mi-escena.mp4
ffmpeg -i original.mp4 -ss 00:00:01 -frames:v 1 public/media/mi-escena-portada.webp
```

Registra en las notas cualquier recorte, compresión o cambio de audio relevante. No identifiques una ilustración de `public/demo/` como resultado de Flow: solo sirve para diseñar la interfaz.
