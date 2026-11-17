// Validación de los datos de un producto enviados desde el panel de administración.
// Es la validación que cuenta: el formulario del navegador solo ayuda al usuario,
// pero cualquiera puede enviar peticiones directas a la API.

export const CATEGORIAS_VALIDAS = ['ropa', 'accesorios', 'gamer', 'novedades'];

// Nombre de archivo de imagen: letras, números, guion, guion bajo y puntos, y
// DEBE terminar en un punto seguido de una extensión permitida.
//  - "\." escapa el punto de la extensión: sin la barra invertida, "." significaría
//    "cualquier carácter" y "fotojpg" (sin punto) pasaría como válido.
//  - No admite "/" ni "\", así que no se puede apuntar fuera de la carpeta de imágenes.
//  - (?!.*\.\.) prohíbe ".." (dos puntos seguidos) y el primer carácter no puede ser un punto.
export const IMAGEN_RE = /^(?!.*\.\.)[A-Za-z0-9_-][A-Za-z0-9_.-]{0,100}\.(?:jpg|jpeg|png|avif|webp)$/i;

// Etiquetas de estética (las usará la IA): minúsculas, números y guiones.
const TAG_RE = /^[a-z0-9-]{1,20}$/;
const MAX_TAGS = 10;
const PRECIO_MAX = 10_000_000; // COP

const limpiar = (valor) => (typeof valor === 'string' ? valor.trim() : '');

// Devuelve { valores, campos }. Si `campos` tiene claves, hay errores.
// Todos los campos son obligatorios salvo `activo`, que es opcional (si no
// viene, `valores.activo` queda en undefined y quien llama decide el valor).
export function validarProducto(body = {}) {
  const campos = {};

  const nombre = limpiar(body.nombre);
  if (nombre.length < 2) campos.nombre = 'El nombre debe tener al menos 2 caracteres.';
  else if (nombre.length > 120) campos.nombre = 'El nombre es demasiado largo (máximo 120).';

  const descripcion = limpiar(body.descripcion);
  if (descripcion.length < 5) campos.descripcion = 'La descripción debe tener al menos 5 caracteres.';
  else if (descripcion.length > 1000) campos.descripcion = 'La descripción es demasiado larga (máximo 1000).';

  // El precio debe ser un número entero (pesos, sin decimales), no un texto.
  const precio = body.precio;
  if (typeof precio !== 'number' || !Number.isInteger(precio) || precio < 0 || precio > PRECIO_MAX) {
    campos.precio = `El precio debe ser un número entero entre 0 y ${PRECIO_MAX.toLocaleString('es-CO')}.`;
  }

  // Categorías: lista no vacía de valores permitidos. Se guardan en un orden fijo.
  let categorias = [];
  if (!Array.isArray(body.categorias) || body.categorias.length === 0) {
    campos.categorias = 'Elige al menos una categoría.';
  } else if (!body.categorias.every((c) => CATEGORIAS_VALIDAS.includes(c))) {
    campos.categorias = `Categorías permitidas: ${CATEGORIAS_VALIDAS.join(', ')}.`;
  } else {
    categorias = CATEGORIAS_VALIDAS.filter((c) => body.categorias.includes(c));
  }

  // Tags: opcionales; se normalizan (minúsculas, sin espacios, sin repetidos).
  let tags = [];
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || !body.tags.every((t) => typeof t === 'string')) {
      campos.tags = 'Las etiquetas deben ser una lista de textos.';
    } else {
      tags = [...new Set(body.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
      if (tags.length > MAX_TAGS) {
        campos.tags = `Máximo ${MAX_TAGS} etiquetas.`;
      } else if (!tags.every((t) => TAG_RE.test(t))) {
        campos.tags = 'Cada etiqueta: solo minúsculas, números y guiones (máximo 20 caracteres).';
      }
    }
  }

  const imagen = limpiar(body.imagen);
  if (!IMAGEN_RE.test(imagen)) {
    campos.imagen = 'Nombre de imagen no válido. Ejemplo: Camisa_Retro.jpg (extensiones: jpg, jpeg, png, avif, webp).';
  }

  let activo;
  if (body.activo !== undefined) {
    if (typeof body.activo !== 'boolean') campos.activo = 'El estado "activo" debe ser verdadero o falso.';
    else activo = body.activo;
  }

  return { valores: { nombre, descripcion, precio, categorias, tags, imagen, activo }, campos };
}
