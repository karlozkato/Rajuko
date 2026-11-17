// RAJUKO Admin — login.js
// Pantalla de acceso. Usa la API existente POST /api/auth/login.
// Requiere cargados antes: ../config.js, ../api.js, sesion.js

(function () {
  const form = document.getElementById('form-login');
  const nota = document.getElementById('login-nota');
  const error = document.getElementById('login-error');
  const boton = document.getElementById('login-boton');
  const campoEmail = document.getElementById('login-email');
  const campoPassword = document.getElementById('login-password');
  const ojo = document.getElementById('login-ojo');

  // Si ya hay una sesión vigente, no tiene sentido pedir credenciales otra vez.
  const tokenActual = Sesion.leer();
  if (tokenActual && Sesion.vigente(tokenActual)) {
    Sesion.ir('index.html');
    return;
  }

  // Avisos al llegar desde el panel (?motivo=...). Solo se aceptan valores de esta
  // lista y el texto sale de aquí: nunca se refleja en la página lo que venga en la URL.
  const AVISOS = {
    expirada: 'Tu sesión expiró o ya no es válida. Inicia sesión de nuevo.',
    salio: 'Cerraste sesión correctamente.',
  };
  const motivo = new URLSearchParams(window.location.search).get('motivo');
  if (Object.prototype.hasOwnProperty.call(AVISOS, motivo)) {
    nota.textContent = AVISOS[motivo];
    nota.hidden = false;
    // Se limpia la URL para que el aviso no reaparezca al recargar.
    window.history.replaceState(null, '', window.location.pathname);
  }

  const mostrarError = (texto) => { error.textContent = texto; error.hidden = false; };
  const ocultarError = () => { error.hidden = true; error.textContent = ''; };

  // Mostrar / ocultar contraseña
  ojo.addEventListener('click', () => {
    const visible = campoPassword.type === 'text';
    campoPassword.type = visible ? 'password' : 'text';
    ojo.setAttribute('aria-pressed', String(!visible));
    ojo.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
    ojo.classList.toggle('activo', !visible);
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarError();
    nota.hidden = true;

    const email = campoEmail.value.trim();
    const password = campoPassword.value;
    if (!email || !password) {
      mostrarError('Escribe tu correo y tu contraseña.');
      (email ? campoPassword : campoEmail).focus();
      return;
    }

    // Botón bloqueado mientras se envía: evita dobles envíos (y gastar intentos del límite).
    boton.disabled = true;
    boton.setAttribute('aria-busy', 'true');
    boton.querySelector('span').textContent = 'Entrando…';

    try {
      const { token } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        onLento: () => mostrarError('Despertando el servidor… la primera vez puede tardar hasta un minuto.'),
      });

      if (typeof token !== 'string' || !Sesion.guardar(token)) {
        throw new Error('Tu navegador bloquea el almacenamiento de la sesión. Desactiva el modo restringido e inténtalo de nuevo.');
      }
      Sesion.ir('index.html');
    } catch (fallo) {
      mostrarError(fallo.message);
      campoPassword.value = ''; // la contraseña nunca se queda en el formulario tras un fallo
      campoPassword.focus();
      boton.disabled = false;
      boton.removeAttribute('aria-busy');
      boton.querySelector('span').textContent = 'Entrar';
    }
  });
})();
