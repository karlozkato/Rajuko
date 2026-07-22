# Roadmap — RAJUKO

Leyenda: ✅ Completo &nbsp;·&nbsp; 🔧 En progreso &nbsp;·&nbsp; ⬜ Pendiente

Este roadmap tiene dos partes: el **plan original de 8 etapas** (tienda funcional con identidad propia) y la **Fase 2** (visión ampliada de plataforma de identidad estética). La Fase 2 se documenta completa, pero se ubica después del lanzamiento del MVP — ver el razonamiento en `vision-del-proyecto.md`.

---

## Etapa 1 — Branding e identidad visual ✅ Completo

- [x] Nombre de la marca
- [x] Concepto del negocio
- [x] Logo
- [x] Isotipo (flor de cerezo con efecto glitch/pixel)
- [x] Imagotipo
- [x] Paleta de colores
- [x] Tipografía (Space Grotesk para encabezados + Inter para cuerpo de texto)

## Etapa 2 — Mejorar el diseño general 🔧 En progreso

- [x] Ajustar espaciados (hero, sección "Bienvenidos")
- [x] Animaciones suaves (efecto glitch en hover de nav y botón, scroll indicator con rebote, hover en tarjetas)
- [x] Mejorar tipografía (combinación Space Grotesk + Inter)
- [x] Sistema de tarjetas reutilizable (`.card`, usado en productos y en "¿Por qué RAJUKO?")
- [ ] Footer completo — estructura y estilos listos, **falta**: cuentas de redes sociales reales para reemplazar los íconos placeholder
- [x] Íconos y detalles visuales (SVG en "¿Por qué RAJUKO?", ícono de scroll en el hero)

## Etapa 3 — Landing page completa 🔧 En progreso

Estructura actual construida (ligeramente reordenada respecto al plan original, según lo que tenía sentido con el contenido disponible):

- [x] Header (logo + nombre agrupados, nav con efecto glitch, glassmorphism al hacer scroll)
- [x] Hero principal (eyebrow, título, subtítulo, botón con glitch, marca de agua del isotipo de fondo, ícono de scroll)
- [ ] Categorías destacadas — no iniciado
- [x] Sección "Bienvenidos a RAJUKO" (layout de dos columnas: texto + isotipo con resplandor)
- [ ] Nueva colección — no iniciado
- [x] "¿Por qué RAJUKO?" (3 puntos: diseño original, comunidad, calidad)
- [🔧] Productos destacados — estructura y componente `.card` listos, **falta**: solo hay 1 producto cargado (Manillas Alternativas), faltan fotos de los demás
- [ ] Galería / Lifestyle — no iniciado, depende de tener fotografía propia
- [ ] Opiniones de clientes — no iniciado, depende de tener clientes/beta testers
- [x] Newsletter (formulario visual listo, **no funcional aún** — requiere JavaScript/backend, ver Etapa 5 y 7)
- [x] Contacto (se adelantó respecto al plan original, ya resuelto con link `mailto:`)
- [🔧] Footer (estructura de 3 columnas lista, falta contenido real de redes sociales)

**Pendiente crítico de esta etapa:** revisar la página completa en versión mobile — actualmente solo existen 2 media queries puntuales (sección "Bienvenidos" y footer, breakpoint 768px). El header, el hero y la cuadrícula de productos no se han probado en pantalla chica todavía. Se recomienda hacer esto antes de seguir sumando secciones nuevas.

**Bug abierto:** el isotipo está apareciendo repetido en más lugares de los esperados en el HTML actual — pendiente de diagnóstico (ver `reuniones.md`, última sesión).

## Etapa 4 — Catálogo completo ⬜ Pendiente

- [ ] Crear entre 20 y 30 productos de ejemplo (depende de tener fotografía de producto)
- [ ] Categorías
- [ ] Filtros
- [ ] Buscador
- [ ] Etiquetas (Nuevo, Oferta, Más vendido)
- [ ] Ordenamiento
- [ ] Paginación
- [ ] Construir `productos.html` (actualmente vacío)

## Etapa 5 — JavaScript ⬜ Pendiente

- [ ] Carrito
- [ ] Favoritos
- [ ] Buscador
- [ ] Filtros
- [ ] Animaciones adicionales
- [ ] Modal de producto
- [ ] Cambio de imágenes
- [ ] Validaciones (incluyendo el formulario de newsletter y contacto)

## Etapa 6 — Responsive ⬜ Pendiente

- [ ] Auditoría completa mobile-first
- [ ] Móviles
- [ ] Tablets
- [ ] Portátiles
- [ ] Pantallas grandes

## Etapa 7 — Backend ⬜ Pendiente

- [ ] API REST
- [ ] Base de datos
- [ ] Usuarios
- [ ] Login
- [ ] Registro
- [ ] Panel administrador
- [ ] Gestión de inventario
- [ ] Pedidos
- [ ] Conexión real del formulario de newsletter y contacto

## Etapa 8 — Lanzamiento ⬜ Pendiente

- [ ] SEO avanzado (ya hay base: meta description, favicon, Open Graph — falta sitemap, robots.txt, datos estructurados)
- [ ] Google Analytics
- [ ] Pixel de Meta
- [ ] Dominio propio
- [ ] Hosting
- [ ] Optimización del rendimiento
- [ ] Seguridad
- [ ] Caché
- [ ] Compresión de imágenes

---

## Fase 2 — Plataforma de identidad estética interactiva ⬜ Visión a largo plazo

Se activa **después** del lanzamiento del MVP (fin de Etapa 8), cuando la tienda ya tiene catálogo real, backend funcionando y tráfico. Ver el razonamiento completo en `vision-del-proyecto.md`.

### Fase 2.1 — Investigación y diseño del sistema
- [ ] Definir qué datos de música/gaming/referencias visuales se van a pedir al usuario
- [ ] Diseñar el modelo de datos que traduce esos gustos en atributos estéticos (color, tono, densidad visual, mood)
- [ ] Diseñar cómo se ve un "mundo personal" en la interfaz (¿es una página de perfil? ¿un theme dinámico de toda la tienda?)

### Fase 2.2 — Cuentas de usuario
- [ ] Sistema de registro/login (ya cubierto en Etapa 7, se extiende aquí)
- [ ] Perfil de usuario con preferencias guardadas

### Fase 2.3 — Integraciones externas
- [ ] Integración con API de música (ej. Spotify) para leer gustos musicales del usuario
- [ ] Integración con plataformas gamer (ej. Steam) para leer preferencias de juegos
- [ ] Manejo de permisos y privacidad de esos datos (importante: se está pidiendo información personal del usuario, esto necesita política de privacidad clara)

### Fase 2.4 — Motor de personalización
- [ ] Lógica que traduce los datos conectados en una estética generada (paleta, referencias visuales, mood)
- [ ] Sistema de recomendación de productos basado en ese perfil estético

### Fase 2.5 — La "tienda viva"
- [ ] El catálogo se adapta dinámicamente a cada perfil de usuario
- [ ] La presentación visual de la tienda (no solo los productos) reacciona a la identidad del usuario conectado
- [ ] Posible capa social: mundos personales visibles/compartibles entre usuarios de la comunidad RAJUKO

---

## Próximo paso recomendado (a corto plazo)

En orden de prioridad práctica ahora mismo:
1. Resolver el bug del isotipo duplicado
2. Auditoría responsive de lo ya construido (Etapa 6, adelantada parcialmente)
3. Conseguir fotos de al menos 3-4 productos más para que la cuadrícula de productos se vea real
4. Footer: confirmar redes sociales reales
