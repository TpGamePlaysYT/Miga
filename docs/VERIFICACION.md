# Verificación de esta entrega

La primera versión está implementada y funciona en el entorno de desarrollo. No se ha desplegado a un alojamiento externo ni se han generado resultados en Google Flow.

## Comprobaciones completadas

| Comprobación                          | Resultado                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Instalación reproducible con `npm ci` | Correcta con el lockfile incluido                                                              |
| Validación editorial                  | 30 fichas: 20 imágenes y 10 videos, todas en borrador                                          |
| Pruebas de contenido                  | 8 aprobadas, 0 fallidas, 0 omitidas                                                            |
| Pruebas de navegador en Chromium      | 10 aprobadas, 0 fallidas, 0 omitidas                                                           |
| Construcción estática                 | Correcta; 7 páginas HTML, sitemap y robots; sin rutas de borradores                            |
| Publicación de prueba                 | Ruta, canonical, sitemap y prompt exacto verificados con una ficha sintética temporal          |
| Video bajo demanda                    | Sin solicitud de MP4 antes del clic; después se verificó reproducción real y controles nativos |
| Archivos de borradores                | Se comprobó que los archivos asociados únicamente a borradores no permanecen en `dist/media/`  |
| AdSense                               | Espacios ocultos; no se carga publicidad                                                       |

Las pruebas de navegador comprueban búsqueda sin distinción de acentos, combinación de filtros, orden, estado en la URL, guardados persistentes y sincronizados entre pestañas, errores de almacenamiento, copia exacta al portapapeles, las 30 rutas de detalle, navegación móvil y páginas informativas.

Se ejecutó axe con reglas WCAG 2 A/AA y 2.1 AA en portada, detalle y guardados a 1440 y 390 px: sin infracciones detectadas en esas comprobaciones. Esto no equivale a una certificación completa ni sustituye pruebas con usuarios o lectores de pantalla reales.

## Revisión visual

Se revisaron capturas reales de Chromium. Se corrigió un desbordamiento a 320 px y se comprobó que portada y detalle no desbordan a 320, 390, 768, 1024 y 1440 px. El público y el uso de cada idea también se muestran en móvil.

- [Portada de escritorio](capturas/portada-escritorio.png)
- [Detalle de escritorio](capturas/detalle-escritorio.png)
- [Portada móvil](capturas/portada-movil.png)
- [Catálogo móvil](capturas/catalogo-movil.png)
- [Detalle móvil](capturas/detalle-movil.png)

Las capturas muestran el modo de desarrollo con borradores e ilustraciones de demostración. No representan una biblioteca de resultados de Flow ya publicados.

## Rendimiento

Lighthouse local sobre la portada de producción, con el catálogo aún vacío y sin archivos de Flow:

| Medida                   | Resultado |
| ------------------------ | --------- |
| Rendimiento              | 100       |
| Accesibilidad            | 100       |
| Buenas prácticas         | 100       |
| SEO                      | 69        |
| First Contentful Paint   | 1,2 s     |
| Largest Contentful Paint | 1,4 s     |
| Total Blocking Time      | 0 ms      |
| Cumulative Layout Shift  | 0,005     |

El resultado SEO refleja el bloqueo de indexación deliberado del dominio `miga.example`. Hay canonical, metadatos, sitemap y robots; antes del lanzamiento se debe configurar `SITE_URL` con el dominio real. Las medidas son una prueba local, no datos de usuarios reales ni una garantía para el alojamiento definitivo. Repite la medición cuando añadas tus archivos.

El JavaScript de interacción compilado ocupa aproximadamente 6,8 KB sin comprimir (2,6 KB con gzip); el CSS, unos 29 KB (6,9 KB con gzip). Las fuentes son locales y los videos solo se solicitan tras una acción del visitante.

## Pendiente para lanzar al público

`npm run check:release` informa correctamente de estos datos aún pendientes:

- Dominio real en `SITE_URL`.
- Identidad, contacto, proveedor de alojamiento, conservación de registros y jurisdicción en `src/config/site.json`.
- Al menos una ficha con un resultado realmente probado y documentado en Flow.

