import Database from 'better-sqlite3';
import { config } from '../config.js';

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'usuario',
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export const users = [];

const syncUsers = () => {
  const rows = db.prepare('SELECT id, name, email, passwordHash, role FROM users ORDER BY id ASC').all();
  users.splice(0, users.length, ...rows);
};

export const createUser = ({ name, email, passwordHash, role = 'usuario' }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const info = db.prepare(`
    INSERT INTO users (name, email, passwordHash, role)
    VALUES (@name, @email, @passwordHash, @role)
  `).run({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
  });

  const user = {
    id: Number(info.lastInsertRowid),
    name,
    email: normalizedEmail,
    passwordHash,
    role,
  };

  users.push(user);
  return user;
};

export const findUserByEmail = (email) => {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const row = db.prepare('SELECT id, name, email, passwordHash, role FROM users WHERE email = @email').get({ email: normalizedEmail });
  if (!row) return null;
  return { ...row, email: row.email.toLowerCase() };
};

export const findUserById = (id) => {
  const row = db.prepare('SELECT id, name, email, passwordHash, role FROM users WHERE id = @id').get({ id });
  if (!row) return null;
  return { ...row, email: row.email.toLowerCase() };
};

export const emailExists = (email) => Boolean(findUserByEmail(email));

syncUsers();