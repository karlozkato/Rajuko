// RAJUKO — config.js
// Centraliza la URL de la API.
// En desarrollo local (computador o celular conectado a la misma red),
// utiliza el mismo hostname desde el que se abrió el frontend.
// En producción se debe reemplazar la URL de Render por la definitiva.

const hostname = window.location.hostname;
const esIPv4Privada =
  /^(10\.(?:\d{1,3}\.){2}\d{1,3}|192\.168\.(?:\d{1,3}\.)\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3}\.)\d{1,3})$/.test(hostname);
const esDesarrolloLocal =
  hostname === 'localhost' || hostname === '127.0.0.1' || esIPv4Privada;

const RAJUKO_API_URL = esDesarrolloLocal
  ? `http://${hostname}:3000`
  : 'https://REEMPLAZAR-CON-URL-DE-RENDER.onrender.com';
