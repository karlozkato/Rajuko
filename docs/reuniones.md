# Bitácora de sesiones — RAJUKO

Registro cronológico de las sesiones de trabajo sobre el proyecto: qué se hizo, qué quedó pendiente. Sirve para retomar el hilo rápido si pasa tiempo entre sesiones.

---

## Sesión 1 — 15 de julio, 2026

**Punto de partida:** primera revisión del código existente (`index.html`, `styles.css`). El sitio ya tenía header, hero, sección de bienvenida y una tarjeta de producto (Manillas Alternativas), pero con varios problemas estructurales.

**Se hizo:**
- Corregido: dos `<h1>` en la misma página (nombre de marca en el header + título del hero). El header pasó a usar el nombre como texto normal dentro de un link, dejando el h1 único en el hero.
- Agrupado logo + nombre de marca en el header como una sola unidad (`.brand`), antes estaban sueltos y el isotipo se veía "flotando" solo.
- Corregido el tamaño del logo en el header (se salía del contenedor).
- Detectada y eliminada una sección de productos vacía y duplicada ("Nuevos productos" sin contenido).
- Corregido el `id="inicio"` — estaba puesto en la sección de bienvenida en vez del hero, lo que hacía que el link "Inicio" del nav saltara el hero.
- Aplicada la clase `.card` (ya definida en CSS pero sin usar) a la tarjeta de producto existente, resolviendo que la imagen se viera gigante y sin contención.

**Quedó pendiente:** definir estructura para el resto de secciones, esperar más fotos de producto.

---

## Sesión 2 — 15 de julio, 2026 (continuación)

**Se hizo:**
- Revisión de semántica: `.card-info` innecesario eliminado, `.about-visual` convertido a `<figure>`, enlaces del footer convertidos a `<nav>` + `<ul>`.
- Explorado y descartado un primer intento de efecto glitch en hover (split rosa + cian) por no encajar con la paleta de marca — ver detalle en `decisiones-tecnicas.md`.
- Header actualizado con efecto glassmorphism (`backdrop-filter`) al hacer scroll.

**Quedó pendiente:** decidir versión final del efecto glitch, seguir construyendo secciones de la landing.

---

## Sesión 3 — 16 de julio, 2026

**Se hizo:**
- Efecto glitch resuelto: versión final con split rosa + blanco (dentro de paleta de marca).
- Hero mejorado: agregado eyebrow ("Colección Alternativa 2026"), ícono de scroll animado, marca de agua del isotipo de fondo, altura reducida de 90vh a 80vh (y luego a 70vh) para reducir espacio vacío excesivo.
- Sección "Bienvenidos a RAJUKO" reestructurada a layout de dos columnas (texto + isotipo con resplandor), agregado `.section-eyebrow` para dar jerarquía.
- Agregada la sección "¿Por qué RAJUKO?" con 3 puntos (diseño original, comunidad, calidad) — quedó resuelta sin cambios en la revisión.
- Agregada sección de Newsletter (visual, no funcional aún — requiere backend/JS).
- Agregada sección de Contacto (adelantada respecto al plan original) con link `mailto:` funcional.
- SEO técnico: agregada meta description, favicon (isotipo), y Open Graph tags para vista previa al compartir en redes.

**Quedó pendiente:** footer con íconos de redes sociales reales (esperando que el usuario confirme si ya tiene cuentas creadas), revisión completa en mobile.

---

## Sesión 4 — 22 de julio, 2026

**Se hizo:**
- Diagnosticado y resuelto: favicon no aparecía por caché del navegador (confirmado con prueba en incógnito y parámetro de versión en la URL del ícono).
- Detectado que el nombre real del archivo de imagen usado como favicon era `logotipo.png`, no `isotipo.png` como se pensaba.
- Recortada la imagen del isotipo: el archivo original tenía márgenes transparentes amplios alrededor de la flor, lo que la hacía verse chica en el favicon. Se generó una versión recortada pegada al borde real del dibujo usando el canal alpha del PNG.
- Reportado un bug nuevo: el isotipo apareciendo en más partes del sitio de las esperadas (posiblemente relacionado a la regla `.hero-bg-icon`, que en un punto no estaba aplicada al CSS y causaba que la marca de agua se mostrara a tamaño completo). **Sin resolver aún** — pendiente de que el usuario comparta el HTML actual con todas las apariciones de `isotipo` para diagnosticar con precisión.
- Creada la documentación completa del proyecto (carpeta `docs/`), incluyendo la visión ampliada de RAJUKO como plataforma de identidad estética interactiva (Fase 2 del roadmap).

**Quedó pendiente (abierto al cierre de esta sesión):**
1. Resolver el bug del isotipo duplicado
2. Footer: confirmar redes sociales reales
3. Auditoría responsive completa (header, hero, cuadrícula de productos)
4. Conseguir fotos de más productos para llenar la cuadrícula

---

## Cómo agregar la próxima sesión

Al cerrar una sesión de trabajo, agregar un bloque nuevo arriba de este mensaje con: fecha, qué se hizo, qué quedó pendiente. Mantener el formato consistente con las sesiones anteriores para que la bitácora sea fácil de escanear.
