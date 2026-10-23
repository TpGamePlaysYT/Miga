# Miga ✳

Biblioteca pública de prompts para **imágenes y videos**. Astro genera páginas HTML estáticas e indexables; no necesita base de datos, servidor de aplicación, registro ni servicios de pago. JavaScript ligero para búsqueda, filtros, copia, favoritos locales y reproducción bajo demanda. Plus Jakarta Sans se sirve localmente.

## Ejecutar

Requiere Node **22.12 o posterior** (se ha verificado con Node 24) y npm.

```sh
npm ci
npm run dev
```

El servidor de desarrollo usa el puerto **4321** y muestra las 30 propuestas iniciales: **20 imágenes y 10 videos**. La banda superior y cada ficha identifican los borradores. No son resultados generados en Flow.

En este entorno en la nube, si npm no puede escribir su caché predeterminada, usa `npm ci --cache /tmp/miga-npm`. Los comandos de Astro desactivan su telemetría mediante un lanzador compatible con Windows, Linux y macOS.

```sh
npm run build
npm run preview
```

La compilación de producción genera `dist/`. **Excluye los borradores, sus páginas y los archivos de `/media/` que no pertenezcan a una ficha publicada.** Al inicio no hay resultados probados, por lo que producción muestra un estado de catálogo en preparación. No publiques el servidor de desarrollo: contiene las propuestas sin probar.

## Tu contenido de Flow

1. Lee las ideas en [docs/CATALOGO.md](docs/CATALOGO.md), o explora las fichas en desarrollo.
2. Prueba un prompt en Flow; adapta el formato y la duración a las opciones reales de tu modelo.
3. Añade los archivos optimizados a `public/media/` y completa el JSON de la ficha.
4. Ejecuta `npm run content -- publish slug-de-la-ficha`, compila y vuelve a desplegar.

La guía completa, con ejemplo y campos obligatorios, está en **[docs/CONTENIDO.md](docs/CONTENIDO.md)**. No necesitas una API de Flow ni credenciales en el proyecto.

## Comandos

| Comando                                | Para qué sirve                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `npm run dev`                          | Desarrollo con borradores visibles                                                     |
| `npm run build`                        | Validación editorial + generación estática + exclusión de archivos no publicados       |
| `npm run preview`                      | Revisar la salida pública localmente                                                   |
| `npm run content -- check`             | Validar todo el catálogo sin modificarlo                                               |
| `npm run content -- new mi-idea image` | Crear una ficha de imagen; usa `video` para video                                      |
| `npm run content -- publish mi-idea`   | Validar y marcar una ficha como publicada localmente                                   |
| `npm run catalog:export`               | Regenerar el catálogo legible en Markdown                                              |
| `npm test`                             | Pruebas del esquema y requisitos de publicación                                        |
| `npm run test:e2e`                     | Pruebas funcionales y accesibilidad en Chromium                                        |
| `npm run test:production`              | Publicación aislada con fixtures y reproducción real; restaura el catálogo al terminar |
| `npm run check:release`                | Revisar dominio, datos del responsable y contenido antes del lanzamiento               |
| `npm run format`                       | Formatear código, estilos y documentación                                              |

Para los tests del navegador: `npx playwright install chromium`. En esta máquina ya hay Chromium: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` (igual para `test:production`). La prueba de producción usa el puerto 4322, añade fixtures temporales y reconstruye `dist/` al terminar; no la ejecutes a la vez que ediciones del catálogo o un despliegue.

## Publicar

Consulta **[docs/PUBLICACION.md](docs/PUBLICACION.md)**: dominio, alojamiento estático, metadatos, sitemap, páginas informativas y espacios de AdSense. La web está preparada para desplegar; esta entrega no crea una cuenta de alojamiento ni realiza un despliegue externo.

## Estructura

```text
src/content/prompts/   Una ficha JSON por idea
src/config/site.json  Datos públicos del responsable
src/components/       Tarjetas, catálogo, iconos y espacios publicitarios
src/layouts/          Plantillas, metadatos, navegación y pie
src/pages/            Portada, detalle, guardados, información, sitemap y robots
src/scripts/client.js Interacciones del navegador sin framework adicional
src/styles/           Estilos adaptables y accesibles
public/demo/          Ilustraciones originales de demostración (no Flow)
public/media/         Tus imágenes, portadas y videos finales
scripts/              Edición, validación, exportación y herramientas de compilación
tests/                Validación, pruebas de navegador y fixtures sintéticas
```

## Referencia visual y límites conocidos

Se ha seguido la identidad indicada: crema, lavanda, menta y durazno, Plus Jakarta Sans, tarjetas visuales y adaptación móvil. **No se pudo consultar el archivo de Figma**: el conector no estaba disponible y el enlace respondió 403. No se copiaron imágenes de Figma ni se afirma fidelidad exacta a sus pantallas. Las ilustraciones SVG propias están identificadas como muestras y no prueban el resultado de ningún prompt.

Los favoritos viven en este navegador, sin sincronización. La búsqueda recorre el catálogo visible en el cliente; es adecuada para esta primera colección. Para cientos o miles de fichas, añadir paginación e índice de búsqueda. La vista guardados no se indexa. El dominio de ejemplo impide indexación hasta configurar uno real. AdSense está inactivo y no envía solicitudes.

## Evidencia de la entrega

[Informe de verificación y capturas](docs/VERIFICACION.md): pruebas funcionales, accesibilidad, revisión móvil, reproducción de video y medición local de rendimiento. Los resultados de prueba sintéticos se retiraron del catálogo y de la salida pública.
