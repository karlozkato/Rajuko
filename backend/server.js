// Punto de entrada: arranca el servidor HTTP.
import { app } from './src/app.js';
import { config } from './src/config.js';

app.listen(config.port, () => {
  console.log(`RAJUKO API escuchando en el puerto ${config.port}`);
});
