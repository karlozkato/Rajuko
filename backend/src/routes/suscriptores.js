// POST /api/suscriptores  { email }
// Registra un correo para la newsletter. El correo es UNIQUE en la base de
// datos: si ya existe, respondemos con éxito igualmente (no revelamos si un
// correo ajeno ya estaba registrado).
import { Router } from 'express';
import { pool } from '../db.js';
import { validarEmail } from '../validar.js';
import { limitar } from '../limitar.js';

export const suscriptoresRouter = Router();

suscriptoresRouter.post('/', limitar({ max: 5, ventanaMs: 10 * 60 * 1000 }), async (req, res) => {
  const { email, error } = validarEmail(req.body?.email);

  if (error) {
    return res.status(400).json({ error, campos: { email: error } });
  }

  try {
    await pool.query('INSERT INTO suscriptores (email) VALUES (?)', [email]);
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') throw err; // cualquier otro error sí es un fallo real
  }

  res.status(201).json({ ok: true, mensaje: '¡Listo! Ya eres parte de la comunidad RAJUKO.' });
});
