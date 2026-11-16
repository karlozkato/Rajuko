// Construye la aplicación Express (sin arrancarla). Separar "app" de
// "server" permite probar la API sin abrir un puerto.
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db.js';
import { productosRouter } from './routes/productos.js';
import { contactoRouter } from './routes/contacto.js';
import { suscriptoresRouter } from './routes/suscriptores.js';
import { authRouter } from './routes/auth.js';

export const app = express();

// Detrás del proxy de Render, req.ip sería la IP del proxy. Con esto Express
// toma la IP real del visitante (la usa el limitador de peticiones).
app.set('trust proxy', 1);

// No anunciar que usamos Express (cabecera X-Powered-By): un dato menos para un atacante.
app.disable('x-powered-by');

app.use(express.json({ limit: '50kb' }));

// CORS: el navegador bloquea llamadas entre dominios distintos (GitHub Pages
// -> Render). Solo respondemos a los orígenes de la lista blanca.
app.use(
  cors({
    origin(origin, callback) {
      // Sin origin = herramientas como curl o Postman: se permiten.
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Origen no permitido por CORS'));
    },
  })
);

// Comprobación de salud: útil para Render y para verificar la base de datos.
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'conectada' });
  } catch (err) {
    console.error('Health check falló:', err.message);
    res.status(503).json({ ok: false, db: 'sin conexión' });
  }
});

app.use('/api/productos', productosRouter);
app.use('/api/contacto', contactoRouter);
app.use('/api/suscriptores', suscriptoresRouter);
app.use('/api/auth', authRouter);

// Ruta inexistente
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Manejador de errores: registra el detalle en el servidor y devuelve un
// mensaje genérico al cliente (no filtramos información interna).
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido.' });
  }
  console.error(err);
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor.' });
});
