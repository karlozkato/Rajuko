// RAJUKO — formularios.js
// Formulario de contacto (#form-contacto) y de newsletter (#form-newsletter).
// Cada uno valida en el navegador (respuesta inmediata) y luego envía los
// datos a la API. El backend vuelve a validar: esta validación es solo UX.

document.addEventListener('DOMContentLoaded', () => {
  const contacto = document.getElementById('form-contacto');
  if (contacto) {
    activarFormulario(contacto, {
      endpoint: '/api/contacto',
      estado: document.getElementById('contacto-estado'),
    });
  }

  const newsletter = document.getElementById('form-newsletter');
  if (newsletter) {
    activarFormulario(newsletter, {
      endpoint: '/api/suscriptores',
      estado: document.getElementById('newsletter-estado'),
    });
  }
});

// Mismas reglas que backend/src/validar.js. Devuelven '' si el valor es válido.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALIDADORES = {
  nombre(v) {
    if (v.length < 2) return 'Escribe tu nombre (mínimo 2 caracteres).';
    if (v.length > 100) return 'El nombre es demasiado largo (máximo 100).';
    return '';
  },
  email(v) {
    return EMAIL_RE.test(v) && v.length <= 150
      ? ''
      : 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  },
  mensaje(v) {
    if (v.length < 10) return 'Cuéntanos un poco más (mínimo 10 caracteres).';
    if (v.length > 2000) return 'El mensaje es demasiado largo (máximo 2000).';
    return '';
  },
};

// Mensaje general del formulario (éxito, error o cargando).
function ponerEstado(elemento, tipo, texto) {
  elemento.textContent = texto;
  elemento.className = 'form-estado' + (tipo ? ` form-estado--${tipo}` : '');
}

// Mensaje de error de un campo concreto + atributo de accesibilidad.
function ponerErrorCampo(form, nombre, texto) {
  const campo = form.elements[nombre];
  const zonaError = form.querySelector(`[data-error-de="${nombre}"]`);
  if (campo) campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
  if (zonaError) {
    zonaError.textContent = texto;
    zonaError.hidden = !texto;
  }
}

function activarFormulario(form, { endpoint, estado }) {
  const nombresCampos = Array.from(form.querySelectorAll('[name]')).map((el) => el.name);

  // Al escribir en un campo con error, se limpia ese error.
  form.addEventListener('input', (e) => {
    if (e.target.name) ponerErrorCampo(form, e.target.name, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1) Validación en el navegador.
    const datos = {};
    let primerInvalido = null;
    nombresCampos.forEach((nombre) => {
      datos[nombre] = form.elements[nombre].value.trim();
      const mensaje = VALIDADORES[nombre](datos[nombre]);
      ponerErrorCampo(form, nombre, mensaje);
      if (mensaje && !primerInvalido) primerInvalido = nombre;
    });
    if (primerInvalido) {
      form.elements[primerInvalido].focus();
      ponerEstado(estado, 'error', 'Revisa los campos marcados.');
      return;
    }

    // 2) Envío a la API, con el botón bloqueado para evitar envíos dobles.
    const boton = form.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Enviando…';
    ponerEstado(estado, 'cargando', 'Enviando…');

    try {
      const respuesta = await apiFetch(endpoint, {
        method: 'POST',
        body: datos,
        onLento: () =>
          ponerEstado(
            estado,
            'cargando',
            'Despertando el servidor… la primera vez puede tardar hasta un minuto.'
          ),
      });
      form.reset();
      ponerEstado(estado, 'exito', respuesta.mensaje);
    } catch (error) {
      // Si el backend devolvió errores por campo, se muestran junto a cada uno.
      if (error.campos) {
        Object.entries(error.campos).forEach(([n, m]) => ponerErrorCampo(form, n, m));
      }
      ponerEstado(estado, 'error', error.message);
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });
}
