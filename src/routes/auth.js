import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { users } from '../data/users.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Prueba nuevamente en 15 minutos.' },
});

router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    if (users.some((user) => user.email === value.email)) {
      return res.status(409).json({ error: 'El correo ya esta registrado' });
    }

    const user = {
      id: users.length + 1,
      name: value.name,
      email: value.email,
      passwordHash: await bcrypt.hash(value.password, 12),
      role: 'usuario',
    };
    users.push(user);
    logger.info('Registro de usuario', { userId: user.id, email: user.email, role: user.role });
    return res.status(201).json({ message: 'Usuario registrado', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = users.find((candidate) => candidate.email === value.email);
    const validPassword = user && await bcrypt.compare(value.password, user.passwordHash);
    if (!validPassword) {
      logger.warn('Inicio de sesion fallido', { email: value.email });
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
    logger.info('Inicio de sesion exitoso', { userId: user.id, email: user.email });
    return res.json({ message: 'Inicio de sesion exitoso', token, expiresIn: '1h' });
  } catch (error) {
    return next(error);
  }
});

export default router;