La comprobación de lanzamiento pendiente no impide desarrollar ni compilar. Producción muestra un catálogo en preparación mientras no se publiquen resultados reales.

El diseño de Figma no pudo consultarse: no había un conector disponible y el enlace devolvió un bloqueo 403. La interfaz sigue la identidad escrita por el propietario, pero no se ha contrastado con las pantallas del archivo. Las ilustraciones son originales de demostración, no imágenes extraídas de Figma ni generaciones de Flow.

Se guardaron `install_script` y `start_skill` como borrador de la configuración del entorno. Guardar ese borrador no despliega la web ni publica una versión del entorno. Para reutilizarlo, revisa y guarda los cambios en ajustes y publica el entorno desde el producto.

## Actualización: referencias y GitHub Pages

- Reescritas las 30 propuestas con referencias explícitas y dirección fotográfica más detallada. Los cuatro retratos de imagen cubren estudio profesional, verano mediterráneo, ciudad nocturna y montaña; se recopilan en `docs/RETRATOS.md`.
- Cámara, óptica, exposición y resolución se describen como objetivos visuales, no como metadatos reales ni garantías de la herramienta. Todos los resultados siguen pendientes y las fichas conservan `draft`.
- Añadido soporte de `BASE_PATH=/Miga/` para enlaces, imágenes, videos, recursos, sitemap, robots, canonical y Open Graph.
- Prueba de publicación ejecutada con la subruta `/Miga/`: carga de estilos y portada, navegación, canonical, sitemap, guardados y reproducción real de un MP4 sintético correctos. Las fixtures se retiraron y la salida se reconstruyó.
- Las 8 pruebas de contenido y las 10 pruebas de navegador volvieron a pasar. Se corrigió el arranque de Playwright desde cero: su servidor ahora usa la API de Astro en primer plano, independientemente del modo de segundo plano de la CLI. La tanda se ejecutó con `CI=1`.
- Preparado `.github/workflows/pages.yml` para desplegar `main` mediante las acciones oficiales de Pages. La activación remota y el éxito de ese workflow no están confirmados: el proxy bloquea la API de GitHub y el subdominio público. El propietario debe seleccionar **GitHub Actions** en **Settings → Pages** y comprobar el resultado en Actions.
- El prototipo de Figma volvió a responder con un 403 del proxy antes de alcanzar Figma; no había herramientas para acceder a la pestaña compartida. No se afirma que esta revisión haya contrastado el archivo visual.

Las capturas y la medición de Lighthouse de las secciones anteriores documentan la primera entrega; no se presentan como mediciones nuevas tras esta actualización de textos y rutas.

## Revisión con las capturas de Figma y diagnóstico de Pages

Se adaptaron la paleta crema/lavanda/menta/durazno, marca, anuncio superior, portada con búsqueda y collage, colecciones, pasos, pie y panel blanco del prompt a las capturas aportadas por el propietario. Se mantienen solo imágenes y videos. Las ilustraciones SVG son demostraciones, no resultados de Flow ni fotografías extraídas del diseño. Las capturas de portada y detalle en escritorio y móvil de `docs/capturas/` muestran la revisión actual en desarrollo, con borradores visibles.

Validación: 8 pruebas de contenido y 10 pruebas de navegador correctas, incluida accesibilidad. Compilación correcta para `https://tpgameplaysyt.github.io/Miga/`. Revisión visual en 1440 y 390 px.

El repositorio ya es público. La consulta de Pages devuelve `build_type: legacy`, rama `main`, carpeta `/`: sirve los fuentes y explica el 404 al no existir un index.html allí. El cambio por API a `workflow` está bloqueado por permisos de la integración (403). Una consulta posterior ya confirmó `build_type: workflow` y el despliegue de la revisión se inició desde `main`. Consultar `PUBLICACION.md` para resolver futuras configuraciones incorrectas.

Despliegue confirmado: [ejecución 39901885815](https://github.com/TpGamePlaysYT/Miga/actions/runs/39901885815), trabajos build y deploy correctos. La portada pública https://tpgameplaysyt.github.io/Miga/ respondió HTTP 200 con el diseño actualizado.
