// RAJUKO Admin — sesion.js
// Todo lo relativo a la SESIÓN del administrador en un solo lugar:
// guardar/leer/borrar el token, saber si expiró y gestionar los errores 401.
//
// DÓNDE SE GUARDA EL TOKEN: en sessionStorage. Se borra solo al cerrar la
// pestaña y no se comparte entre pestañas. Se descartaron:
//   - localStorage: el token sobreviviría semanas en el navegador.
//   - Cookies HttpOnly: el frontend (GitHub Pages) y la API (Render) están en
//     dominios distintos y los navegadores bloquean las cookies de terceros.
// Riesgo residual (XSS: un script malicioso podría leer sessionStorage): se
// mitiga con (1) todo el contenido dinámico del panel se escribe con textContent,
// nunca con innerHTML; (2) token de corta vida (2 h); (3) el panel no carga
// ningún script externo.
//
// IMPORTANTE: esto es solo experiencia de usuario. La seguridad real está en el
// servidor: sin un token válido, la API rechaza (401) cualquier ruta /api/admin/*.
const Sesion = {
  CLAVE: 'rajuko_admin_token',

  leer() {
    try { return window.sessionStorage.getItem(Sesion.CLAVE); } catch { return null; }
  },

  // Devuelve false si el navegador bloquea el almacenamiento (p. ej. modo restringido).
  guardar(token) {
    try { window.sessionStorage.setItem(Sesion.CLAVE, token); return true; } catch { return false; }
  },

  borrar() {
    try { window.sessionStorage.removeItem(Sesion.CLAVE); } catch { /* nada que borrar */ }
  },

  // Lee la fecha de expiración (claim "exp") del token. Se decodifica SIN verificar
  // la firma —no hace falta ni se puede en el navegador—: solo sirve para avisar
  // al usuario y cerrar la sesión a tiempo. El servidor es quien manda.
  expiracionMs(token) {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(base64));
      return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
      return null;
    }
  },

  vigente(token) {
    const exp = Sesion.expiracionMs(token);
    return exp !== null && exp > Date.now();
  },

  // Navegación. Está en una función aparte para poder sustituirla en las pruebas.
  // replace() (en vez de asignar location.href) evita que el botón "Atrás" vuelva al panel.
  ir(destino) {
    window.location.replace(destino);
  },

  // Cierra la sesión: borra el token y vuelve al login.
  // motivo: 'expirada' | 'salio' | undefined (se muestra un aviso en el login)
  cerrar(motivo) {
    Sesion.borrar();
    Sesion.ir(motivo ? `login.html?motivo=${motivo}` : 'login.html');
  },

  // Llamada a la API CON el token. Punto único donde se gestionan las sesiones caídas:
  //  - sin token o token vencido -> se vuelve al login sin gastar una petición;
  //  - 401 del servidor (token falso, revocado o admin eliminado) -> igual.
  // En ambos casos el error lanzado lleva `sesionExpirada = true` para que quien
  // llamó no muestre un mensaje de error encima de la redirección.
  async adminFetch(ruta, opciones = {}) {
    const token = Sesion.leer();
    if (!token || !Sesion.vigente(token)) {
      Sesion.cerrar(token ? 'expirada' : undefined);
      throw Object.assign(new Error('Sesión no válida.'), { sesionExpirada: true });
    }
    try {
      return await apiFetch(ruta, { ...opciones, token });
    } catch (error) {
      if (error.status === 401) {
        Sesion.cerrar('expirada');
        error.sesionExpirada = true;
      }
      throw error;
    }
  },
};
