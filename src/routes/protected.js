import express from 'express';
import { requireRole, verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/user', verifyToken, (req, res) => {
  res.json({ message: 'Contenido para usuarios autenticados', user: req.user });
});

router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Contenido exclusivo para administradores', user: req.user });
});

export default router;