// Validación de datos que llegan de formularios públicos.
// El frontend también valida (para dar respuesta rápida), pero ESTA validación
// es la que cuenta: cualquiera puede saltarse el JavaScript del navegador.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Devuelve el texto sin espacios sobrantes, o '' si no es un string.
const limpiar = (valor) => (typeof valor === 'string' ? valor.trim() : '');

export function validarEmail(valor) {
  const email = limpiar(valor).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 150) {
    return { email, error: 'Escribe un correo válido, por ejemplo nombre@correo.com.' };
  }
  return { email, error: null };
}

export function validarContacto(body = {}) {
  const nombre = limpiar(body.nombre);
  const mensaje = limpiar(body.mensaje);
  const { email, error: errorEmail } = validarEmail(body.email);

  const campos = {};
  if (nombre.length < 2) campos.nombre = 'Escribe tu nombre (mínimo 2 caracteres).';
  else if (nombre.length > 100) campos.nombre = 'El nombre es demasiado largo (máximo 100).';

  if (errorEmail) campos.email = errorEmail;

  if (mensaje.length < 10) campos.mensaje = 'Cuéntanos un poco más (mínimo 10 caracteres).';
  else if (mensaje.length > 2000) campos.mensaje = 'El mensaje es demasiado largo (máximo 2000).';

  return { valores: { nombre, email, mensaje }, campos };
}
