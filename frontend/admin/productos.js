// RAJUKO Admin — productos.js
// Listado, búsqueda, filtros y acciones seguras sobre productos.
// Requiere: Sesion, UI, el(), icono() y apiFetch (a través de Sesion.adminFetch).
// La edición/creación se incorpora en la subetapa 3.

(function () {
  'use strict';

  const CATEGORIAS = [
    ['ropa', 'Ropa'],
    ['accesorios', 'Accesorios'],
    ['gamer', 'Gamer'],
    ['novedades', 'Novedades'],
  ];
  const dinero = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  });
  const fecha = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  function etiquetaCategoria(valor) {
    return CATEGORIAS.find(([clave]) => clave === valor)?.[1] || valor;
  }

  function crearBotonIcono(nombreIcono, etiqueta, clase, accion, deshabilitado = false) {
    return el('button', {
      type: 'button',
      class: `btn-icono producto-accion ${clase || ''}`.trim(),
      'aria-label': etiqueta,
      title: etiqueta,
      disabled: deshabilitado,
      onclick: accion,
    }, icono(nombreIcono));
  }

  function renderProductos(contenedor) {
    let productos = [];
    let cargando = false;
    let termino = '';
    let categoria = 'todas';
    let estado = 'todos';

    const resultados = el('div', { class: 'productos-resultados', 'aria-live': 'polite', 'aria-busy': 'false' });
    const resumen = el('p', { class: 'productos-resumen', text: 'Cargando productos…' });
    const buscar = el('input', {
      type: 'search',
      class: 'productos-buscar',
      placeholder: 'Buscar por nombre…',
      'aria-label': 'Buscar productos por nombre',
      autocomplete: 'off',
    });
    const filtroCategoria = el('select', {
      class: 'productos-filtro',
      'aria-label': 'Filtrar por categoría',
    },
    el('option', { value: 'todas', text: 'Todas las categorías' }),
    ...CATEGORIAS.map(([valor, nombre]) => el('option', { value: valor, text: nombre })));
    const filtroEstado = el('select', {
      class: 'productos-filtro',
      'aria-label': 'Filtrar por estado',
    },
    el('option', { value: 'todos', text: 'Todos los estados' }),
    el('option', { value: 'activos', text: 'Activos' }),
    el('option', { value: 'ocultos', text: 'Ocultos' }));

    const botonActualizar = el('button', {
      type: 'button',
      class: 'btn-fantasma btn-chico',
      onclick: () => UI.ejecutarUnaVez(botonActualizar, cargar, 'Actualizando…'),
    }, icono('refrescar'), el('span', { class: 'btn-texto', text: 'Actualizar' }));

    const filtros = el('div', { class: 'productos-filtros' },
      el('label', { class: 'productos-buscar-wrap' },
        icono('buscar'),
        buscar),
      filtroCategoria,
      filtroEstado);

    contenedor.replaceChildren(
      el('header', { class: 'vista-cab productos-cab' },
        el('div', {},
          el('p', { class: 'sobretitulo', text: 'Catálogo' }),
          el('h1', { class: 'vista-titulo', id: 'vista-titulo', tabindex: '-1', text: 'Productos' }),
          el('p', { class: 'vista-sub', text: 'Administra la visibilidad y el estado de tu catálogo.' })),
        botonActualizar),
      filtros,
      resumen,
      resultados
    );

    buscar.addEventListener('input', () => {
      termino = buscar.value.trim().toLocaleLowerCase('es');
      pintarResultados();
    });
    filtroCategoria.addEventListener('change', () => {
      categoria = filtroCategoria.value;
      pintarResultados();
    });
    filtroEstado.addEventListener('change', () => {
      estado = filtroEstado.value;
      pintarResultados();
    });

    function filtrar() {
      return productos.filter((p) => {
        const coincideNombre = p.nombre.toLocaleLowerCase('es').includes(termino);
        const coincideCategoria = categoria === 'todas' || p.categorias.includes(categoria);
        const coincideEstado = estado === 'todos'
          || (estado === 'activos' && p.activo)
          || (estado === 'ocultos' && !p.activo);
        return coincideNombre && coincideCategoria && coincideEstado;
      });
    }

    function tarjetaProducto(p) {
      const imagen = el('img', {
        class: 'producto-imagen',
        src: `../images/${encodeURIComponent(p.imagen)}`,
        alt: '',
        loading: 'lazy',
        onerror: (evento) => {
          evento.currentTarget.hidden = true;
          evento.currentTarget.parentElement.classList.add('sin-imagen');
        },
      });
      const categorias = el('div', { class: 'producto-categorias' },
        ...p.categorias.map((c) => el('span', { class: 'producto-categoria', text: etiquetaCategoria(c) })));
      const estadoBadge = el('span', {
        class: `producto-estado ${p.activo ? 'estado-activo' : 'estado-oculto'}`,
        text: p.activo ? 'Activo' : 'Oculto',
      });
      const botonEstado = crearBotonIcono(
        p.activo ? 'ojo-tachado' : 'ojo',
        p.activo ? 'Ocultar producto' : 'Activar producto',
        '',
        (evento) => cambiarEstado(p, evento.currentTarget),
      );
      const botonEditar = crearBotonIcono('editar', 'Editar (próximamente)', '', () => {}, true);
      const botonEliminar = crearBotonIcono(
        'papelera', 'Eliminar producto', 'accion-eliminar',
        (evento) => eliminarProducto(p, evento.currentTarget),
      );

      return el('article', { class: `producto-card${p.activo ? '' : ' producto-card-oculto'}` },
        el('div', { class: 'producto-card-media' }, imagen,
          el('span', { class: 'producto-id', text: `#${p.id}` })),
        el('div', { class: 'producto-card-info' },
          el('div', { class: 'producto-card-titulo' },
            el('h2', { class: 'producto-nombre', text: p.nombre }),
            estadoBadge),
          el('p', { class: 'producto-precio', text: dinero.format(p.precio) }),
          categorias,
          el('p', { class: 'producto-fecha', text: `Creado: ${formatearFecha(p.creado_en)}` })),
        el('div', { class: 'producto-acciones' }, botonEditar, botonEstado, botonEliminar));
    }

    function filaProducto(p) {
      const imagen = el('img', {
        class: 'producto-miniatura',
        src: `../images/${encodeURIComponent(p.imagen)}`,
        alt: '',
        loading: 'lazy',
        onerror: (evento) => { evento.currentTarget.hidden = true; },
      });
      const estadoBadge = el('span', {
        class: `producto-estado ${p.activo ? 'estado-activo' : 'estado-oculto'}`,
        text: p.activo ? 'Activo' : 'Oculto',
      });
      const categorias = el('div', { class: 'producto-categorias' },
        ...p.categorias.map((c) => el('span', { class: 'producto-categoria', text: etiquetaCategoria(c) })));
      const botonEditar = crearBotonIcono('editar', 'Editar (próximamente)', '', () => {}, true);
      const botonEstado = crearBotonIcono(
        p.activo ? 'ojo-tachado' : 'ojo',
        p.activo ? 'Ocultar producto' : 'Activar producto',
        '',
        (evento) => cambiarEstado(p, evento.currentTarget),
      );
      const botonEliminar = crearBotonIcono(
        'papelera', 'Eliminar producto', 'accion-eliminar',
        (evento) => eliminarProducto(p, evento.currentTarget),
      );

      return el('tr', { class: p.activo ? '' : 'fila-oculta' },
        el('td', { class: 'celda-producto' },
          el('div', { class: 'producto-identidad' }, imagen,
            el('div', {},
              el('span', { class: 'producto-nombre', text: p.nombre }),
              el('span', { class: 'producto-id-tabla', text: `ID #${p.id}` })))),
        el('td', {}, categorias),
        el('td', { class: 'celda-precio', text: dinero.format(p.precio) }),
        el('td', {}, estadoBadge),
        el('td', { class: 'celda-fecha', text: formatearFecha(p.creado_en) }),
        el('td', {},
          el('div', { class: 'producto-acciones' }, botonEditar, botonEstado, botonEliminar)));
    }

    function formatearFecha(valor) {
      const fechaProducto = new Date(valor);
      return Number.isNaN(fechaProducto.getTime()) ? '—' : fecha.format(fechaProducto);
    }

    function pintarResultados() {
      const visibles = filtrar();
      const activos = productos.filter((p) => p.activo).length;
      resumen.textContent = `${visibles.length} de ${productos.length} productos · ${activos} activos · ${productos.length - activos} ocultos`;
      resultados.setAttribute('aria-busy', cargando ? 'true' : 'false');

      if (cargando && productos.length === 0) {
        resultados.replaceChildren(el('div', { class: 'productos-estado-vacio' },
          el('span', { class: 'productos-spinner', 'aria-hidden': 'true' }),
          el('p', { text: 'Cargando catálogo…' })));
        return;
      }
      if (visibles.length === 0) {
        const hayFiltros = Boolean(termino) || categoria !== 'todas' || estado !== 'todos';
        resultados.replaceChildren(
          el('div', { class: 'productos-estado-vacio' },
            icono(hayFiltros ? 'buscar' : 'caja', 'ico ico-grande'),
            el('h2', { text: hayFiltros ? 'No encontramos resultados' : 'Aún no hay productos' }),
            el('p', { text: hayFiltros ? 'Prueba con otra búsqueda o cambia los filtros.' : 'Cuando agregues productos, aparecerán aquí.' }),
            hayFiltros ? el('button', {
              type: 'button', class: 'btn-fantasma btn-chico',
              onclick: () => {
                buscar.value = ''; filtroCategoria.value = 'todas'; filtroEstado.value = 'todos';
                termino = ''; categoria = 'todas'; estado = 'todos'; pintarResultados();
              },
            }, 'Limpiar filtros') : null));
        return;
      }

      const tabla = el('div', { class: 'productos-tabla-wrap' },
        el('table', { class: 'productos-tabla' },
          el('thead', {},
            el('tr', {},
              el('th', { scope: 'col', text: 'Producto' }),
              el('th', { scope: 'col', text: 'Categoría' }),
              el('th', { scope: 'col', text: 'Precio' }),
              el('th', { scope: 'col', text: 'Estado' }),
              el('th', { scope: 'col', text: 'Creado' }),
              el('th', { scope: 'col', text: 'Acciones' }))),
          el('tbody', {}, ...visibles.map(filaProducto))));
      const tarjetas = el('div', { class: 'productos-tarjetas' }, ...visibles.map(tarjetaProducto));
      resultados.replaceChildren(tabla, tarjetas);
    }

    async function cargar() {
      cargando = true;
      botonActualizar.disabled = true;
      botonActualizar.classList.add('girando');
      if (productos.length === 0) pintarResultados();
      try {
        const respuesta = await Sesion.adminFetch('/api/admin/productos');
        if (!Array.isArray(respuesta.productos)) throw new Error('La respuesta del servidor no tiene el formato esperado.');
        productos = respuesta.productos.map((p) => ({
          ...p,
          categorias: Array.isArray(p.categorias) ? p.categorias : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
          activo: Boolean(p.activo),
        }));
        pintarResultados();
      } catch (error) {
        if (error.sesionExpirada) return;
        const botonReintentar = el('button', {
          type: 'button', class: 'btn-fantasma btn-chico',
          onclick: () => UI.ejecutarUnaVez(botonReintentar, cargar, 'Reintentando…'),
        }, 'Reintentar');
        resultados.replaceChildren(
          el('div', { class: 'productos-estado-vacio productos-error' },
            icono('alerta', 'ico ico-grande'),
            el('h2', { text: 'No pudimos cargar los productos' }),
            el('p', { text: error.message }),
            botonReintentar));
      } finally {
        cargando = false;
        botonActualizar.disabled = false;
        botonActualizar.classList.remove('girando');
        resultados.setAttribute('aria-busy', 'false');
      }
    }

    async function cambiarEstado(producto, boton) {
      const nuevoEstado = !producto.activo;
      const verbo = nuevoEstado ? 'activar' : 'ocultar';
      await UI.ejecutarUnaVez(boton, async () => {
        // Se obtiene el registro más reciente y se conserva cada campo al hacer PUT.
        const { producto: actual } = await Sesion.adminFetch(`/api/admin/productos/${producto.id}`);
        const cuerpo = {
          nombre: actual.nombre,
          descripcion: actual.descripcion,
          precio: actual.precio,
          categorias: actual.categorias,
          tags: actual.tags,
          imagen: actual.imagen,
          activo: nuevoEstado,
        };
        await Sesion.adminFetch(`/api/admin/productos/${producto.id}`, { method: 'PUT', body: cuerpo });
        UI.toast(`Producto ${nuevoEstado ? 'activado' : 'ocultado'} correctamente.`);
        await cargar();
      }, nuevoEstado ? 'Activando…' : 'Ocultando…').catch((error) => {
        if (!error?.sesionExpirada) UI.toast(error.message || `No se pudo ${verbo} el producto.`, { tipo: 'error' });
      });
    }

    async function eliminarProducto(producto) {
      const contenido = el('div', { class: 'producto-confirmacion' },
        el('span', { class: 'producto-confirmacion-id', text: `Producto #${producto.id}` }),
        el('strong', { text: producto.nombre }),
        el('span', { text: dinero.format(producto.precio) }));
      const confirmado = await UI.confirmar({
        titulo: '¿Eliminar este producto?',
        mensaje: 'Esta acción es permanente. El producto dejará de existir en el catálogo y no se puede deshacer.',
        contenido,
        casilla: 'Entiendo que esta eliminación es permanente.',
        textoConfirmar: 'Eliminar producto',
        textoOcupado: 'Eliminando…',
        textoCancelar: 'Cancelar',
        peligro: true,
        accion: async () => {
          await Sesion.adminFetch(`/api/admin/productos/${producto.id}`, { method: 'DELETE' });
          productos = productos.filter((p) => p.id !== producto.id);
          pintarResultados();
          UI.toast('Producto eliminado.');
        },
      });
      if (confirmado) {
        const titulo = document.getElementById('vista-titulo');
        if (titulo) titulo.focus({ preventScroll: true });
      }
    }

    // Carga inicial: solo GET. No se altera ningún producto al abrir esta vista.
    cargar();
  }

  // El panel.js consulta este nombre al resolver la ruta.
  window.renderProductos = renderProductos;
})();
