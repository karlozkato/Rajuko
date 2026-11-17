// CRUD de productos para el panel de administración.
// Todas estas rutas están protegidas: las monta routes/admin.js detrás de
// `requerirAdmin`, así que aquí no hace falta volver a comprobar la sesión.
//
//   GET    /api/admin/productos       -> todos (también los inactivos)
//   GET    /api/admin/productos/:id   -> uno
//   POST   /api/admin/productos       -> crear
//   PUT    /api/admin/productos/:id   -> reemplazar sus datos
//   DELETE /api/admin/productos/:id   -> eliminar
//
// Diferencia con la API pública: aquí `categorias` y `tags` son LISTAS
// (["accesorios","gamer"]); en la base de datos se guardan como texto.
import { Router } from 'express';
import { pool } from '../db.js';
import { validarProducto } from '../validarProducto.js';

export const adminProductosRouter = Router();

const COLUMNAS = 'id, nombre, descripcion, precio, categorias, tags, imagen, activo, creado_en';

// Convierte una fila de la base de datos al formato de la API.
function formatear(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precio: fila.precio,
    categorias: fila.categorias.split(' ').filter(Boolean),
    tags: fila.tags ? fila.tags.split(',') : [],
    imagen: fila.imagen,
    activo: Boolean(fila.activo),
    creado_en: fila.creado_en,
  };
}

// Valida el :id de la URL. Solo enteros positivos: así nada raro llega a la consulta.
function leerId(req, res) {
  if (!/^[1-9]\d{0,9}$/.test(req.params.id)) {
    res.status(400).json({ error: 'Identificador de producto no válido.' });
    return null;
  }
  return Number(req.params.id);
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM productos WHERE id = ?`, [id]);
  return filas[0];
}

adminProductosRouter.get('/', async (_req, res) => {
  const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM productos ORDER BY id`);
  res.json({ productos: filas.map(formatear) });
});

adminProductosRouter.get('/:id', async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  const producto = await buscarPorId(id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
  res.json({ producto: formatear(producto) });
});

adminProductosRouter.post('/', async (req, res) => {
  const { valores, campos } = validarProducto(req.body);
  if (Object.keys(campos).length > 0) {
    return res.status(400).json({ error: 'Revisa los campos marcados.', campos });
  }

  // Solo se insertan los campos validados: cualquier otro dato del body
  // (por ejemplo "id" o "creado_en") se ignora.
  const [resultado] = await pool.query(
    `INSERT INTO productos (nombre, descripcion, precio, categorias, tags, imagen, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      valores.nombre,
      valores.descripcion,
      valores.precio,
      valores.categorias.join(' '),
      valores.tags.join(','),
      valores.imagen,
      valores.activo === false ? 0 : 1, // por defecto, un producto nuevo queda activo
    ]
  );

  const creado = await buscarPorId(resultado.insertId);
  res.status(201).json({ producto: formatear(creado) });
});

adminProductosRouter.put('/:id', async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  const existente = await buscarPorId(id);
  if (!existente) return res.status(404).json({ error: 'Producto no encontrado.' });

  const { valores, campos } = validarProducto(req.body);
  if (Object.keys(campos).length > 0) {
    return res.status(400).json({ error: 'Revisa los campos marcados.', campos });
  }

  // Si la petición no trae "activo", se conserva el estado actual: así editar
  // el nombre no reactiva sin querer un producto que estaba oculto.
  const activo = valores.activo === undefined ? Boolean(existente.activo) : valores.activo;

  await pool.query(
    `UPDATE productos
        SET nombre = ?, descripcion = ?, precio = ?, categorias = ?, tags = ?, imagen = ?, activo = ?
      WHERE id = ?`,
    [
      valores.nombre,
      valores.descripcion,
      valores.precio,
      valores.categorias.join(' '),
      valores.tags.join(','),
      valores.imagen,
      activo ? 1 : 0,
      id,
    ]
  );

  res.json({ producto: formatear(await buscarPorId(id)) });
});

adminProductosRouter.delete('/:id', async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  if (!(await buscarPorId(id))) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }
  await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  res.json({ ok: true });
});
