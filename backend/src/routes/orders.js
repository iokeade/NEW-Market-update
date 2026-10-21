
const express = require('express');
const crypto = require('crypto');
const db = require('../db/database');
const { authenticateToken } = require('./auth');

const router = express.Router();
const COMMISSION_RATE = 5;

const ALLOWED_VENDOR_STATUSES = [
  'accepted',
  'preparing',
  'ready_for_pickup',
  'cancelled'
];

/*
 * Safe database migrations.
 * Existing products and orders are preserved.
 */
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();

  if (!columns.some(item => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('products', 'vendor_id', 'INTEGER');

ensureColumn(
  'order_items',
  'vendor_id',
  'INTEGER'
);

ensureColumn(
  'order_items',
  'fulfillment_status',
  "TEXT NOT NULL DEFAULT 'pending'"
);

// Recover vendor ownership for order items where it is known.
db.exec(`
  UPDATE order_items
  SET vendor_id = (
    SELECT products.vendor_id
    FROM products
    WHERE products.id = order_items.product_id
  )
  WHERE vendor_id IS NULL
    AND product_id IS NOT NULL
`);

/*
 * Money helper.
 */
function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/*
 * Calculate totals for one vendor's items only.
 * Do not expose other vendors' item totals.
 */
function getVendorOrderSummary(orderId, vendorId) {
  return db.prepare(`
    SELECT
      COALESCE(SUM(line_total), 0) AS subtotal,
      COALESCE(SUM(commission_amount), 0) AS commission_total,
      COALESCE(SUM(vendor_net_amount), 0) AS vendor_net_total,
      COUNT(*) AS item_count
    FROM order_items
    WHERE order_id = ?
      AND vendor_id = ?
  `).get(orderId, vendorId);
}

/*
 * GET /api/orders
 * Authenticated: return orders containing this vendor's products only.
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.currency,
        o.status,
        o.payment_status,
        o.created_at,
        SUM(oi.line_total) AS subtotal,
        SUM(oi.commission_amount) AS commission_total,
        SUM(oi.vendor_net_amount) AS vendor_net_total,
        SUM(oi.line_total) AS total_amount,
        COUNT(oi.id) AS item_count
      FROM orders o
      INNER JOIN order_items oi ON oi.order_id = o.id
      WHERE oi.vendor_id = ?
      GROUP BY o.id
      ORDER BY o.id DESC
    `).all(req.vendor.id);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Could not retrieve vendor orders:', error);

    res.status(500).json({
      success: false,
      message: 'Could not retrieve orders.'
    });
  }
});

/*
 * GET /api/orders/:id
 * Authenticated: return only this vendor's items in the order.
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    const order = db.prepare(`
      SELECT o.*
      FROM orders o
      INNER JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ?
        AND oi.vendor_id = ?
      LIMIT 1
    `).get(orderId, req.vendor.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const items = db.prepare(`
      SELECT
        id,
        order_id,
        product_id,
        vendor_id,
        product_name,
        quantity,
        unit_price,
        commission_rate,
        line_total,
        commission_amount,
        vendor_net_amount,
        fulfillment_status,
        created_at
      FROM order_items
      WHERE order_id = ?
        AND vendor_id = ?
      ORDER BY id
    `).all(orderId, req.vendor.id);

    const summary = getVendorOrderSummary(orderId, req.vendor.id);

    res.json({
      success: true,
      data: {
        ...order,
        subtotal: roundMoney(summary.subtotal),
        commission_total: roundMoney(summary.commission_total),
        total_amount: roundMoney(summary.subtotal),
        delivery_fee: 0,
        vendor_net_total: roundMoney(summary.vendor_net_total),
        items
      }
    });
  } catch (error) {
    console.error('Could not retrieve vendor order:', error);

    res.status(500).json({
      success: false,
      message: 'Could not retrieve order.'
    });
  }
});

/*
 * PATCH /api/orders/:id/items/:itemId/status
 *
 * A vendor can update only their own order items.
 * Allowed workflow:
 * pending -> accepted -> preparing -> ready_for_pickup
 * pending/accepted/preparing -> cancelled
 */
router.patch(
  '/:id/items/:itemId/status',
  authenticateToken,
  (req, res) => {
    const orderId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    const newStatus = String(
      req.body.fulfillment_status || ''
    ).trim();

    if (
      !Number.isSafeInteger(orderId) || orderId <= 0 ||
      !Number.isSafeInteger(itemId) || itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order or item ID.'
      });
    }

    if (!ALLOWED_VENDOR_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fulfillment status.'
      });
    }

    try {
      const item = db.prepare(`
        SELECT id, order_id, vendor_id, fulfillment_status
        FROM order_items
        WHERE id = ?
          AND order_id = ?
          AND vendor_id = ?
      `).get(itemId, orderId, req.vendor.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Order item not found.'
        });
      }

      const allowedTransitions = {
        pending: ['accepted', 'cancelled'],
        accepted: ['preparing', 'cancelled'],
        preparing: ['ready_for_pickup', 'cancelled'],
        ready_for_pickup: [],
        cancelled: []
      };

      const currentStatus = item.fulfillment_status || 'pending';

      if (
        !allowedTransitions[currentStatus] ||
        !allowedTransitions[currentStatus].includes(newStatus)
      ) {
        return res.status(409).json({
          success: false,
          message: `Cannot change status from ${currentStatus} to ${newStatus}.`
        });
      }

      db.prepare(`
        UPDATE order_items
        SET fulfillment_status = ?
        WHERE id = ?
          AND order_id = ?
          AND vendor_id = ?
      `).run(newStatus, itemId, orderId, req.vendor.id);

      const updatedItem = db.prepare(`
        SELECT *
        FROM order_items
        WHERE id = ?
          AND order_id = ?
          AND vendor_id = ?
      `).get(itemId, orderId, req.vendor.id);

      res.json({
        success: true,
        message: 'Order item status updated successfully.',
        data: updatedItem
      });
    } catch (error) {
      console.error('Could not update order item status:', error);

      res.status(500).json({
        success: false,
        message: 'Could not update order item status.'
      });
    }
  }
);

