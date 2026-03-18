const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// ── Request Logger ──
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ──
app.use('/api/products',  require('./routes/products'));
app.use('/api/bids',      require('./routes/bids'));
app.use('/api/groups',    require('./routes/groups'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/wishlist',  require('./routes/wishlist'));
app.use('/api/orders',    require('./routes/orders'));

// ── Health Check ──
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HNP Live Auction API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/products', '/api/bids', '/api/groups', '/api/users', '/api/wishlist', '/api/orders'],
  });
});

// ── 404 Handler ──
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error Handler ──
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 HNP Live Auction API running on http://localhost:${PORT}`);
  console.log(`📊 Supabase URL: ${process.env.SUPABASE_URL || '⚠️  Not configured'}\n`);
});
