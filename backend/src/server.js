const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check — useful for Render deployment
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'StockNest API is running ✅' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ── Start server ──────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 StockNest server running on http://localhost:${PORT}`);
});
