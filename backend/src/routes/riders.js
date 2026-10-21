
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();

db.exec(`
  CREATE TABLE IF NOT EXISTS riders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

function createRiderToken(rider) {
  return jwt.sign(
    {
      riderId: rider.id,
      email: rider.email,
      role: 'rider'
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

function authenticateRider(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Rider authentication required.'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== 'rider') {
      return res.status(403).json({
        success: false,
        message: 'Rider access required.'
      });
    }

    const rider = db.prepare(
      `SELECT id, full_name, email, phone, status
       FROM riders WHERE id = ?`
    ).get(payload.riderId);

    if (!rider || rider.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Rider account is unavailable.'
      });
    }

    req.rider = rider;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (
      typeof full_name !== 'string' ||
      !full_name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email and a password of at least 8 characters are required.'
      });
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration is incomplete.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = db.prepare(
      'SELECT id FROM riders WHERE email = ?'
    ).get(normalizedEmail);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A rider with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO riders (full_name, email, phone, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(
      full_name.trim(),
      normalizedEmail,
      typeof phone === 'string' ? phone.trim() : '',
      passwordHash
    );

    const rider = db.prepare(`
      SELECT id, full_name, email, phone, status
      FROM riders WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Rider registered successfully.',
      token: createRiderToken(rider),
      rider
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const rider = db.prepare(
      'SELECT * FROM riders WHERE email = ?'
    ).get(email.trim().toLowerCase());

    if (
      !rider ||
      !(await bcrypt.compare(password, rider.password_hash))
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (rider.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Rider account is unavailable.'
      });
    }

    res.json({
      success: true,
      message: 'Rider login successful.',
      token: createRiderToken(rider),
      rider: {
        id: rider.id,
        full_name: rider.full_name,
        email: rider.email,
        phone: rider.phone,
        status: rider.status
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticateRider, (req, res) => {
  res.json({
    success: true,
    rider: req.rider
  });
});

module.exports = router;
module.exports.authenticateRider = authenticateRider;
