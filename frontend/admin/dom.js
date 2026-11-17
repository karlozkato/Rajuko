// RAJUKO Admin — dom.js
// Utilidades mínimas para construir elementos del DOM de forma SEGURA.
// Todo texto se asigna con textContent: aunque un mensaje de contacto contenga
// <script> o HTML, se muestra como texto y jamás se ejecuta. Por eso en el panel
// no se usa innerHTML con datos.

// el('div', { class: 'tarjeta', text: 'Hola', onclick: fn }, hijo1, hijo2)
function el(etiqueta, propiedades = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(propiedades)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (clave === 'class') nodo.className = valor;
    else if (clave === 'text') nodo.textContent = valor;
    else if (clave.startsWith('on') && typeof valor === 'function') nodo.addEventListener(clave.slice(2), valor);
    else nodo.setAttribute(clave, valor === true ? '' : valor);
  }
  nodo.append(...hijos.flat().filter((h) => h !== null && h !== undefined && h !== false));
  return nodo;
}

// Icono del "sprite" SVG que está dentro de cada página HTML (<symbol id="i-nombre">).
function icono(nombre, clase = 'ico') {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', clase);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const uso = document.createElementNS(NS, 'use');
  uso.setAttribute('href', `#i-${nombre}`);
  svg.appendChild(uso);
  return svg;
}
