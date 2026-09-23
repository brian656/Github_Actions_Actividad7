import 'dotenv/config';

const required = ['JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};