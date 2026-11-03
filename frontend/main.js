// RAJUKO — main.js
// Punto de entrada de JS del sitio. Cada función de inicialización revisa
// primero si sus elementos existen en la página antes de correr, así este
// mismo archivo se puede enlazar desde cualquier página (Landing, Tienda,
// más adelante "Mi Mundo") sin necesidad de condicionales por página.

document.addEventListener('DOMContentLoaded', () => {
  initFiltrosCatalogo();
  initMundoPersonal();
});

function initMundoPersonal() {
  // mundos.js no está enlazado en esta página (ej: si algún día hay una
  // página que deliberadamente no participa del sistema de Mundos)
  if (typeof getMundoFromURL !== 'function') return;

  const mundo = getMundoFromURL();
  if (!mundo) return;

  aplicarMundo(mundo);
  propagarMundoEnLinks(mundo);
}

function initFiltrosCatalogo() {
  const filtros = document.querySelectorAll('.filtro');
  const cards = document.querySelectorAll('.products-grid .card');

  if (!filtros.length || !cards.length) return;

  filtros.forEach((boton) => {
    boton.addEventListener('click', () => {
      const categoria = boton.dataset.filtro;

      filtros.forEach((b) => b.classList.remove('activo'));
      boton.classList.add('activo');

      cards.forEach((card) => {
        const categorias = (card.dataset.categoria || '').split(' ');
        const visible = categoria === 'todos' || categorias.includes(categoria);
        card.style.display = visible ? '' : 'none';
      });
    });
  });
}