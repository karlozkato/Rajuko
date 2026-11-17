// RAJUKO Admin — ui.js
// Piezas de interfaz COMPARTIDAS por las pantallas del panel (Productos ahora,
// Mensajes más adelante). Se escriben una sola vez aquí para no repetirlas.
//
//   UI.toast(mensaje, { tipo, duracion })
//       Aviso breve en una esquina. tipo: 'exito' (por defecto) | 'error' | 'info'.
//
//   UI.confirmar({ titulo, mensaje, contenido, casilla, textoConfirmar,
//                  textoCancelar, textoOcupado, peligro, accion })
//       Ventana de confirmación. Devuelve una Promesa: true si la acción se
//       completó (o si se confirmó y no había `accion`), false si se canceló.
//       Si se pasa `accion` (función async), la ventana se queda abierta mientras
//       se ejecuta, bloquea los botones y, si falla, muestra el error dentro de la
//       ventana para poder reintentar o cancelar.
//         - contenido: un nodo del DOM opcional (por ejemplo la foto y el nombre
//           del producto que se va a eliminar).
//         - casilla: texto opcional de una casilla que hay que marcar para poder
//           confirmar ("Entiendo que es permanente").
//         - peligro: true pinta el botón en rojo y deja el foco en "Cancelar".
//
//   UI.ejecutarUnaVez(boton, accion, textoOcupado)
//       Ejecuta `accion` y mantiene el botón bloqueado hasta que termine, de modo
//       que un doble clic (o un toque repetido en el móvil) no la dispare dos veces.
//
// Requiere: dom.js (el, icono) y los iconos del sprite de index.html.
// Seguridad: todo texto entra con textContent (vía el()); nunca se usa innerHTML.

