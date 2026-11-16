// RAJUKO — catalogo.js
// Carga los productos desde la API y los dibuja en cualquier grilla marcada
// con el atributo  data-api-productos.
//   - Si la grilla tiene además  data-precio  , cada tarjeta muestra su precio.
// Maneja tres estados: cargando (esqueletos), error (con botón de reintento)
// y vacío. Al terminar avisa con el evento 'catalogo:listo' para que main.js
// pueda reordenar según el Mundo Personal.

document.addEventListener('DOMContentLoaded', initCatalogo);

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function initCatalogo() {
  const grilla = document.querySelector('.products-grid[data-api-productos]');
  if (grilla) cargarCatalogo(grilla);
}

async function cargarCatalogo(grilla) {
  // Zona de mensajes, justo encima de la grilla. role="status" hace que los
  // lectores de pantalla anuncien los cambios.
  let estado = grilla.previousElementSibling;
  if (!estado || !estado.classList.contains('estado-catalogo')) {
    estado = document.createElement('div');
    estado.className = 'estado-catalogo';
    estado.setAttribute('role', 'status');
    estado.setAttribute('aria-live', 'polite');
    grilla.before(estado);
  }

  mostrarEsqueletos(grilla);
  estado.textContent = 'Cargando productos…';
  grilla.setAttribute('aria-busy', 'true');

  try {
    const { productos } = await apiFetch('/api/productos', {
      onLento: () => {
        estado.textContent =
          'Despertando el servidor… la primera carga puede tardar hasta un minuto.';
      },
    });

    grilla.replaceChildren();
    estado.textContent = '';

    if (productos.length === 0) {
      estado.textContent = 'Aún no hay productos disponibles. Vuelve pronto.';
    } else {
      const conPrecio = grilla.hasAttribute('data-precio');
      productos.forEach((p) => grilla.appendChild(crearTarjeta(p, conPrecio)));
    }
    document.dispatchEvent(new CustomEvent('catalogo:listo'));
  } catch (error) {
    grilla.replaceChildren();
    mostrarError(estado, error.message, () => cargarCatalogo(grilla));
  } finally {
    grilla.removeAttribute('aria-busy');
  }
}

// Se construye con createElement/textContent (nunca con innerHTML) para que
// un nombre o descripción con código HTML no pueda inyectarse en la página.
function crearTarjeta(producto, conPrecio) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'card';
  tarjeta.dataset.categoria = producto.categorias;

  const imagen = document.createElement('img');
  imagen.src = `./images/${encodeURIComponent(producto.imagen)}`;
  imagen.alt = producto.nombre;
  imagen.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'card-info';

  const titulo = document.createElement('h3');
  titulo.textContent = producto.nombre;

  const descripcion = document.createElement('p');
  descripcion.textContent = producto.descripcion;

  info.append(titulo, descripcion);

  if (conPrecio) {
    const precio = document.createElement('p');
    precio.className = 'card-price';
    precio.textContent = formatoPrecio.format(producto.precio);
    info.appendChild(precio);
  }

  tarjeta.append(imagen, info);
  return tarjeta;
}

function mostrarEsqueletos(grilla, cantidad = 3) {
  grilla.replaceChildren();
  for (let i = 0; i < cantidad; i++) {
    const esqueleto = document.createElement('article');
    esqueleto.className = 'card card-esqueleto';
    esqueleto.setAttribute('aria-hidden', 'true');
    esqueleto.innerHTML =
      '<div class="esqueleto-img"></div>' +
      '<div class="card-info"><div class="esqueleto-linea"></div>' +
      '<div class="esqueleto-linea corta"></div></div>';
    grilla.appendChild(esqueleto);
  }
}

function mostrarError(contenedor, mensaje, alReintentar) {
  contenedor.replaceChildren();

  const texto = document.createElement('p');
  texto.className = 'estado-error';
  texto.textContent = mensaje;

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn';
  boton.textContent = 'Reintentar';
  boton.addEventListener('click', alReintentar);

  contenedor.append(texto, boton);
}
