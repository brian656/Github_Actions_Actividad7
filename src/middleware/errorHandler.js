import { logger } from '../logger.js';

export function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

export function errorHandler(error, req, res, next) {
  logger.error('Error interno de servidor', { message: error.message, path: req.originalUrl });
  res.status(error.status || 500).json({ error: 'Error interno de servidor' });
}