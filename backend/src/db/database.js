
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDirectory = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = path.join(dataDirectory, 'marketlink.db');
const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  /* Existing marketplace products table */
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    unit TEXT NOT NULL DEFAULT 'piece',
    location TEXT NOT NULL DEFAULT 'Nigeria',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  /* Vendor accounts will be connected to authentication later */
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  /* One customer checkout creates an order */
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    subtotal REAL NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    commission_total REAL NOT NULL DEFAULT 0 CHECK (commission_total >= 0),
    delivery_fee REAL NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total_amount REAL NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN (
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      )),
    payment_status TEXT NOT NULL DEFAULT 'unpaid'
      CHECK (payment_status IN (
        'unpaid',
        'pending',
        'paid',
        'failed',
        'refunded',
        'partially_refunded'
      )),
    payment_provider TEXT,
    payment_reference TEXT,
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  /* Snapshots preserve the price and commission at purchase time */
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    vendor_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price >= 0),
    commission_rate REAL NOT NULL DEFAULT 5
      CHECK (commission_rate >= 0 AND commission_rate <= 100),
    line_total REAL NOT NULL CHECK (line_total >= 0),
    commission_amount REAL NOT NULL DEFAULT 0
      CHECK (commission_amount >= 0),
    vendor_net_amount REAL NOT NULL DEFAULT 0
      CHECK (vendor_net_amount >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
  );

  /* Payment attempts and provider references */
  CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    provider_reference TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN (
        'pending',
        'successful',
        'failed',
        'refunded'
      )),
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
  );

  /* A payout record tracks money owed or transferred to a vendor */
  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN (
        'pending',
        'processing',
        'paid',
        'failed',
        'cancelled'
      )),
    provider_reference TEXT UNIQUE,
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON orders(created_at);

  CREATE INDEX IF NOT EXISTS idx_orders_payment_status
    ON orders(payment_status);

  CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON order_items(order_id);

  CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id
    ON order_items(vendor_id);

  CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id
    ON payment_transactions(order_id);

  CREATE INDEX IF NOT EXISTS idx_payouts_vendor_id
    ON payouts(vendor_id);
`);
/*
 * Safely add password storage to existing vendor accounts.
 * Existing vendor records and other tables remain untouched.
 */
const vendorColumns = db.prepare(
  "PRAGMA table_info(vendors)"
).all();

if (!vendorColumns.some(column => column.name === 'password_hash')) {
  db.exec('ALTER TABLE vendors ADD COLUMN password_hash TEXT');
}

/*
 * Keep the proposed commission rate in one place for new orders.
 * Existing order items retain their saved rate.
 */
const DEFAULT_COMMISSION_RATE = 5;

module.exports = db;
module.exports.DEFAULT_COMMISSION_RATE = DEFAULT_COMMISSION_RATE;
