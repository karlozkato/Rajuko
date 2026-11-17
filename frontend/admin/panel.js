// RAJUKO Admin — panel.js
// Arranque del panel: protección de acceso, cabecera, barra lateral y navegación.
// Requiere: ../config.js, ../api.js, sesion.js, dom.js, dashboard.js
//
// Flujo de protección (ver también sesion.js):
//   1. Sin token o con token vencido  -> al login (sin mostrar nada del panel).
//   2. Con token                      -> se verifica con GET /api/auth/me.
//        401 -> sesión caída: se borra el token y se vuelve al login.
//        Fallo de red -> NO se cierra la sesión (puede ser el servidor
//        "despertando"): se ofrece reintentar.
//   3. Verificada -> se muestra el panel y se programa el cierre automático
//      para el momento exacto en que expira el token.
// Mientras tanto <body class="verificando"> mantiene el panel oculto.

(function () {
  const $ = (id) => document.getElementById(id);

  // Navegación por "hash" (#/productos): funciona en GitHub Pages sin servidor.
  // Productos y Mensajes son marcadores honestos: la API ya existe, la pantalla llega después.
  const RUTAS = {
    '/': { titulo: 'Panel', render: (c) => renderDashboard(c) },
    '/productos': {
      titulo: 'Productos',
      pendiente: {
        icono: 'caja',
        texto: 'La gestión visual de productos (crear, editar, ocultar y eliminar) llega en la siguiente etapa.',
        api: 'La API ya está lista y probada: /api/admin/productos.',
      },
    },
    '/mensajes': {
      titulo: 'Mensajes',
      pendiente: {
        icono: 'sobre',
        texto: 'La bandeja completa de mensajes (leer, marcar y eliminar) llega en una etapa posterior.',
        api: 'La API ya está lista y probada: /api/admin/mensajes. Mientras tanto, el Panel muestra los más recientes.',
      },
    },
  };

  function renderPendiente(contenedor, titulo, datos) {
    contenedor.replaceChildren(
      el('header', { class: 'vista-cab' },
        el('div', {},
          el('p', { class: 'sobretitulo', text: 'En construcción' }),
          el('h1', { class: 'vista-titulo', id: 'vista-titulo', tabindex: '-1', text: titulo }))),
      el('div', { class: 'pendiente' },
        icono(datos.icono, 'ico ico-grande'),
        el('p', { class: 'pendiente-texto', text: datos.texto }),
        el('p', { class: 'pendiente-api', text: datos.api }),
        el('a', { class: 'btn-fantasma', href: '#/' }, icono('flecha', 'ico ico-atras'), el('span', { text: 'Volver al panel' }))));
  }

  // ---------- Navegación ----------
  function rutaActual() {
    const ruta = window.location.hash.replace(/^#/, '') || '/';
    return RUTAS[ruta] ? ruta : '/';
  }

  function mostrarVista(esPrimera) {
    const ruta = rutaActual();
    const def = RUTAS[ruta];

    document.title = `${def.titulo} · RAJUKO Admin`;
    $('seccion-actual').textContent = def.titulo;
    document.querySelectorAll('.menu-link').forEach((enlace) => {
      if (enlace.dataset.ruta === ruta) enlace.setAttribute('aria-current', 'page');
      else enlace.removeAttribute('aria-current');
    });

    const vista = $('vista');
    if (def.render) def.render(vista);
    else renderPendiente(vista, def.titulo, def.pendiente);

    cerrarMenu();
    if (!esPrimera) {
      // Accesibilidad: al cambiar de sección el foco pasa al título nuevo.
      window.scrollTo(0, 0);
      const titulo = $('vista-titulo');
      if (titulo) titulo.focus({ preventScroll: true });
    }
  }

  // ---------- Menú lateral en móvil ----------
  function abrirMenu() {
    $('sidebar').classList.add('abierto');
    $('velo').hidden = false;
    $('btn-menu').setAttribute('aria-expanded', 'true');
  }
  function cerrarMenu() {
    $('sidebar').classList.remove('abierto');
    $('velo').hidden = true;
    $('btn-menu').setAttribute('aria-expanded', 'false');
  }

  // ---------- Montaje tras verificar la sesión ----------
  function montar(admin, token) {
    const email = admin.email;
    $('admin-email').textContent = email;
    $('admin-inicial').textContent = email.charAt(0).toUpperCase();

    const expira = Sesion.expiracionMs(token);
    $('sesion-hasta').textContent = `Sesión hasta las ${new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date(expira))}`;

    // Cierre automático exactamente cuando vence el token. setTimeout admite como máximo
    // ~24 días; el token dura horas, pero se limita por seguridad.
    setTimeout(() => Sesion.cerrar('expirada'), Math.min(expira - Date.now(), 2 ** 31 - 1));
    // Los temporizadores se retrasan en pestañas en segundo plano: se revisa al volver.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !Sesion.vigente(token)) Sesion.cerrar('expirada');
    });

    $('btn-salir').addEventListener('click', () => Sesion.cerrar('salio'));
    $('btn-menu').addEventListener('click', () => ($('sidebar').classList.contains('abierto') ? cerrarMenu() : abrirMenu()));
    $('velo').addEventListener('click', cerrarMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });

    // Contador de mensajes sin leer en la barra lateral (lo emite el dashboard).
    document.addEventListener('panel:no-leidos', (e) => {
      const contador = $('contador-mensajes');
      contador.textContent = e.detail > 99 ? '99+' : String(e.detail);
      contador.hidden = e.detail === 0;
      contador.setAttribute('aria-label', `${e.detail} mensajes sin leer`);
    });

    window.addEventListener('hashchange', () => mostrarVista(false));
    mostrarVista(true);

    document.body.classList.remove('verificando');
    $('pantalla-carga').hidden = true;
  }

  // ---------- Arranque ----------
  async function iniciar() {
    const token = Sesion.leer();
    if (!token) return Sesion.cerrar();
    if (!Sesion.vigente(token)) return Sesion.cerrar('expirada');

    const texto = $('carga-texto');
    const reintentar = $('carga-reintentar');
    reintentar.hidden = true;
    texto.textContent = 'Verificando sesión…';

    try {
      const { admin } = await Sesion.adminFetch('/api/auth/me', {
        onLento: () => { texto.textContent = 'Despertando el servidor… la primera vez puede tardar hasta un minuto.'; },
      });
      montar(admin, token);
    } catch (error) {
      if (error.sesionExpirada) return; // ya se está redirigiendo al login
      // Error de red u otro: la sesión puede seguir siendo válida, así que NO se cierra.
      texto.textContent = error.message;
      reintentar.hidden = false;
    }
  }

  $('carga-reintentar').addEventListener('click', iniciar);
  iniciar();
})();
