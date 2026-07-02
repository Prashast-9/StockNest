const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
// const inventoryRoutes = require('./routes/inventory');  // Will add later

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/inventory', inventoryRoutes);  // Will add later

app.get('/api/test', (req, res) => {
    res.json({ message: 'StockNest Backend is Running!' });
});

const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});