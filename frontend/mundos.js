// RAJUKO — mundos.js
// Motor del sistema "Mundo Personal". Única fuente de verdad de qué mundos
// existen y cómo se calculan. Cuando llegue el backend/IA (Fase 7), la
// función computeMundo() es la que se reemplaza por una llamada a la API —
// el resto del sitio (aplicar colores, destacar productos, textos) no
// debería necesitar cambios.
//
// Persistencia: NINGUNA todavía (a propósito, hasta que exista backend).
// El mundo actual viaja únicamente en el parámetro ?mundo= de la URL.
// Si el usuario cierra la pestaña o entra por un link sin ese parámetro,
// el mundo se pierde — es el comportamiento esperado en esta fase.

const MUNDOS = {
  nocturno: {
    id: 'nocturno',
    nombre: 'Mundo Nocturno',
    tags: ['rock', 'emo', 'grunge', 'metal', 'silent-hill', 'gotico'],
    colorPrimario: '#D90429',
    heroTexto: 'Tu mundo suena a distorsión y noches largas. Bienvenido al lado oscuro de RAJUKO.',
    categoriasDestacadas: ['accesorios'],
  },
  glitch: {
    id: 'glitch',
    nombre: 'Mundo Glitch',
    tags: ['y2k', 'pixel-art', 'ps2', 'nintendo', 'streetwear', 'cultura-digital'],
    colorPrimario: '#4DE1E8',
    heroTexto: 'Píxeles, glitches y nostalgia 2000. Tu mundo corre a 8-bit.',
    categoriasDestacadas: ['gamer', 'novedades'],
  },
  shoegaze: {
    id: 'shoegaze',
    nombre: 'Mundo Shoegaze',
    tags: ['shoegaze', 'indie', 'midwest-emo', 'nostalgia'],
    colorPrimario: '#F36D96',
    heroTexto: 'Reverb, melancolía y texturas suaves. Este es tu mundo.',
    categoriasDestacadas: ['ropa'],
  },
  retroanime: {
    id: 'retroanime',
    nombre: 'Mundo Retro-Anime',
    tags: ['anime', 'evangelion', 'omori', 'pixel-art'],
    colorPrimario: '#3A0CA3',
    heroTexto: 'Entre openings de anime y RPGs de pixel art. Tu mundo tiene banda sonora propia.',
    categoriasDestacadas: ['accesorios', 'gamer'],
  },
};

// Recibe un array de tags seleccionados en el quiz (ej: ['rock','ps2','y2k'])
// y devuelve el objeto del mundo con más coincidencias.
function computeMundo(tagsSeleccionados) {
  let mejorMundo = MUNDOS.nocturno;
  let mejorPuntaje = -1;

  Object.values(MUNDOS).forEach((mundo) => {
    const puntaje = mundo.tags.filter((t) => tagsSeleccionados.includes(t)).length;
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorMundo = mundo;
    }
  });

  return mejorMundo;
}

// Lee ?mundo= de la URL actual y devuelve el mundo correspondiente, o null.
function getMundoFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('mundo');
  return id && MUNDOS[id] ? MUNDOS[id] : null;
}

// Aplica un mundo a la página actual: color primario, texto del hero
// (si existe el hook data-hero-texto) y orden de productos destacados.
function aplicarMundo(mundo) {
  if (!mundo) return;

  document.documentElement.style.setProperty('--color-primario', mundo.colorPrimario);

  const heroTexto = document.querySelector('[data-hero-texto]');
  if (heroTexto) heroTexto.textContent = mundo.heroTexto;

  const badge = document.querySelector('[data-mundo-actual]');
  if (badge) {
    badge.textContent = mundo.nombre;
    badge.hidden = false;
  }

  reordenarProductosPorMundo(mundo);
}

// Sube al principio de la grilla las tarjetas cuya categoría coincide con
// las categorías destacadas del mundo. No oculta nada, solo reordena.
function reordenarProductosPorMundo(mundo) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.card'));
  cards.sort((a, b) => {
    const aDestaca = (a.dataset.categoria || '')
      .split(' ')
      .some((c) => mundo.categoriasDestacadas.includes(c));
    const bDestaca = (b.dataset.categoria || '')
      .split(' ')
      .some((c) => mundo.categoriasDestacadas.includes(c));
    if (aDestaca === bDestaca) return 0;
    return aDestaca ? -1 : 1;
  });

  cards.forEach((card) => grid.appendChild(card));
}

// Reescribe los links internos de la página para que conserven ?mundo=
// mientras el usuario navega, ya que todavía no hay ningún tipo de
// almacenamiento persistente.
function propagarMundoEnLinks(mundo) {
  if (!mundo) return;

  document.querySelectorAll('a[href]').forEach((link) => {
    const esInterno = link.href.startsWith(window.location.origin) &&
      !link.href.includes('mailto:');
    if (!esInterno) return;

    const url = new URL(link.href);
    url.searchParams.set('mundo', mundo.id);
    link.href = url.toString();
  });
}