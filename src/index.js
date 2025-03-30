require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');

const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collections');
const giftRoutes = require('./routes/gifts');
const transactionRoutes = require('./routes/transactions');

const WebSocketManager = require('./websocket/WebSocketManager');

const app = express();
const port = process.env.PORT || 3000;
const wsPort = process.env.WS_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start HTTP server
    const server = app.listen(port, () => {
      console.log(`HTTP server running on port ${port}`);
    });

    // Start WebSocket server
    const wss = new WebSocket.Server({ port: wsPort });
    const wsManager = new WebSocketManager(wss);
    wsManager.init();

    console.log(`WebSocket server running on port ${wsPort}`);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 