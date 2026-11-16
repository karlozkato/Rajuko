// Limitador de peticiones en memoria: máximo `max` peticiones por IP en cada
// ventana de tiempo. Frena el spam en los formularios públicos sin añadir
// dependencias. Limitación conocida: al vivir en memoria se reinicia si el
// servidor se reinicia, y no se comparte entre varias instancias (para este
// proyecto, con una sola instancia, es suficiente).

export function limitar({ max, ventanaMs }) {
  const registros = new Map(); // ip -> { cuenta, expira }

  // Limpieza periódica para que el Map no crezca indefinidamente.
  setInterval(() => {
    const ahora = Date.now();
    for (const [ip, r] of registros) if (r.expira <= ahora) registros.delete(ip);
  }, ventanaMs).unref();

  return (req, res, next) => {
    const ahora = Date.now();
    let r = registros.get(req.ip);
    if (!r || r.expira <= ahora) {
      r = { cuenta: 0, expira: ahora + ventanaMs };
      registros.set(req.ip, r);
    }
    r.cuenta += 1;

    if (r.cuenta > max) {
      const espera = Math.ceil((r.expira - ahora) / 1000);
      res.set('Retry-After', String(espera));
      return res
        .status(429)
        .json({ error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' });
    }
    next();
  };
}
