require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const WebSocket = require('ws');
const { createServer } = require('http');

// Импорт роутов
const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collections');
const giftRoutes = require('./routes/gifts');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');

// Импорт middleware
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const upload = require('./middleware/upload');

// Импорт WebSocket менеджера
const WebSocketManager = require('./websocket/WebSocketManager');

const app = express();
const httpServer = createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/collections', auth, collectionRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/transactions', auth, transactionRoutes);

// Обработка ошибок
app.use(errorHandler);

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Инициализация WebSocket менеджера
const wsManager = new WebSocketManager(wss);

// Запуск сервера
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 