// RAJUKO — mi-mundo.js
// Lógica exclusiva de la página "Crear Mi Mundo": estado de los chips del
// quiz y presentación del resultado. Depende de computeMundo() en mundos.js.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.quiz-mundo');
  if (!form) return; // esta página no es mi-mundo.html

  const chips = form.querySelectorAll('.chip');
  const seleccionados = new Set();

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const activo = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', String(!activo));
      if (activo) {
        seleccionados.delete(chip.dataset.tag);
      } else {
        seleccionados.add(chip.dataset.tag);
      }
    });
  });

  const aviso = document.querySelector('.quiz-aviso');
  const resultado = document.querySelector('.mundo-resultado');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (seleccionados.size === 0) {
      aviso.textContent = 'Elegí al menos una opción para descubrir tu Mundo.';
      return;
    }

    aviso.textContent = '';
    const mundo = computeMundo(Array.from(seleccionados));
    mostrarResultado(mundo);
  });

  function mostrarResultado(mundo) {
    resultado.hidden = false;
    resultado.querySelector('[data-resultado-nombre]').textContent = mundo.nombre;
    resultado.querySelector('[data-resultado-texto]').textContent = mundo.heroTexto;
    resultado.querySelector('[data-resultado-swatch]').style.background = mundo.colorPrimario;
    resultado.querySelector('[data-resultado-cta]').href = `index.html?mundo=${mundo.id}`;

    // Preview en vivo: la página del quiz también cambia de color al momento.
    document.documentElement.style.setProperty('--color-primario', mundo.colorPrimario);

    resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});