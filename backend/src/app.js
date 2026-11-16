// Construye la aplicación Express (sin arrancarla). Separar "app" de
// "server" permite probar la API sin abrir un puerto.
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db.js';
import { productosRouter } from './routes/productos.js';

export const app = express();

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

// Ruta inexistente
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Manejador de errores: registra el detalle en el servidor y devuelve un
// mensaje genérico al cliente (no filtramos información interna).
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor.' });
});
