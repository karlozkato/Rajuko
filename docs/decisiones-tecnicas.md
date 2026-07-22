# Decisiones técnicas — RAJUKO

Registro de decisiones técnicas tomadas durante el desarrollo, con el motivo detrás de cada una. El objetivo de este documento es que, si alguien retoma el proyecto después de un tiempo (incluyendo el propio autor), no tenga que adivinar por qué algo se hizo de cierta forma.

## Stack actual

**HTML5 + CSS3 escritos a mano, sin frameworks ni preprocesadores.**

Motivo: el proyecto empezó como trabajo de jovenes creativos con el objetivo explícito de construir una base sólida y entender cada decisión, no de ensamblar piezas de un framework. Esto se mantiene mientras el proyecto siga en fase de frontend estático (Etapas 1-3 del roadmap). La introducción de JavaScript (Etapa 5) y backend (Etapa 7) son decisiones técnicas todavía abiertas.

## HTML semántico

Se prioriza usar la etiqueta más específica disponible (`header`, `nav`, `main`, `section`, `article`, `figure`, `footer`) antes que `<div>` genérico, y reservar `<div>` para contenedores puramente de layout sin significado semántico propio.

Motivo: impacta directamente en SEO (cómo los buscadores interpretan la estructura de la página) y en accesibilidad (cómo un lector de pantalla anuncia el contenido) — ambos objetivos explícitos del proyecto desde el inicio.

## Sistema de variables CSS

Todos los colores, la tipografía principal y el radio de borde están centralizados en `:root`. Ningún valor de color se escribe suelto en otro punto del CSS.

Motivo: consistencia visual garantizada y cambios de marca (ej. ajustar un tono de rosa) se hacen en un solo lugar en vez de buscar por todo el archivo.

## Componentes reutilizables

- **`.card`**: definida una sola vez, usada tanto en la cuadrícula de productos como en los 3 bloques de "¿Por qué RAJUKO?". Evita reescribir estilos de tarjeta cada vez que aparece un patrón de "imagen/ícono + título + texto".
- **`.section-eyebrow`**: etiqueta pequeña en mayúsculas sobre un `h2`, reutilizada en varias secciones para dar jerarquía visual sin inventar un patrón nuevo cada vez.

## Header: sticky + glassmorphism

El header usa `position: sticky` con `backdrop-filter: blur()` y fondo semitransparente, en vez de un panel sólido.

Motivo: referencia directa a Apple y Nothing (citadas como inspiración explícita en el proyecto), y le da al header una sensación premium en vez de un panel plano genérico.

## Efecto glitch en interacciones

Se probaron dos versiones del hover del nav/botón:

1. **Primera versión:** split de color rosa + cian (`#4DE1E8`), simulando el clásico glitch de VHS/CRT (rojo/cian).
2. **Descartada** porque el cian no pertenece a la paleta oficial de marca y visualmente no encajaba.
3. **Versión actual:** split de `--color-primario` (rosa) + blanco (`--color-texto`), manteniendo el efecto de "desincronización" visual sin introducir un color ajeno a la identidad.

## Marca de agua del isotipo en el hero

El hero incluye el isotipo como elemento decorativo de fondo, con opacidad muy baja (`opacity: 0.06`) y `position: absolute`, para dar profundidad sin depender de fotografía de producto (que aún no existe). Se reutiliza un asset ya existente de la marca en vez de usar imágenes de stock genéricas.

**Estado:** en implementación — se identificó que el isotipo está apareciendo en más lugares del HTML de los esperados. Pendiente de diagnóstico (ver `reuniones.md`, última sesión, para el detalle del reporte).

## SEO técnico implementado

- `<meta name="description">` en `index.html`
- Favicon usando el isotipo (versión recortada, ver `identidad-de-marca.md`)
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`) para que el link se vea bien al compartirse en redes/WhatsApp

Pendiente: sitemap.xml, robots.txt, datos estructurados (schema.org) — se dejan para la Etapa 8 (Lanzamiento) del roadmap, cuando el sitio tenga dominio propio y esté listo para indexarse de verdad.

## Manejo de imágenes de marca

El archivo original del isotipo tenía márgenes transparentes amplios alrededor del dibujo. Se generó una versión recortada usando el canal alpha del PNG (no el color de fondo — el archivo tenía un gris no perceptible a simple vista bajo la transparencia, lo cual causó que un primer intento de recorte por color fallara). La versión recortada es la que debe usarse de aquí en adelante en todo el sitio.

## Decisiones técnicas abiertas (pendientes de definir)

- **Responsive:** no se ha definido un set de breakpoints formal. Existen 2 media queries puntuales (768px) en secciones específicas, no una estrategia mobile-first aplicada a todo el sitio.
- **JavaScript:** sin decidir si será vanilla JS o si se introducirá alguna librería liviana para carrito/filtros (Etapa 5).
- **Backend:** stack no definido aún (Etapa 7).
- **Fase 2 (personalización):** requiere decisiones técnicas propias — autenticación, integración con APIs externas (música, gaming), modelo de datos de preferencias estéticas. Se documentarán aquí cuando esa fase inicie (ver `roadmap.md`).
