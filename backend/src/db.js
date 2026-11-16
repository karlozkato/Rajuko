// Pool de conexiones MySQL. Un pool reutiliza conexiones abiertas en vez de
// abrir una nueva por petición (más rápido y evita saturar la base de datos).
import mysql from 'mysql2/promise';
import { config } from './config.js';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  // TiDB Cloud exige TLS. rejectUnauthorized valida el certificado del servidor.
  ssl: config.db.ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4',
});
