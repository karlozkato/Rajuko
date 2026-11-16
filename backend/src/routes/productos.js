// Rutas públicas del catálogo.
//   GET /api/productos              -> todos los productos activos
//   GET /api/productos?categoria=x  -> solo los de esa categoría
import { Router } from 'express';
import { pool } from '../db.js';

export const productosRouter = Router();

// Las categorías válidas coinciden con los filtros del frontend.
const CATEGORIAS = ['ropa', 'accesorios', 'gamer', 'novedades'];

productosRouter.get('/', async (req, res) => {
  const { categoria } = req.query;

  if (categoria !== undefined && !CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida.' });
  }

  // Consulta parametrizada (?): el valor nunca se concatena al SQL, lo que
  // previene inyección SQL. Las categorías se guardan separadas por espacio
  // ("accesorios gamer"), por eso se busca con FIND_IN_SET sobre una versión
  // con comas.
  let sql = `SELECT id, nombre, descripcion, precio, categorias, tags, imagen
             FROM productos WHERE activo = 1`;
  const params = [];

  if (categoria) {
    sql += ` AND FIND_IN_SET(?, REPLACE(categorias, ' ', ',')) > 0`;
    params.push(categoria);
  }
  sql += ' ORDER BY id';

  const [filas] = await pool.query(sql, params);
  res.json({ productos: filas });
});