/*
 * POST /api/orders
 * Public customer checkout.
 * The vendor_id is copied from the product into each order item.
 */
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

    const combinedQuantity =
      (requestedItems.get(productId) || 0) + quantity;

    if (!Number.isSafeInteger(combinedQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity is too large.'
      });
    }

    requestedItems.set(productId, combinedQuantity);
  }

  try {
    const createOrder = db.transaction(() => {
      const selectedProducts = [];

      for (const [productId, quantity] of requestedItems) {
        const product = db.prepare(`
          SELECT id, name, price, stock, vendor_id
          FROM products
          WHERE id = ?
        `).get(productId);

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
            sum + roundMoney(
              product.price * product.quantity * COMMISSION_RATE / 100
            ),
          0
        )
      );

      const deliveryFee = 0;
      const totalAmount = roundMoney(subtotal + deliveryFee);

      const orderNumber =
        `ML-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const orderResult = db.prepare(`
        INSERT INTO orders (
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address,
          subtotal,
          commission_total,
          delivery_fee,
          total_amount,
          currency,
          status,
          payment_status
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
          order_id,
          product_id,
          vendor_id,
          product_name,
          quantity,
          unit_price,
          commission_rate,
          line_total,
          commission_amount,
          vendor_net_amount,
          fulfillment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `);

      for (const product of selectedProducts) {
        const lineTotal = roundMoney(
          product.price * product.quantity
        );

        const commissionAmount = roundMoney(
          lineTotal * COMMISSION_RATE / 100
        );

        insertItem.run(
          orderId,
          product.id,
          product.vendor_id || null,
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
