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

// El secreto con el que se firman los tokens. Si fuera corto o adivinable,
// cualquiera podría fabricar tokens falsos y entrar como administrador; por eso
// se exige una longitud mínima y el servidor NO arranca sin él.
function secretoJwt() {
  const secreto = requerida('JWT_SECRET');
  if (secreto.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres. Genera uno con el comando de backend/.env.example');
  }
  return secreto;
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

  // Autenticación del administrador (JWT).
  jwt: {
    secret: secretoJwt(),
    // Vigencia del token. Formato de la librería jsonwebtoken: "2h", "30m"...
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  },

  // Lista blanca de orígenes permitidos por CORS.
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
