

const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('./auth');


const router = express.Router();

const getAllProducts = db.prepare(`
  SELECT * FROM products ORDER BY id DESC
`);

const getProductById = db.prepare(`
  SELECT * FROM products WHERE id = ?
`);

const searchProducts = db.prepare(`
  SELECT * FROM products
  WHERE name LIKE ?
     OR category LIKE ?
     OR location LIKE ?
  ORDER BY id DESC
`);

router.get('/', (req, res) => {
  try {
    const search = String(req.query.search || '').trim();

    const products = search
      ? searchProducts.all(
          `%${search}%`,
          `%${search}%`,
          `%${search}%`
        )
      : getAllProducts.all();

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Failed to retrieve products:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Could not retrieve products.'
      }
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Product ID must be a positive integer.'
        }
      });
    }

    const product = getProductById.get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found.'
        }
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Failed to retrieve product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Could not retrieve product.'
      }
    });
  }
});

router.post('/', authenticateToken, (req, res) => {
    try {
    const {
      name,
      category,
      price,
      unit = 'piece',
      location = 'Nigeria',
      description = '',
      image_url = '',
      stock = 0
    } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof category !== 'string' ||
      !category.trim() ||
      price === undefined ||
      price === null ||
      price === '' ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT',
          message:
            'Name, category, and a non-negative numeric price are required.'
        }
      });
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STOCK',
          message: 'Stock must be a non-negative integer.'
        }
      });
    }

    c
const result = db.prepare(`
  INSERT INTO products
    (name, category, price, unit, location, description, image_url, stock, vendor_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  name.trim(),
  category.trim(),
  Number(price),
  String(unit),
  String(location),
  String(description),
  String(image_url),
  Number(stock),
  req.vendor.id
);


    const product = getProductById.get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Could not create product.'
      }
    });
  }
});

module.exports = router;
