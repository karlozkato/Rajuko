# Visión del proyecto — RAJUKO

## Qué es RAJUKO, en una frase

RAJUKO es una marca de ropa, accesorios y objetos de colección inspirada en la cultura alternativa (rock, emo, pop punk, streetwear, grunge, Y2K, cultura gamer, internet de los 2000, Japón reinterpretado, pixel art y glitch), construida para las personas que nunca encajaron en lo común.

El proyecto nació como un trabajo universitario, pero la intención declarada desde el inicio es que se convierta en un emprendimiento real y un e-commerce completamente funcional — no una página genérica de práctica.

## El problema que resuelve

Existen muchas tiendas de streetwear y merchandising alternativo, pero la mayoría se sienten como catálogos: fotos de producto, precio, botón de comprar. RAJUKO no quiere competir en ese terreno. La apuesta es que el usuario sienta que **entró a una comunidad, no a un catálogo** — que la marca representa una identidad, no solo vende objetos.

## Fase 1 — La tienda con identidad (donde estamos ahora)

Esta es la base que se está construyendo actualmente: una landing page y tienda online con:

- Identidad visual propia (logo, isotipo de flor de cerezo con efecto glitch, imagotipo, paleta de color, tipografía)
- Estructura semántica pensada para SEO desde el inicio
- Una experiencia visual minimalista, premium e inmersiva, inspirada en marcas como Riot Games Merch, SuperGroupies, Disturbia, BlackMilk, Nothing, Nike y Apple — sin copiar a ninguna
- Catálogo de productos que no se limita a ropa: camisetas, hoodies, pantalones, manillas, collares, llaveros, stickers, posters, pines, objetos de colección, accesorios gamer, productos personalizados, artículos decorativos
- Carrito, favoritos, filtros, buscador, panel de administración y backend propio en etapas posteriores

El detalle completo de cómo se llega ahí está en `roadmap.md`.

## Fase 2 — La visión ampliada: plataforma de identidad estética interactiva

Más allá de la tienda, la visión de largo plazo para RAJUKO es convertirla en **una plataforma de identidad estética interactiva**.

La idea central: cada persona que entra a RAJUKO puede conectar su música (por ejemplo, su perfil de Spotify), sus gustos gamer y sus referencias visuales, y el sistema le construye un **"mundo personal" digital** — una estética generada a partir de esos datos: paletas, referencias, mood, atmósfera.

Esto no se queda en lo visual. Ese "mundo personal" se convierte en **una tienda viva**: los productos que ve esa persona, las combinaciones que se le sugieren, y la forma en que se le presenta la marca, se adaptan a su identidad estética particular. En vez de una tienda igual para todos, cada usuario tiene una versión de RAJUKO curada para él o ella.

En términos prácticos, esto implica (documentado con más detalle técnico en `decisiones-tecnicas.md` cuando se empiece a construir):

- Sistema de cuentas de usuario
- Integración con APIs externas (música — ej. Spotify; posiblemente gustos gamer vía plataformas como Steam)
- Un modelo de datos que traduzca gustos/referencias en atributos estéticos (color, densidad visual, tono, estilo)
- Un motor de personalización que use esos atributos para adaptar tanto el diseño como la selección de productos mostrados
- Una capa de "tienda viva": el catálogo no es estático, reacciona al perfil de quien lo visita

### Por qué esto va después, no antes

Esta fase requiere una base sólida debajo: cuentas de usuario, backend, catálogo real, y tráfico real para que la personalización tenga sentido (no tiene caso personalizar una tienda con un producto). Por eso en el roadmap esta visión se ubica como **Fase 2**, después del lanzamiento del MVP de la tienda (fin de la Etapa 8). No se descarta ni se pospone indefinidamente — se secuencia, para que cuando se construya, se construya sobre algo que ya funciona.

## Público objetivo

Personas dentro de la cultura alternativa y gamer — principalmente jóvenes y adultos jóvenes — que no se sienten representados por la moda y el merchandising genérico, y que valoran la identidad y la pertenencia a una comunidad tanto como el producto físico en sí.

## Lema y tono

> "Vístete como eres."
>
> "Ropa, accesorios y objetos para quienes nunca encajaron en lo común."

El tono de la marca es directo, cercano, sin formalidad corporativa — habla de tú a tú con alguien que ya comparte esa identidad, no le está vendiendo algo a un desconocido.

## Qué hace diferente a RAJUKO de una tienda genérica

1. **Universo, no catálogo.** No se vende solo ropa — se vende pertenencia a una estética y una comunidad.
2. **Identidad visual con significado.** El isotipo (flor de cerezo + glitch/pixel) no es decorativo: representa la mezcla intencional de naturaleza, Japón, mundo digital y glitch que define la marca.
3. **SEO y estructura profesional desde la primera línea de código**, no como un parche al final.
4. **Visión de personalización real** (Fase 2) que ninguna tienda de este nicho está resolviendo actualmente de esta forma.
