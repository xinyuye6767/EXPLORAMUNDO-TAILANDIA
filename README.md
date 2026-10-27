# SIAM / 27 — web del viaje a Tailandia

Proyecto multipágina de HTML, CSS y JavaScript para presentar y organizar el viaje escolar a Tailandia en 2027.

## Contenido

- `index.html`: portada y cuenta atrás.
- `ruta.html`: mapa y recorrido de siete días.
- `preparativos.html`: checklist, vuelos y alojamientos.
- `financiacion.html`: artículos, cálculo de cantidades y resumen de selección.
- `bitacora.html`: ideas para la bitácora, filtros y notas personales.
- `proyecto.html`: diseño, tecnologías y decisiones del proyecto TIC.
- `css/style.css`: identidad visual, temas y adaptación a distintos tamaños de pantalla.
- `js/main.js`: navegación, cuenta atrás, checklist, catálogo, bitácora y mapa.
- `js/config.js`: enlaces a los formularios y clave pública de CARTO Basemaps.
- `js/theme-init.js`: recupera el tema guardado antes de cargar los estilos.
- `assets/symbol.svg`: símbolo del proyecto.
- `.nojekyll`: archivo auxiliar para la publicación estática.

## Publicar

1. Descomprime el ZIP y abre la carpeta `siam_27_site`.
2. Sube el contenido de esa carpeta a la raíz del repositorio, de forma que `index.html`, `.nojekyll`, `css/`, `js/` y `assets/` queden directamente en la raíz.
3. En GitHub, entra en **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**, elige la rama donde subiste los archivos (normalmente `main`) y selecciona `/(root)`.
5. Pulsa **Save** y abre la dirección que indique GitHub cuando termine la publicación.

## Formularios

La página de aportaciones puede abrir el formulario de pedidos y la bitácora incluye un botón para enviar propuestas. Edita `js/config.js` y utiliza las URL HTTPS reales de los formularios de Microsoft Forms:

```js
window.SIAM_CONFIG = {
  diaryProposalFormUrl: "https://forms.office.com/r/ENLACE_PROPUESTAS",
  orderFormUrl: "https://forms.office.com/r/ENLACE_PEDIDOS",
  cartoBasemapsApiKey: "PEGA_AQUI_LA_CLAVE_PUBLICA_DE_CARTO_BASEMAPS"
};
```

El botón de propuestas abre el formulario indicado. Las respuestas se revisan en Microsoft Forms: un miembro del grupo decide cuáles se aprueban y añade manualmente las aceptadas a `bitacora.html`. Esta revisión no publica entradas automáticamente. No incluyas contraseñas, claves privadas ni datos personales en archivos JavaScript, porque el código del sitio es público.

## Clave del mapa de CARTO

En `js/config.js`, pega la clave en `cartoBasemapsApiKey`. El mapa la añade automáticamente a las peticiones de teselas con el parámetro `key`. Sin una clave, CARTO puede mostrar una marca de agua de clave requerida.

Como el sitio se publica en GitHub Pages, esta clave será visible para cualquier visitante. Utiliza únicamente una **clave de CARTO Basemaps para mapas web**, no una clave maestra ni una clave privada de APIs de cuenta. En el panel de CARTO, limita su uso por Referer al dominio concreto de GitHub Pages del grupo y conserva la atribución de OpenStreetMap y CARTO en el mapa.

## Funciones

La navegación, el selector de tema, la cuenta atrás, la checklist, el cálculo del catálogo, los filtros de la bitácora y las notas funcionan en el navegador. La preferencia de tema se guarda en `localStorage` con una cookie de respaldo; el progreso de la checklist y las notas personales se guardan localmente; no se sincronizan entre usuarios o dispositivos. El catálogo genera un resumen que se puede copiar.

El mapa usa Leaflet y cartografía de CARTO/OpenStreetMap, y algunas imágenes se cargan desde Unsplash. Estos recursos necesitan conexión a Internet. Si el mapa no carga, la guía de paradas y el itinerario siguen disponibles en la página.

## Edición

El itinerario, los vuelos, los alojamientos, los artículos, los precios y la fecha de la cuenta atrás se pueden modificar directamente en los archivos HTML o JavaScript correspondientes. El sitio original indicaba Qatar Airways, ruta Madrid–Doha–Bangkok, equipaje de 23 kg, Rambuttri Village Plaza y Night Bazaar Inn. La ruta está organizada en siete jornadas para incluir la llegada, cinco días de actividades y el regreso.

Para probar el sitio localmente, puede abrirse `index.html` en el navegador. Para comprobar el mapa con un servidor local sencillo, ejecuta desde esta carpeta:

```bash
python -m http.server 8000
```

Después, abre `http://localhost:8000`.
