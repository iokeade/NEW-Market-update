
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }

  return secret;
}

function createToken(vendor) {
  return jwt.sign(
    {
      vendorId: vendor.id,
      email: vendor.email
    },
    getJwtSecret(),
    { expiresIn: '2h' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const businessName = String(req.body.businessName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!businessName || !email || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Business name, email, and password are required.'
      });
    }

    if (businessName.length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Business name must be 120 characters or fewer.'
      });
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 72 characters.'
      });
    }

    const existingVendor = db.prepare(
      'SELECT id FROM vendors WHERE email = ?'
    ).get(email);

    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO vendors (business_name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(businessName, email, passwordHash);

    const vendor = {
      id: Number(result.lastInsertRowid),
      business_name: businessName,
      email
    };

    const token = createToken(vendor);

    return res.status(201).json({
      success: true,
      message: 'Vendor account created successfully.',
      token,
      vendor: {
        id: vendor.id,
        businessName: vendor.business_name,
        email: vendor.email
      }
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    console.error('Vendor registration error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to create your account right now.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const vendor = db.prepare(`
      SELECT id, business_name, email, password_hash
      FROM vendors
      WHERE email = ?
    `).get(email);

    if (!vendor || !vendor.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      vendor.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = createToken(vendor);

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      vendor: {
        id: vendor.id,
        businessName: vendor.business_name,
        email: vendor.email
      }
    });
  } catch (error) {
    console.error('Vendor login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to sign in right now.'
    });
  }
});

// Middleware for protecting future vendor-only routes.
function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Please sign in to continue.'
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    req.vendor = {
      id: decoded.vendorId,
      email: decoded.email
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Your session is invalid or has expired. Please sign in again.'
    });
  }
}

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const vendor = db.prepare(`
    SELECT id, business_name, email
    FROM vendors
    WHERE id = ?
  `).get(req.vendor.id);

  if (!vendor) {
    return res.status(401).json({
      success: false,
      message: 'Vendor account not found.'
    });
  }

  return res.json({
    success: true,
    vendor: {
      id: vendor.id,
      businessName: vendor.business_name,
      email: vendor.email
    }
  });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
