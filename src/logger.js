import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';

const logsDirectory = path.resolve('logs');
fs.mkdirSync(logsDirectory, { recursive: true });

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDirectory, 'security.log') }),
    new winston.transports.Console(),
  ],
});