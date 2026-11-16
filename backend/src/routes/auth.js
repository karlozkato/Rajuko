// Autenticación del administrador.
//   POST /api/auth/login  { email, password }  -> { token, expiresIn, admin }
//   GET  /api/auth/me     (con token)          -> { admin }
// No existe registro público: el único administrador se crea con
// `npm run admin:crear`.
import { Router } from 'express';
import { pool } from '../db.js';
import { limitar } from '../limitar.js';
import { requerirAdmin } from '../middleware/requerirAdmin.js';
import { config } from '../config.js';
import { HASH_FALSO, LARGO_MAX_PASSWORD, compararPassword, firmarToken } from '../seguridad.js';

export const authRouter = Router();

// Mismo mensaje para "correo inexistente" y "contraseña incorrecta".
const CREDENCIALES_INCORRECTAS = { error: 'Credenciales incorrectas.' };

// 10 intentos cada 15 min por IP. Este limitador cuenta TODAS las peticiones
// (también las exitosas), por eso el tope es 10 y no 5: así no te bloqueas a ti
// mismo al iniciar sesión varias veces mientras desarrollas.
const limiteLogin = limitar({ max: 10, ventanaMs: 15 * 60 * 1000 });

authRouter.post('/login', limiteLogin, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  // Se descartan entradas vacías o absurdamente largas antes de gastar CPU en bcrypt.
  if (!email || !password || email.length > 150 || Buffer.byteLength(password) > LARGO_MAX_PASSWORD) {
    return res.status(401).json(CREDENCIALES_INCORRECTAS);
  }

  const [filas] = await pool.query('SELECT id, email, password_hash FROM admins WHERE email = ?', [email]);
  const admin = filas[0];

  // Se compara SIEMPRE con un hash (el real o uno falso) para que el tiempo de
  // respuesta no delate si el correo existe.
  const coincide = await compararPassword(password, admin ? admin.password_hash : HASH_FALSO);

  if (!admin || !coincide) {
    return res.status(401).json(CREDENCIALES_INCORRECTAS);
  }

  res.json({
    token: firmarToken(admin.id),
    expiresIn: config.jwt.expiresIn,
    admin: { email: admin.email },
  });
});

// El panel llama a esta ruta al abrirse para saber si el token guardado sigue siendo válido.
authRouter.get('/me', requerirAdmin, (req, res) => {
  res.json({ admin: { email: req.admin.email } });
});
