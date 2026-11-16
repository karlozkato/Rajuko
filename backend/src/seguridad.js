// Funciones de seguridad compartidas: contraseñas (bcrypt) y tokens (JWT).
// Centralizarlas evita que el costo del hash o el algoritmo del token queden
// repartidos —y desincronizados— entre varios archivos.
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

// Costo de bcrypt: cada +1 duplica el tiempo de cálculo. 12 es un equilibrio
// habitual: unos ~250 ms por intento hace inviable la fuerza bruta masiva y
// pasa desapercibido para una persona real.
export const COSTO_BCRYPT = 12;

// bcrypt solo procesa los primeros 72 bytes de la contraseña.
export const LARGO_MAX_PASSWORD = 72;

export const hashearPassword = (password) => bcrypt.hash(password, COSTO_BCRYPT);
export const compararPassword = (password, hash) => bcrypt.compare(password, hash);

// Hash de una contraseña aleatoria que nadie conoce. Si el correo del login no
// existe, comparamos contra este hash igualmente: así la respuesta tarda lo
// mismo que con un correo válido y no se puede descubrir qué correos existen
// midiendo tiempos (ataque de "enumeración de usuarios").
export const HASH_FALSO = bcrypt.hashSync(randomBytes(16).toString('hex'), COSTO_BCRYPT);

// Algoritmo fijo. Al verificar se indica explícitamente: así nadie puede
// colar un token con "alg: none" u otro algoritmo distinto.
const ALGORITMO = 'HS256';

export function firmarToken(adminId) {
  return jwt.sign({}, config.jwt.secret, {
    algorithm: ALGORITMO,
    subject: String(adminId),
    expiresIn: config.jwt.expiresIn,
  });
}

// Devuelve el payload si el token es válido; lanza error si es falso o expiró.
export function verificarToken(token) {
  return jwt.verify(token, config.jwt.secret, { algorithms: [ALGORITMO] });
}