const UI = (function () {
  'use strict';

  // ---------- Toasts (avisos breves) ----------
  const MAX_TOASTS = 4;
  const DURACION = { exito: 4000, info: 4000, error: 8000 }; // los errores se leen más despacio
  const ICONO_TOAST = { exito: 'check', error: 'alerta', info: 'info' };
  let contenedorToasts = null;

  function obtenerContenedorToasts() {
    if (!contenedorToasts || !contenedorToasts.isConnected) {
      contenedorToasts = el('div', { class: 'toasts' });
      document.body.append(contenedorToasts);
    }
    return contenedorToasts;
  }

  function toast(mensaje, { tipo = 'exito', duracion } = {}) {
    if (!ICONO_TOAST[tipo]) tipo = 'info';
    const contenedor = obtenerContenedorToasts();
    const clave = `${tipo}|${mensaje}`;
    const ms = duracion ?? DURACION[tipo];

    // Si ya hay un aviso idéntico en pantalla (p. ej. por un doble clic), no se
    // apila otro: se reinicia el tiempo del que ya está.
    const repetido = [...contenedor.children].find((n) => n.dataset.clave === clave);
    if (repetido) {
      repetido.reiniciar();
      return;
    }

    let temporizador = null;
    const cerrar = () => { clearTimeout(temporizador); nodo.remove(); };
    const detener = () => clearTimeout(temporizador);
    const programar = () => { clearTimeout(temporizador); temporizador = setTimeout(cerrar, ms); };

    // role="alert" interrumpe al lector de pantalla (errores); role="status" espera su turno.
    const nodo = el('div', { class: `toast toast-${tipo}`, role: tipo === 'error' ? 'alert' : 'status', 'data-clave': clave },
      icono(ICONO_TOAST[tipo], 'ico toast-icono'),
      el('p', { class: 'toast-texto', text: mensaje }),
      el('button', { type: 'button', class: 'toast-cerrar', 'aria-label': 'Cerrar aviso', onclick: cerrar }, icono('cerrar')));
    nodo.reiniciar = programar;

    // Mientras el cursor o el foco están sobre el aviso, no desaparece.
    nodo.addEventListener('mouseenter', detener);
    nodo.addEventListener('mouseleave', programar);
    nodo.addEventListener('focusin', detener);
    nodo.addEventListener('focusout', programar);

    contenedor.append(nodo);
    while (contenedor.children.length > MAX_TOASTS) contenedor.firstElementChild.remove();
    programar();
  }

  // ---------- Protección contra doble ejecución ----------
  async function ejecutarUnaVez(boton, accion, textoOcupado) {
    // Si ya hay una ejecución en curso (o el botón está bloqueado), se ignora el clic.
    if (boton.dataset.ocupado === 'true' || boton.disabled) return undefined;

    boton.dataset.ocupado = 'true';
    boton.setAttribute('aria-busy', 'true');
    boton.disabled = true;

    // Texto del botón: el <span class="btn-texto"> si existe o, si el botón solo
    // contiene texto, el propio botón. Un botón de solo icono no cambia de texto.
    const destino = boton.querySelector('.btn-texto') || (boton.children.length === 0 ? boton : null);
    const original = destino ? destino.textContent : null;
    if (destino && textoOcupado) destino.textContent = textoOcupado;

    try {
      return await accion();
    } finally {
      boton.disabled = false;
      boton.removeAttribute('aria-busy');
      delete boton.dataset.ocupado;
      if (destino && textoOcupado) destino.textContent = original;
    }
  }

  // ---------- Ventana de confirmación ----------
  let modalAbierto = false;
  let contadorIds = 0;
  const FOCALES = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

  function confirmar({
    titulo, mensaje, contenido, casilla: textoCasilla,
    textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', textoOcupado = 'Procesando…',
    peligro = false, accion,
  } = {}) {
    // Solo una ventana a la vez: un segundo clic rápido no abre otra encima.
    if (modalAbierto) return Promise.resolve(false);
    modalAbierto = true;

    return new Promise((resolver) => {
      const previo = document.activeElement;
      const app = document.querySelector('.app');
      const idTitulo = `modal-titulo-${++contadorIds}`;
      const idTexto = `modal-texto-${contadorIds}`;
      let ocupado = false;

      const textoBotonConfirmar = el('span', { class: 'btn-texto', text: textoConfirmar });
      const botonConfirmar = el('button', { type: 'button', class: peligro ? 'btn-peligro' : 'btn-primario', onclick: ejecutar }, textoBotonConfirmar);
      const botonCancelar = el('button', { type: 'button', class: 'btn-fantasma', onclick: cancelar }, el('span', { class: 'btn-texto', text: textoCancelar }));

      const casilla = textoCasilla ? el('input', { type: 'checkbox' }) : null;
      if (casilla) {
        botonConfirmar.disabled = true; // no se puede confirmar hasta marcar la casilla
        casilla.addEventListener('change', () => { botonConfirmar.disabled = !casilla.checked; });
      }

      const zonaError = el('div', { class: 'aviso aviso-error modal-error', role: 'alert', hidden: true }, el('p', { text: '' }));

      const modal = el('div', {
        class: 'modal', role: peligro ? 'alertdialog' : 'dialog', 'aria-modal': 'true', tabindex: '-1',
        'aria-labelledby': idTitulo, 'aria-describedby': mensaje ? idTexto : undefined,
      },
      el('h2', { class: 'modal-titulo', id: idTitulo, text: titulo }),
      mensaje ? el('p', { class: 'modal-texto', id: idTexto, text: mensaje }) : null,
      contenido || null,
      casilla ? el('label', { class: 'modal-casilla' }, casilla, el('span', { text: textoCasilla })) : null,
      zonaError,
      el('div', { class: 'modal-acciones' }, botonCancelar, botonConfirmar));

      const capa = el('div', { class: 'modal-capa' }, modal);

      function cerrar(resultado) {
        document.removeEventListener('keydown', alTeclear, true);
        capa.remove();
        document.body.classList.remove('modal-abierto');
        if (app) app.inert = false;
        modalAbierto = false;
        // El foco vuelve a donde estaba. Si ese elemento ya no existe (la lista se
        // redibujó tras eliminar), pasa al contenido principal.
        const destino = previo && previo.isConnected ? previo : document.getElementById('vista');
        if (destino && typeof destino.focus === 'function') destino.focus({ preventScroll: true });
        resolver(resultado);
      }

      function cancelar() {
        if (ocupado) return; // con una acción en curso no se puede cancelar a medias
        cerrar(false);
      }

      async function ejecutar() {
        if (ocupado || (casilla && !casilla.checked)) return; // segunda defensa contra el doble clic
        ocupado = true;
        zonaError.hidden = true;
        botonCancelar.disabled = true;
        botonConfirmar.disabled = true;
        botonConfirmar.setAttribute('aria-busy', 'true');
        if (casilla) casilla.disabled = true;
        textoBotonConfirmar.textContent = textoOcupado;
        modal.focus(); // el foco se queda dentro de la ventana mientras los botones están bloqueados

        try {
          if (accion) await accion();
          cerrar(true);
        } catch (error) {
          if (error && error.sesionExpirada) { cerrar(false); return; } // ya se está yendo al login
          ocupado = false;
          zonaError.firstElementChild.textContent = (error && error.message) || 'No se pudo completar la acción. Inténtalo de nuevo.';
          zonaError.hidden = false;
          botonCancelar.disabled = false;
          botonConfirmar.disabled = casilla ? !casilla.checked : false;
          botonConfirmar.removeAttribute('aria-busy');
          if (casilla) casilla.disabled = false;
          textoBotonConfirmar.textContent = textoConfirmar;
          (peligro ? botonCancelar : botonConfirmar).focus();
        }
      }

      // Teclado: Escape cancela y Tab/Shift+Tab se quedan dentro de la ventana.
      function alTeclear(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          cancelar();
          return;
        }
        if (e.key !== 'Tab') return;
        const focales = [...modal.querySelectorAll(FOCALES)];
        if (focales.length === 0) { e.preventDefault(); return; }
        const primero = focales[0];
        const ultimo = focales[focales.length - 1];
        const activo = document.activeElement;
        if (!modal.contains(activo) || (activo === modal && !e.shiftKey)) {
          e.preventDefault();
          primero.focus();
        } else if (e.shiftKey && (activo === primero || activo === modal)) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && activo === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }

      // Pulsar sobre el fondo oscuro cancela. Se usa mousedown (no click) para que
      // arrastrar el cursor desde dentro de la ventana hacia fuera no la cierre sin querer.
      capa.addEventListener('mousedown', (e) => { if (e.target === capa) cancelar(); });
      document.addEventListener('keydown', alTeclear, true);

      document.body.append(capa);
      document.body.classList.add('modal-abierto');
      if (app) app.inert = true; // el resto del panel no recibe foco ni clics mientras la ventana está abierta

      // En acciones destructivas el foco empieza en "Cancelar": un Enter distraído no borra nada.
      (peligro ? botonCancelar : botonConfirmar.disabled ? modal : botonConfirmar).focus();
    });
  }

  return { toast, confirmar, ejecutarUnaVez };
})();
