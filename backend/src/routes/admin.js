// Agrupa TODAS las rutas del panel de administración bajo /api/admin.
// `requerirAdmin` se aplica una sola vez aquí, a todo el grupo: así es imposible
// que una ruta administrativa nueva quede sin proteger por olvido.
import { Router } from 'express';
import { requerirAdmin } from '../middleware/requerirAdmin.js';
import { adminProductosRouter } from './adminProductos.js';

export const adminRouter = Router();

adminRouter.use(requerirAdmin);

adminRouter.use('/productos', adminProductosRouter);
