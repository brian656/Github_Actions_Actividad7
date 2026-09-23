import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { logger } from '../logger.js';

export function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    logger.warn('Acceso denegado: token ausente', { path: req.originalUrl });
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    logger.warn('Acceso denegado: token invalido', { path: req.originalUrl });
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      logger.warn('Acceso denegado: rol insuficiente', {
        userId: req.user?.id,
        requiredRole: role,
        path: req.originalUrl,
      });
      return res.status(403).json({ error: 'No tienes permisos para este recurso' });
    }
    return next();
  };
}