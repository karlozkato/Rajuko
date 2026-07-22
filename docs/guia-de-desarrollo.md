# Guía de desarrollo — RAJUKO

Reglas prácticas para mantener el código consistente a medida que el proyecto crece. Escrito pensando en que el código se escribe a mano, sin frameworks (ver el porqué en `decisiones-tecnicas.md`).

## Estructura de carpetas

```
RAJUKO/
├── backend/
├── docs/
├── frontend/
│   ├── index.html
│   ├── productos.html
│   ├── styles.css
│   └── images/
└── README.md
```

**Nota de limpieza pendiente:** el plan original del proyecto nombraba la carpeta de imágenes `imagenes/` (en español), pero el código actual referencia `./images/` (en inglés). No es un error — el sitio funciona — pero conviene decidir un solo idioma para nombres de carpetas/archivos y ser consistente en todo el proyecto antes de que crezca más.

## Reglas de HTML semántico

1. **Un solo `<h1>` por página.** En `index.html`, el h1 es el título del hero ("Vístete como eres."), no el nombre de marca en el header (ese va como texto normal dentro de un link).
2. **Jerarquía de encabezados correcta:** h2 para título de cada `<section>`, h3 para subtítulos dentro de esa sección (ej. nombre de producto, título de un `.why-item`). Nunca saltar de h2 a h4 sin pasar por h3.
3. **Etiqueta semántica antes que `<div>`**, siempre que exista una más específica:
   - Imagen de contenido con texto asociado → `<figure>`
   - Lista de enlaces → `<nav>` + `<ul>`
   - Producto individual → `<article>`
   - `<div>` se reserva para contenedores puramente de layout (grid/flexbox) sin significado propio — ejemplos válidos actuales: `.about-content`, `.footer-content`.
4. **`alt` en imágenes:**
   - Imagen decorativa (ej. marca de agua del isotipo en el hero) → `alt=""`
   - Imagen con significado que no está repetido en texto cercano (ej. isotipo grande en "Bienvenidos") → `alt` descriptivo
   - Si el texto ya está al lado (ej. logo + nombre agrupados en el header) → `alt=""` en la imagen, para no duplicar la lectura en lectores de pantalla

## Convenciones de CSS

- Todo color, tipografía o radio de borde se referencia desde las variables en `:root` — nunca un hex suelto en medio del CSS.
- Nombres de clase: `seccion-elemento` (ej. `.hero-eyebrow`, `.about-visual`, `.footer-links`). No se usa BEM estricto, pero sí este patrón consistente de "de dónde viene, qué es".
- Componentes reutilizables ya definidos — usarlos en vez de crear estilos nuevos parecidos:
  - `.card` → cualquier tarjeta con imagen/ícono + título + texto (productos, "¿Por qué RAJUKO?")
  - `.section-eyebrow` → etiqueta pequeña en mayúsculas arriba de un h2 (ya usado en "Bienvenidos", "¿Por qué RAJUKO?" pendiente de aplicar ahí también si se decide, Newsletter, Contacto)

## Variables CSS actuales (`:root`)

```css
--color-primario: #F36D96;
--color-secundario: #2A2A2A;
--color-texto: #F5F5F5;
--color-fondo: #0D0D0D;
--color-texto-secundario: #B8B8B8;
--color-de-exito: #48C774;
--color-de-errores: #FF4F6A;
--fuente-principal: 'Inter', sans-serif;
--border-radius: 12px;
```

## Cómo agregar un nuevo producto

1. Foto del producto en `frontend/images/`
2. Dentro de `.products-grid`, agregar:
```html
<article class="card">
  <img src="./images/NOMBRE-DEL-ARCHIVO.jpg" alt="Nombre del producto">
  <h3>Nombre del producto</h3>
  <p>Descripción corta</p>
</article>
```
3. No hace falta tocar CSS — `.card` ya está definida y `.products-grid` acomoda automáticamente los ítems nuevos.

## Cómo agregar una nueva sección a la landing

Checklist antes de darla por terminada:
- [ ] Usa `<section>` con un `id` único y descriptivo
- [ ] Tiene un solo `h2` (nunca h1)
- [ ] Usa las variables de color/tipografía existentes, no valores nuevos sueltos
- [ ] Si tiene título + texto de introducción, evaluar si aplica el patrón `.section-eyebrow`
- [ ] Revisar cómo se ve en mobile antes de continuar con la siguiente sección (evitar acumular deuda responsive — ver Etapa 6 en `roadmap.md`)
- [ ] Si agrega un link de navegación nuevo (ej. en el nav o el footer), confirmar que el `id` de destino existe y apunta al lugar correcto

## Checklist de SEO por página

Aplica a cada archivo `.html` nuevo (ej. cuando se construya `productos.html`):
- [ ] `<title>` único
- [ ] `<meta name="description">` única
- [ ] Un solo `<h1>`
- [ ] Jerarquía correcta de encabezados
- [ ] `alt` en todas las imágenes
- [ ] Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`)

## Tips de testing

- Después de cambios en CSS: refresco forzado (`Ctrl+Shift+R`), no refresco normal.
- El favicon se cachea de forma más terca que el resto del CSS — si no se actualiza, agregar un parámetro falso a la ruta (`?v=2`, `?v=3`...) o probar en ventana de incógnito para confirmar si es caché o error real.
- Antes de reportar "no veo el cambio": confirmar con Ver código fuente (`Ctrl+U`) que el código realmente se guardó como se esperaba.
