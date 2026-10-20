
const express = require('express');
const crypto = require('crypto');
const db = require('../db/database');

const router = express.Router();
const COMMISSION_RATE = 5;

function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

// GET /api/orders
// Development-only listing. Authentication will be added before production.
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT id, order_number, customer_name, subtotal,
             commission_total, delivery_fee, total_amount,
             currency, status, payment_status, created_at
      FROM orders
      ORDER BY id DESC
    `).all();

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Could not retrieve orders:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve orders.'
    });
  }
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  try {
    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).get(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const items = db.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).all(order.id);

    res.json({
      success: true,
      data: { ...order, items }
    });
  } catch (error) {
    console.error('Could not retrieve order:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve order.'
    });
  }
});

// POST /api/orders
router.post('/', (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    items
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Add at least one product to the order.'
    });
  }

  if (items.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'An order cannot contain more than 50 product lines.'
    });
  }

  const requestedItems = new Map();

  for (const item of items) {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);

    if (
      !Number.isSafeInteger(productId) || productId <= 0 ||
      !Number.isSafeInteger(quantity) || quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Each item needs a valid product_id and positive integer quantity.'
      });
    }

    requestedItems.set(
      productId,
      (requestedItems.get(productId) || 0) + quantity
    );

    if (!Number.isSafeInteger(requestedItems.get(productId))) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity is too large.'
      });
    }
  }

  try {
    const createOrder = db.transaction(() => {
      const selectedProducts = [];

      for (const [productId, quantity] of requestedItems) {
        const product = db.prepare(
          'SELECT id, name, price, stock FROM products WHERE id = ?'
        ).get(productId);

        if (!product) {
          const error = new Error(`Product ${productId} was not found.`);
          error.statusCode = 404;
          throw error;
        }

        if (quantity > product.stock) {
          const error = new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}.`
          );
          error.statusCode = 409;
          throw error;
        }

        selectedProducts.push({ ...product, quantity });
      }

      const subtotal = roundMoney(
        selectedProducts.reduce(
          (sum, product) => sum + product.price * product.quantity,
          0
        )
      );

      const commissionTotal = roundMoney(
        selectedProducts.reduce(
          (sum, product) =>
            sum + roundMoney(product.price * product.quantity * COMMISSION_RATE / 100),
          0
        )
      );

      // Delivery fee is zero until delivery pricing is implemented.
      const deliveryFee = 0;
      const totalAmount = roundMoney(subtotal + deliveryFee);
      const orderNumber = `ML-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const orderResult = db.prepare(`
        INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          delivery_address, subtotal, commission_total, delivery_fee,
          total_amount, currency, status, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NGN', 'pending', 'unpaid')
      `).run(
        orderNumber,
        customer_name || null,
        customer_email || null,
        customer_phone || null,
        delivery_address || null,
        subtotal,
        commissionTotal,
        deliveryFee,
        totalAmount
      );

      const orderId = Number(orderResult.lastInsertRowid);

      const insertItem = db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, product_name, quantity, unit_price,
          commission_rate, line_total, commission_amount, vendor_net_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const product of selectedProducts) {
        const lineTotal = roundMoney(product.price * product.quantity);
        const commissionAmount = roundMoney(
          lineTotal * COMMISSION_RATE / 100
        );

        insertItem.run(
          orderId,
          product.id,
          product.name,
          product.quantity,
          product.price,
          COMMISSION_RATE,
          lineTotal,
          commissionAmount,
          roundMoney(lineTotal - commissionAmount)
        );
      }

      return db.prepare(
        'SELECT * FROM orders WHERE id = ?'
      ).get(orderId);
    });

    const order = createOrder();

    return res.status(201).json({
      success: true,
      message: 'Order created. Payment has not been received yet.',
      data: {
        ...order,
        items: db.prepare(
          'SELECT * FROM order_items WHERE order_id = ?'
        ).all(order.id)
      }
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    console.error('Could not create order:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not create order.'
    });
  }
});

module.exports = router;
