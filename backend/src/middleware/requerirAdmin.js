// Middleware que protege rutas: solo deja pasar a un administrador autenticado.
// Uso:  router.get('/ruta', requerirAdmin, (req, res) => { ... req.admin ... })
import { pool } from '../db.js';
import { verificarToken } from '../seguridad.js';

const NO_AUTORIZADO = { error: 'Sesión no válida o expirada. Inicia sesión de nuevo.' };

export async function requerirAdmin(req, res, next) {
  // El token llega en la cabecera:  Authorization: Bearer <token>
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json(NO_AUTORIZADO);
  }

  let payload;
  try {
    payload = verificarToken(token); // falla si la firma es falsa o el token expiró
  } catch {
    return res.status(401).json(NO_AUTORIZADO);
  }

  // Además de la firma, comprobamos que el administrador SIGA existiendo.
  // Así, borrar un admin de la base de datos invalida al instante sus tokens.
  const [filas] = await pool.query('SELECT id, email FROM admins WHERE id = ?', [payload.sub]);
  if (filas.length === 0) {
    return res.status(401).json(NO_AUTORIZADO);
  }

  req.admin = filas[0];
  next();
}
