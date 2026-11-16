// RAJUKO — api.js
// Función única para hablar con el backend. Centraliza tres cosas para que
// ningún otro archivo las repita:
//   1. Armar la URL y el JSON de la petición.
//   2. Un tiempo máximo de espera (el hosting gratuito "duerme" el servidor
//      y la primera respuesta puede tardar cerca de un minuto).
//   3. Convertir cualquier fallo en un Error con un mensaje claro en español.
//
// Parámetros:
//   ruta      -> por ejemplo '/api/productos'
//   opciones  -> { method, body, timeoutMs, onLento }
//     onLento: función que se llama si la respuesta tarda más de 4 s
//              (sirve para avisar "estamos despertando el servidor").
async function apiFetch(ruta, { method = 'GET', body, timeoutMs = 60000, onLento } = {}) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
  const avisoLento = onLento ? setTimeout(onLento, 4000) : null;

  try {
    const respuesta = await fetch(RAJUKO_API_URL + ruta, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controlador.signal,
    });

    // Si el servidor no devolvió JSON, `datos` queda en null y usamos un mensaje genérico.
    let datos = null;
    try {
      datos = await respuesta.json();
    } catch {
      /* respuesta sin cuerpo JSON */
    }

    if (!respuesta.ok) {
      const error = new Error(datos?.error || 'Algo salió mal. Inténtalo de nuevo.');
      error.status = respuesta.status;
      error.campos = datos?.campos; // errores por campo (validación del backend)
      throw error;
    }
    return datos;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Inténtalo de nuevo.');
    }
    // fetch lanza TypeError cuando no hay red, el servidor está caído o CORS bloquea.
    if (error instanceof TypeError) {
      throw new Error('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
    }
    throw error;
  } finally {
    clearTimeout(temporizador);
    if (avisoLento) clearTimeout(avisoLento);
  }
}
