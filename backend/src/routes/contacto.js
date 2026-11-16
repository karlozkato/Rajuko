// POST /api/contacto  { nombre, email, mensaje }
// Guarda el mensaje en la tabla `mensajes` para leerlo en el panel de admin.
import { Router } from 'express';
import { pool } from '../db.js';
import { validarContacto } from '../validar.js';
import { limitar } from '../limitar.js';

export const contactoRouter = Router();

// 5 mensajes cada 10 minutos por IP.
contactoRouter.post('/', limitar({ max: 5, ventanaMs: 10 * 60 * 1000 }), async (req, res) => {
  const { valores, campos } = validarContacto(req.body);

  if (Object.keys(campos).length > 0) {
    return res.status(400).json({ error: 'Revisa los campos marcados.', campos });
  }

  await pool.query('INSERT INTO mensajes (nombre, email, mensaje) VALUES (?, ?, ?)', [
    valores.nombre,
    valores.email,
    valores.mensaje,
  ]);

  res.status(201).json({ ok: true, mensaje: '¡Mensaje enviado! Te responderemos pronto.' });
});
