// Validación del identificador (:id) que llega en la URL.
// Solo se aceptan enteros positivos de hasta 10 dígitos, sin ceros a la izquierda,
// signos, decimales ni espacios: así nada extraño llega a la consulta SQL.
//
// Nota: adminProductos.js tiene una copia local de esta misma función. Se dejó
// intacta a propósito (era código ya probado); cuando se quiera, puede refactorizarse
// para importar esta.
const ID_RE = /^[1-9]\d{0,9}$/;

// Devuelve el id como número, o responde 400 y devuelve null (quien llama debe
// terminar su ejecución si recibe null).
export function leerId(req, res, nombreRecurso = 'recurso') {
  if (!ID_RE.test(req.params.id)) {
    res.status(400).json({ error: `Identificador de ${nombreRecurso} no válido.` });
    return null;
  }
  return Number(req.params.id);
}
