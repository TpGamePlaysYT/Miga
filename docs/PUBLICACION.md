# Publicar Miga

## Configurar el dominio y los datos públicos

Copia `.env.example` a `.env` y cambia `SITE_URL` por el origen HTTPS definitivo, sin rutas. También puedes definir esa variable en tu alojamiento. No contiene secretos. Astro genera canonical, Open Graph, sitemap y robots usando ese dominio.

El dominio predeterminado `https://miga.example` produce `noindex` y `Disallow: /` deliberadamente. En desarrollo también se bloquea la indexación. Con un dominio real, producción permite indexar páginas públicas y excluye guardados. Los borradores nunca entran en el sitemap, ni siquiera en desarrollo.

Completa `src/config/site.json`: nombre del responsable, correo de contacto público, proveedor de alojamiento, conservación de registros y jurisdicción. Privacidad y términos leen esos valores. Revisa sus textos para que describan tu operación real; no se han inventado datos del titular.

```sh
npm ci
npm run content -- check
npm test
npm run check:release
npm run build
npm run preview
```

`check:release` avisará hasta que añadas tu dominio, tus datos y al menos un resultado probado. Esto no impide desarrollar ni compilar la primera versión con catálogo vacío.

## Alojamiento estático

En Netlify, Cloudflare Pages o un proveedor equivalente:

- Repositorio: este proyecto; directorio raíz: el de `package.json`.
- Node: 24 (o 22.12+).
- Instalación: `npm ci`.
- Compilación: `npm run build`.
- Salida pública: `dist`.
- Variable: `SITE_URL=https://tu-dominio-real`.
- Configura el dominio personalizado y HTTPS en el proveedor.

No hace falta un adaptador de servidor ni una base de datos. No habilites una reescritura de SPA hacia `index.html`: cada página ya tiene su propio HTML. `dist/404.html` es la página de error; comprueba que tu proveedor responda **404**, no 200, cuando falte una ruta. En un despliegue manual, sube exclusivamente `dist/`, reemplazando la versión anterior. No subas `.env`, `src`, `tests` ni `node_modules`.

El despliegue con subcarpeta (por ejemplo, GitHub Pages bajo `/Miga/`) necesita adaptar `base` y los enlaces absolutos. La configuración actual se publica en la raíz de un dominio.

Comprueba después del despliegue:

1. Portada, ficha publicada y páginas informativas responden.
2. Buscar, filtrar, copiar y guardar funcionan. Clipboard necesita HTTPS o un origen local seguro; hay alternativa de copia manual si el navegador lo bloquea.
3. El video no se descarga antes de pulsar reproducir; después reproduce con controles.
4. Un borrador responde 404 y no aparece en `/sitemap.xml`.
5. `/robots.txt` incluye tu sitemap real, y los canonical usan tu dominio.
6. No quedan archivos ni rutas de publicaciones retiradas de la versión anterior.

## Espacios para AdSense

Hay dos posiciones en `src/components/AdSlot.astro`: `catalog-bottom` (tras el catálogo) y `prompt-bottom` (tras el detalle). **Están ocultas, no reservan espacio vacío y no cargan scripts ni cookies de publicidad.** No hay IDs ficticios, enlaces de afiliado ni un `ads.txt` que atribuya una cuenta inventada.

Cuando tengas tu cuenta:

1. Verifica el dominio en AdSense y obtén tu identificador `ca-pub-…` y los IDs reales de esos dos bloques.
2. Incorpora el loader oficial una sola vez en `Layout.astro` y el bloque responsive oficial en `AdSlot.astro`. Retira `hidden` solo para las posiciones activas; etiqueta cada espacio como «Publicidad» y reserva su altura para evitar saltos.
3. Añade a `public/ads.txt` exactamente la entrada que te proporcione tu cuenta.
4. Actualiza privacidad y configura la solución de consentimiento exigida por AdSense para el público al que sirvas anuncios. Haz que esa solución controle cuándo se carga el loader.
5. Verifica peticiones, consentimiento y estabilidad visual en producción.

La cuenta y el flujo de consentimiento no están configurados en esta primera versión. Poner un ID en un comentario no activará anuncios accidentalmente.

## Rendimiento y mantenimiento

Las páginas se prerenderizan; no hay React ni librerías de interfaz en el cliente. Fuentes WOFF2 locales; imágenes del catálogo con carga diferida y dimensiones declaradas; video bajo demanda. Las ilustraciones vectoriales son locales. Optimiza cada archivo de Flow antes de publicarlo, porque su tamaño determinará gran parte del rendimiento real.

Activa compresión Brotli/gzip en el alojamiento y caché larga para los archivos con hash de `/_astro/`. Usa nombres nuevos al sustituir archivos de `/media/` si el proveedor mantiene caché. Las rutas y HTML deben poder actualizarse con cada despliegue.

La prueba `npm run test:production` publica temporalmente un video sintético de test, comprueba reproducción, metadatos y exclusión de borradores, retira todo y reconstruye. No representa un resultado de Flow ni deja una ficha ficticia publicada.

No se ha publicado un sitio externo desde esta sesión. Debes conectar tu alojamiento y configurar el dominio antes de ese paso.
