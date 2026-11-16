// Crea (o actualiza la contraseña de) el administrador.
// Uso:  npm run admin:crear   (desde la carpeta backend)
// Lee ADMIN_EMAIL y ADMIN_PASSWORD del archivo .env.
//   - La contraseña se guarda SOLO como hash bcrypt; nunca en claro.
//   - Tras ejecutarlo, borra ADMIN_PASSWORD del .env.
//   - Si el correo ya existe, se reemplaza su contraseña (sirve para recuperarla).
import mysql from 'mysql2/promise';
import { config } from '../src/config.js';
import { LARGO_MAX_PASSWORD, hashearPassword } from '../src/seguridad.js';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

const problemas = [];
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 150) {
  problemas.push('ADMIN_EMAIL falta o no es un correo válido.');
}
if (password.length < 12) problemas.push('ADMIN_PASSWORD debe tener al menos 12 caracteres.');
if (Buffer.byteLength(password) > LARGO_MAX_PASSWORD) {
  problemas.push(`ADMIN_PASSWORD no puede superar ${LARGO_MAX_PASSWORD} bytes (límite de bcrypt).`);
}
if (problemas.length > 0) {
  console.error('✘ No se creó el administrador:\n  - ' + problemas.join('\n  - '));
  process.exit(1);
}

const hash = await hashearPassword(password);

const conexion = await mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
});

try {
  const [resultado] = await conexion.query(
    `INSERT INTO admins (email, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [email, hash]
  );
  // affectedRows: 1 = fila nueva, 2 = fila existente actualizada
  console.log(
    resultado.affectedRows === 1
      ? `✔ Administrador creado: ${email}`
      : `✔ Contraseña actualizada para: ${email}`
  );
  console.log('→ Ahora borra la línea ADMIN_PASSWORD de backend/.env');
} finally {
  await conexion.end();
}
