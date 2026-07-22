# Identidad de marca — RAJUKO

## Nombre y concepto

**RAJUKO** — marca enfocada en cultura alternativa: rock, emo, pop punk, streetwear, grunge, Y2K, cultura gamer, internet de los 2000, Japón reinterpretado de forma moderna, pixel art, glitch y nostalgia digital.

## Lema y subtítulo

> **"Vístete como eres."**
>
> Ropa, accesorios y objetos para quienes nunca encajaron en lo común.

## Paleta de colores

| Uso | Variable CSS | Hex |
|---|---|---|
| Color principal | `--color-primario` | `#F36D96` |
| Color secundario | `--color-secundario` | `#2A2A2A` |
| Fondo | `--color-fondo` | `#0D0D0D` |
| Texto principal | `--color-texto` | `#F5F5F5` |
| Texto secundario | `--color-texto-secundario` | `#B8B8B8` |
| Éxito | `--color-de-exito` | `#48C774` |
| Error | `--color-de-errores` | `#FF4F6A` |

**Nota sobre el efecto glitch:** en una primera prueba se usó un cian (`#4DE1E8`) como color secundario del split de glitch en los hovers, pero se descartó por no pertenecer a la paleta oficial. La versión actual usa un split de `--color-primario` (rosa) + blanco, para que cualquier efecto interactivo se mantenga dentro de los colores de marca.

## Tipografía

- **Encabezados (h1, h2, h3):** Space Grotesk, peso 700
- **Cuerpo de texto:** Inter

Esta combinación evolucionó del plan original (que consideraba solo Inter): Space Grotesk se sumó para dar más carácter a los títulos sin perder la limpieza de Inter en el texto de lectura.

## Logo, isotipo e imagotipo — cuándo usar cada uno

RAJUKO tiene tres activos de marca distintos, y no son intercambiables:

- **Logotipo:** el nombre "RAJUKO" con tipografía personalizada, sin símbolo.
- **Isotipo:** la flor de cerezo minimalista con efecto glitch/pixel, sin texto. Representa la mezcla entre naturaleza, Japón, mundo digital, glitch y pixel art.
- **Imagotipo:** logotipo + isotipo combinados como una sola pieza, capaz de representar la marca por sí sola.

**Regla de uso definida:**
- **Isotipo** → cuando va acompañado de texto cerca (header, junto a un título de sección, como marca de agua decorativa). No repetir el nombre de la marca dos veces en el mismo espacio visual.
- **Imagotipo** → cuando la marca necesita representarse completa, sola, sin texto adicional cerca (favicon, miniatura para redes sociales, footer si se decide usarlo ahí).

Ejemplo aplicado: en la sección "Bienvenidos a RAJUKO", donde ya existe el h2 con el nombre de la marca, se usa el isotipo (no el imagotipo) para no triplicar el nombre "RAJUKO" en un mismo bloque visual (header + título + imagen).

### Archivo del isotipo — versión recortada

El archivo original del isotipo tenía márgenes transparentes grandes alrededor de la flor. Se generó una versión recortada pegada al borde real del dibujo (usando el canal alpha del PNG, no el color de fondo, porque el "vacío" del archivo no era blanco puro sino un gris no visible a simple vista), con un margen mínimo del 10%. Esta es la versión que debe usarse en adelante en cualquier lugar del sitio, incluyendo el favicon.

## Motivos visuales recurrentes

- **Sakura (flor de cerezo):** símbolo central del isotipo
- **Glitch:** presente en el isotipo y en las micro-interacciones del sitio (hover del nav, hover del botón principal)
- **Pixel art:** parte de la inspiración visual general de la marca
- **Resplandor rosado (glow):** usado consistentemente detrás de elementos clave (botón del hero, isotipo en "Bienvenidos") para que la marca se sienta cohesiva entre secciones

## Inspiración visual (referencias, no copia)

Riot Games Merch, SuperGroupies, Disturbia, BlackMilk, Nothing, Nike (landing pages), Apple (limpieza visual), Awwwards, marcas japonesas de streetwear.

La instrucción explícita del proyecto es tomar inspiración de la **calidad visual y experiencia de usuario** de estas marcas, no replicar su diseño.

## Tono de voz

Directo, cercano, sin formalidad corporativa. RAJUKO le habla a alguien que ya comparte su identidad — no está convenciendo a un desconocido de comprar, está reconociendo a alguien que "nunca encajó en lo común".
