// Bandeja de mensajes de contacto para el panel de administración.
// Estas rutas ya están protegidas: las monta routes/admin.js detrás de
// `requerirAdmin`, así que aquí no se vuelve a comprobar la sesión.
//
//   GET    /api/admin/mensajes?leido=0|1&pagina=1&limite=50  -> lista (más nuevos primero)
//   GET    /api/admin/mensajes/:id                           -> uno
//   PATCH  /api/admin/mensajes/:id   { "leido": true|false } -> marcar leído / no leído
//   DELETE /api/admin/mensajes/:id                           -> eliminar
//
// Los mensajes los crea el formulario público (POST /api/contacto). Aquí solo se
// pueden leer, marcar y eliminar: no hay forma de crearlos ni de editar su contenido.
import { Router } from 'express';
import { pool } from '../db.js';
import { leerId } from '../validarId.js';

export const adminMensajesRouter = Router();

const COLUMNAS = 'id, nombre, email, mensaje, leido, creado_en';
const LIMITE_POR_DEFECTO = 50;
const LIMITE_MAXIMO = 100;

// Convierte una fila de la base de datos al formato de la API.
function formatear(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    mensaje: fila.mensaje,
    leido: Boolean(fila.leido),
    creado_en: fila.creado_en,
  };
}

// Lee un parámetro numérico de la query string (?pagina=2). Devuelve el valor por
// defecto si no viene, el número si es válido, o null si es inválido.
// (Un parámetro repetido, ?pagina=1&pagina=2, llega como lista y se rechaza.)
function leerEntero(valor, porDefecto, min, max) {
  if (valor === undefined) return porDefecto;
  if (typeof valor !== 'string' || !/^\d{1,6}$/.test(valor)) return null;
  const numero = Number(valor);
  return numero >= min && numero <= max ? numero : null;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM mensajes WHERE id = ?`, [id]);
  return filas[0];
}

adminMensajesRouter.get('/', async (req, res) => {
  const { leido } = req.query;
  const pagina = leerEntero(req.query.pagina, 1, 1, 100000);
  const limite = leerEntero(req.query.limite, LIMITE_POR_DEFECTO, 1, LIMITE_MAXIMO);

  if (leido !== undefined && leido !== '0' && leido !== '1') {
    return res.status(400).json({ error: 'El filtro "leido" solo admite 0 o 1.' });
  }
  if (pagina === null) return res.status(400).json({ error: 'La "pagina" debe ser un entero positivo.' });
  if (limite === null) {
    return res.status(400).json({ error: `El "limite" debe estar entre 1 y ${LIMITE_MAXIMO}.` });
  }

  // `donde` es un texto fijo escrito aquí (nunca viene del usuario); el valor del
  // filtro viaja siempre como parámetro (?), lo que previene inyección SQL.
  const donde = leido === undefined ? '' : 'WHERE leido = ?';
  const parametros = leido === undefined ? [] : [Number(leido)];

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM mensajes ${donde}`, parametros);
  const [[{ noLeidos }]] = await pool.query('SELECT COUNT(*) AS noLeidos FROM mensajes WHERE leido = 0');

  const [filas] = await pool.query(
    `SELECT ${COLUMNAS} FROM mensajes ${donde}
      ORDER BY creado_en DESC, id DESC
      LIMIT ? OFFSET ?`,
    [...parametros, limite, (pagina - 1) * limite]
  );

  res.json({
    mensajes: filas.map(formatear),
    total: Number(total), // mensajes que cumplen el filtro (para paginar)
    no_leidos: Number(noLeidos), // sin leer en TODA la bandeja (para el contador del panel)
    pagina,
    limite,
  });
});

// Consultar un mensaje NO lo marca como leído: marcarlo es una acción explícita (PATCH).
adminMensajesRouter.get('/:id', async (req, res) => {
  const id = leerId(req, res, 'mensaje');
  if (id === null) return;

  const mensaje = await buscarPorId(id);
  if (!mensaje) return res.status(404).json({ error: 'Mensaje no encontrado.' });
  res.json({ mensaje: formatear(mensaje) });
});

// PATCH modifica UN solo campo ("leido"). Cualquier otro dato del body
// (nombre, email, mensaje...) se ignora: el contenido de un mensaje no se edita.
adminMensajesRouter.patch('/:id', async (req, res) => {
  const id = leerId(req, res, 'mensaje');
  if (id === null) return;

  const leido = req.body?.leido;
  if (typeof leido !== 'boolean') {
    return res.status(400).json({
      error: 'Indica si el mensaje está leído (true) o no (false).',
      campos: { leido: 'Debe ser verdadero o falso.' },
    });
  }

  if (!(await buscarPorId(id))) return res.status(404).json({ error: 'Mensaje no encontrado.' });

  await pool.query('UPDATE mensajes SET leido = ? WHERE id = ?', [leido ? 1 : 0, id]);
  res.json({ mensaje: formatear(await buscarPorId(id)) });
});

adminMensajesRouter.delete('/:id', async (req, res) => {
  const id = leerId(req, res, 'mensaje');
  if (id === null) return;

  if (!(await buscarPorId(id))) return res.status(404).json({ error: 'Mensaje no encontrado.' });

  await pool.query('DELETE FROM mensajes WHERE id = ?', [id]);
  res.json({ ok: true });
});
