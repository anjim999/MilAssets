const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function login(username, password) {
  const user = db.prepare(
    `SELECT u.id, u.username, u.password_hash, u.full_name, u.role, u.base_id, b.name as base_name
     FROM users u
     LEFT JOIN bases b ON u.base_id = b.id
     WHERE u.username = ?`
  ).get(username);

  if (!user) {
    throw new Error('Invalid username or password.');
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    throw new Error('Invalid username or password.');
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      base_id: user.base_id,
      base_name: user.base_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      base_id: user.base_id,
      base_name: user.base_name,
    },
  };
}

function getProfile(userId) {
  const user = db.prepare(
    `SELECT u.id, u.username, u.full_name, u.role, u.base_id, b.name as base_name, u.created_at
     FROM users u
     LEFT JOIN bases b ON u.base_id = b.id
     WHERE u.id = ?`
  ).get(userId);

  if (!user) {
    throw new Error('User not found.');
  }

  return user;
}

module.exports = { login, getProfile };
