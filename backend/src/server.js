
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'MarketLink API',
    message: 'Welcome to the MarketLink backend.',
    healthCheck: '/api/health',
    products: '/api/products',
    orders: '/api/orders'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MarketLink API is running.',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
console.log(
  'AUTH ROUTER MOUNTED:',
  authRoutes.stack
    .filter(layer => layer.route)
    .map(layer => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods)
    }))
);
app.use('/api/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} was not found.`
    }
  });
});

app.use((err, req, res, next) => {
  console.error('API error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.status === 400
        ? 'Invalid request body.'
        : 'An unexpected server error occurred.'
    }
  });
});

app.listen(PORT, () => {
  console.log(`MarketLink API listening at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Products API: http://localhost:${PORT}/api/products`);
  console.log(`Orders API: http://localhost:${PORT}/api/orders`);
});
