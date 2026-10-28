# Reglas del Proyecto - Web-RadioNube

## 1. Sincronización Bilingüe Obligatoria (Español e Inglés)
- **Regla Principal:** Cada vez que el usuario solicite un cambio, edición o actualización en el sitio web (textos, planes, precios, características, componentes, enlaces, promociones, diseño o metatags), **el cambio debe aplicarse obligatoriamente y en paralelo en la versión en inglés** dentro de la carpeta `en/`.
- **Correspondencia de páginas espejo (1:1):**
  - `index.html` ⇄ `en/index.html`
  - `precios.html` ⇄ `en/precios.html`
  - `comparativa.html` ⇄ `en/comparativa.html`
  - `radio-planes-de-streaming.html` ⇄ `en/radio-planes-de-streaming.html`
  - `video-streaming.html` ⇄ `en/video-streaming.html`
  - `apps.html` ⇄ `en/apps.html`
  - `webs.html` ⇄ `en/webs.html`
  - `contacto.html` ⇄ `en/contacto.html`
  - `personal-data-and-general-privacy-agreement.html` ⇄ `en/personal-data-and-general-privacy-agreement.html`
  - `service-and-use-agreement.html` ⇄ `en/service-and-use-agreement.html`

## 2. Convenciones Técnicas de la Versión en Inglés (`en/`)
- **Rutas de recursos:** En todos los archivos dentro de `en/`, las rutas relativas a recursos locales deben usar el prefijo `../assets/` (imágenes, CSS, JS, vendor).
- **Selector de idioma y moneda:**
  - El selector de idioma desplegable (`.lang-selector`) debe permanecer pegado al selector de moneda (`.currency-selector`) en la barra de navegación, dentro del mismo contenedor flexible (`li`).
  - Representación visual: Menú desplegable (`<select>`) exclusivamente con banderas emoji (`🇪🇸` para Español y `🇺🇸` para Inglés), sin texto adicional.
  - En páginas en español (raíz): `<option value="es" selected>🇪🇸</option><option value="en">🇺🇸</option>`.
  - En páginas en inglés (`en/`): `<option value="es">🇪🇸</option><option value="en" selected>🇺🇸</option>`.
  - Atributos requeridos: manejado automáticamente por `assets/js/currency.js` para persistir parámetros y moneda.
- **Atributos de Moneda:** Preservar siempre los atributos de conversión de `currency.js` (`data-price-usd`, `data-currency-symbol`, `data-currency-code`, `data-currency-symbol-short`) en ambas versiones.
- **Analíticas y Chat:** Mantener el script de OpenPanel (`https://data.altomarketing.com.ar/op1.js`) y el widget de Chatwoot en el pie de página de todas las versiones.
