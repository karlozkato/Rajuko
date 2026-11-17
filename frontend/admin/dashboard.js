// RAJUKO Admin — dashboard.js
// Vista inicial del panel: resumen con datos REALES de la API.
//   GET /api/admin/productos           -> cuántos productos hay y cuántos están activos
//   GET /api/admin/mensajes?limite=3   -> totales de mensajes y los 3 más recientes
// Requiere: sesion.js, dom.js

const formatoNumero = new Intl.NumberFormat('es-CO');
const formatoFechaMensaje = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});

function renderDashboard(contenedor) {
  contenedor.replaceChildren();

  const hoy = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  // Tarjetas de resumen. Cada una guarda sus nodos para rellenarlos cuando lleguen los datos.
  const definiciones = [
    { id: 'prod-activos', etiqueta: 'Productos activos', ruta: '#/productos' },
    { id: 'prod-ocultos', etiqueta: 'Productos ocultos', ruta: '#/productos' },
    { id: 'msg-sin-leer', etiqueta: 'Mensajes sin leer', ruta: '#/mensajes', destacada: true },
    { id: 'msg-total', etiqueta: 'Mensajes recibidos', ruta: '#/mensajes' },
  ];
  const tarjetas = {};
  const nodosTarjetas = definiciones.map((d) => {
    const valor = el('span', { class: 'stat-valor', text: '0' });
    const pista = el('span', { class: 'stat-pista', text: 'Cargando…' });
    const nodo = el('a', { class: `stat cargando${d.destacada ? ' stat-destacada' : ''}`, href: d.ruta },
      el('span', { class: 'stat-etiqueta', text: d.etiqueta }), valor, pista);
    tarjetas[d.id] = { nodo, valor, pista };
    return nodo;
  });

  // Lista de últimos mensajes
  const listaMensajes = el('ul', { class: 'mensajes-lista' });
  const avisoError = el('div', { class: 'aviso aviso-error', role: 'alert', hidden: true });
  const textoError = el('p', { text: '' });
  const botonActualizar = el('button', { type: 'button', class: 'btn-fantasma btn-chico' },
    icono('refrescar'), el('span', { text: 'Actualizar' }));
  const botonReintentar = el('button', { type: 'button', class: 'btn-fantasma btn-chico', text: 'Reintentar' });
  avisoError.append(textoError, botonReintentar);

  contenedor.append(
    el('header', { class: 'vista-cab' },
      el('div', {},
        el('p', { class: 'sobretitulo', text: hoy }),
        el('h1', { class: 'vista-titulo', id: 'vista-titulo', tabindex: '-1', text: 'Panel' }),
        el('p', { class: 'vista-sub', text: 'Lo que está pasando en RAJUKO ahora mismo.' })),
      botonActualizar),
    avisoError,
    el('section', { class: 'stats', 'aria-label': 'Resumen' }, ...nodosTarjetas),
    el('section', { class: 'bloque', 'aria-labelledby': 'titulo-ultimos' },
      el('div', { class: 'bloque-cab' },
        el('h2', { id: 'titulo-ultimos', class: 'bloque-titulo', text: 'Últimos mensajes' }),
        el('a', { class: 'enlace-flecha', href: '#/mensajes' }, el('span', { text: 'Ver todos' }), icono('flecha'))),
      listaMensajes));

  function poner(id, valor, pista, vacio) {
    const t = tarjetas[id];
    t.nodo.classList.remove('cargando');
    t.nodo.classList.toggle('sin-dato', Boolean(vacio));
    t.valor.textContent = vacio ? '—' : formatoNumero.format(valor);
    t.pista.textContent = pista;
  }

  function filaMensaje(m) {
    const vistaPrevia = m.mensaje.length > 110 ? `${m.mensaje.slice(0, 110)}…` : m.mensaje;
    return el('li', { class: `mensaje-item${m.leido ? '' : ' sin-leer'}` },
      el('span', { class: 'punto', 'aria-label': m.leido ? 'Leído' : 'Sin leer', role: 'img' }),
      el('div', { class: 'mensaje-cuerpo' },
        el('p', { class: 'mensaje-nombre', text: m.nombre }),
        el('p', { class: 'mensaje-texto', text: vistaPrevia })),
      el('time', { class: 'mensaje-hora', datetime: m.creado_en, text: formatoFechaMensaje.format(new Date(m.creado_en)) }));
  }

  async function cargar() {
    botonActualizar.disabled = true;
    botonActualizar.classList.add('girando');
    avisoError.hidden = true;
    Object.values(tarjetas).forEach((t) => { t.nodo.classList.add('cargando'); t.pista.textContent = 'Cargando…'; });

    const [resProductos, resMensajes] = await Promise.allSettled([
      Sesion.adminFetch('/api/admin/productos'),
      Sesion.adminFetch('/api/admin/mensajes?limite=3'),
    ]);

    // Si la sesión cayó, adminFetch ya está redirigiendo al login: no pintamos nada más.
    const sesionCaida = [resProductos, resMensajes].some((r) => r.status === 'rejected' && r.reason.sesionExpirada);
    if (sesionCaida) return;

    // --- Productos ---
    if (resProductos.status === 'fulfilled') {
      const productos = resProductos.value.productos;
      const activos = productos.filter((p) => p.activo).length;
      poner('prod-activos', activos, `de ${formatoNumero.format(productos.length)} en total`);
      poner('prod-ocultos', productos.length - activos, 'No se ven en la tienda');
    } else {
      poner('prod-activos', 0, 'No se pudo cargar', true);
      poner('prod-ocultos', 0, 'No se pudo cargar', true);
    }

    // --- Mensajes ---
    listaMensajes.replaceChildren();
    if (resMensajes.status === 'fulfilled') {
      const { mensajes, total, no_leidos: noLeidos } = resMensajes.value;
      poner('msg-sin-leer', noLeidos, noLeidos === 0 ? 'Todo al día' : 'Esperan respuesta');
      poner('msg-total', total, 'Desde el formulario de contacto');
      // Aviso al resto del panel (el contador de la barra lateral lo escucha).
      document.dispatchEvent(new CustomEvent('panel:no-leidos', { detail: noLeidos }));

      if (mensajes.length === 0) {
        listaMensajes.append(el('li', { class: 'vacio', text: 'Aún no ha llegado ningún mensaje.' }));
      } else {
        mensajes.forEach((m) => listaMensajes.append(filaMensaje(m)));
      }
    } else {
      poner('msg-sin-leer', 0, 'No se pudo cargar', true);
      poner('msg-total', 0, 'No se pudo cargar', true);
      listaMensajes.append(el('li', { class: 'vacio', text: 'No se pudieron cargar los mensajes.' }));
    }

    // Un solo aviso con el motivo real si algo falló (y la opción de reintentar).
    const fallos = [resProductos, resMensajes].filter((r) => r.status === 'rejected');
    if (fallos.length > 0) {
      textoError.textContent = fallos[0].reason.message;
      avisoError.hidden = false;
    }

    botonActualizar.disabled = false;
    botonActualizar.classList.remove('girando');
  }

  botonActualizar.addEventListener('click', cargar);
  botonReintentar.addEventListener('click', cargar);
  cargar();
}
