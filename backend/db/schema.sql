-- Esquema de la base de datos de RAJUKO (MySQL / TiDB).
-- Es idempotente: se puede ejecutar varias veces sin borrar datos.

CREATE TABLE IF NOT EXISTS productos (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(120)  NOT NULL,
  descripcion TEXT          NOT NULL,
  precio      INT UNSIGNED  NOT NULL,            -- pesos colombianos, sin decimales
  categorias  VARCHAR(100)  NOT NULL,            -- separadas por espacio: "accesorios gamer"
  tags        VARCHAR(255)  NOT NULL DEFAULT '', -- estética/gustos, separados por coma (los usará la IA)
  imagen      VARCHAR(255)  NOT NULL,            -- nombre del archivo en frontend/images
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  creado_en   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensajes (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  mensaje    TEXT         NOT NULL,
  leido      TINYINT(1)   NOT NULL DEFAULT 0,
  creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suscriptores (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,           -- NUNCA se guarda la contraseña en claro
  creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
