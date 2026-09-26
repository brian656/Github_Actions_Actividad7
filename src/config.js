import 'dotenv/config';
import path from 'node:path';

const required = ['JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno ${key}`);
  }
}

const dbPath = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.resolve(process.cwd(), 'src/data/alma_urbana.sqlite');

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  dbPath,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,https://ecommerce-dun-seven-91.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};