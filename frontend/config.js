// RAJUKO — config.js
// URL base de la API (el backend Node/Express). Es el ÚNICO lugar donde se
// escribe esa dirección: si cambia el backend, solo se edita este archivo.
//
// - En tu computador (Live Server / localhost) apunta al backend local.
// - Publicado en GitHub Pages apunta al backend desplegado en Render.
//   TODO (Día 2, al desplegar): reemplazar la URL de abajo por la real.
const RAJUKO_API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000'
  : 'https://REEMPLAZAR-CON-URL-DE-RENDER.onrender.com';
