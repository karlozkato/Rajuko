// Crea las tablas y carga los productos iniciales.
// Uso:  npm run db:init   (desde la carpeta backend)
// Es seguro ejecutarlo más de una vez: no duplica ni borra datos.
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { config } from '../src/config.js';

// Catálogo inicial: los 5 productos con foto real. Los precios son
// provisionales y se editarán después desde el panel de administración.
const PRODUCTOS = [
  ['Manillas Alternativas', 'Manillas inspiradas en la cultura rock.', 25000,
   'accesorios', 'rock,emo,grunge,metal', 'manillasalternativas.jpg'],
  ['Collar Alternativo', 'Collar alternativo inspirado en la cultura gótica.', 35000,
   'accesorios', 'gotico,silent-hill,emo,metal', 'Collar_Alternativo.avif'],
  ['Anillos Rock', 'Anillos alternativos de actitud rock.', 30000,
   'accesorios', 'rock,grunge,metal,gotico', 'Anillos_Rock.avif'],
  ['Llavero Gamer', 'Llaveros para expresar tu personalidad.', 18000,
   'accesorios gamer', 'ps2,nintendo,pixel-art,omori', 'Llavero_Gamer.jpg'],
  ['Camisa Retro', 'Más que una camisa, una forma de expresarte.', 70000,
   'ropa novedades', 'y2k,streetwear,nostalgia,cultura-digital', 'Camisa_Retro.jpg'],
];

const conexion = await mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  multipleStatements: true, // solo para ejecutar schema.sql completo
  charset: 'utf8mb4',
});

try {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await conexion.query(schema);
  console.log('✔ Tablas creadas / verificadas');

  const [[{ total }]] = await conexion.query('SELECT COUNT(*) AS total FROM productos');
  if (total === 0) {
    await conexion.query(
      'INSERT INTO productos (nombre, descripcion, precio, categorias, tags, imagen) VALUES ?',
      [PRODUCTOS]
    );
    console.log(`✔ ${PRODUCTOS.length} productos iniciales insertados`);
  } else {
    console.log(`• La tabla productos ya tiene ${total} filas: no se insertó nada`);
  }
} finally {
  await conexion.end();
}
