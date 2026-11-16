// Configuración centralizada. Lee las variables de entorno UNA sola vez y
// falla al arrancar si falta algo crítico (mejor que fallar a mitad de una
// petición). Así ningún otro archivo toca process.env directamente.

function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisa backend/.env`);
  }
  return valor;
}

export const config = {
  port: Number(process.env.PORT) || 3000,

  db: {
    host: requerida('DB_HOST'),
    port: Number(process.env.DB_PORT) || 3306,
    user: requerida('DB_USER'),
    password: requerida('DB_PASSWORD'),
    database: requerida('DB_NAME'),
    ssl: process.env.DB_SSL === 'true',
  },

  // Lista blanca de orígenes permitidos por CORS.
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
