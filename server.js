require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3000;

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-gifts', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Схема для объявлений
const ListingSchema = new mongoose.Schema({
    giftId: String,
    userId: String,
    name: String,
    type: String,
    price: Number,
    description: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});

const Listing = mongoose.model('Listing', ListingSchema);

// Инициализация бота Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработка команды /start
bot.command('start', async (ctx) => {
    try {
        await ctx.reply('Привет! Я бот для управления подарками. Используйте следующие команды:\n' +
            '/gifts - посмотреть ваши подарки\n' +
            '/create - создать новый подарок\n' +
            '/market - открыть маркет подарков');
    } catch (error) {
        console.error('Error in /start command:', error);
        await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

// Обработка команды /gifts
bot.command('gifts', async (ctx) => {
    try {
        const userId = ctx.from.id;
        const listings = await Listing.find({ userId: userId.toString() });
        
        if (listings.length === 0) {
            await ctx.reply('У вас пока нет подарков. Используйте /create для создания нового подарка.');
            return;
        }
        
        const message = listings.map(listing => 
            `🎁 ${listing.name}\n` +
            `💰 Цена: ${listing.price} TON\n` +
            `📝 ${listing.description || 'Нет описания'}`
        ).join('\n\n');

        await ctx.reply(message);
    } catch (error) {
        console.error('Error in /gifts command:', error);
        await ctx.reply('Произошла ошибка при получении списка подарков.');
    }
});

// Обработка команды /create
bot.command('create', async (ctx) => {
    try {
        await ctx.reply('Для создания нового подарка, пожалуйста, перейдите в веб-приложение:', {
            reply_markup: {
                inline_keyboard: [[
                    { text: 'Создать подарок', web_app: { url: 'http://localhost:3000/telegram-app.html' } }
                ]]
            }
        });
    } catch (error) {
        console.error('Error in /create command:', error);
        await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

// Обработка команды /market
bot.command('market', async (ctx) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 }).limit(5);
        
        if (listings.length === 0) {
            await ctx.reply('В маркете пока нет подарков.');
            return;
        }
            
        const message = '🔥 Топ подарков в маркете:\n\n' + 
            listings.map(listing => 
                `🎁 ${listing.name}\n` +
                `💰 Цена: ${listing.price} TON\n` +
                `👤 Продавец: @${listing.userId}`
            ).join('\n\n');

        await ctx.reply(message);
    } catch (error) {
        console.error('Error in /market command:', error);
        await ctx.reply('Произошла ошибка при получении списка подарков в маркете.');
    }
});

// Запуск бота
bot.launch().then(() => {
    console.log('Bot started successfully');
}).catch(err => {
    console.error('Error starting bot:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Создание директории для загрузок
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API endpoints
app.post('/api/listings', upload.single('image'), async (req, res) => {
    try {
        const listing = new Listing({
            ...req.body,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        await listing.save();
        res.status(201).json(listing);
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});

app.get('/api/listings', async (req, res) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// WebSocket connections
const clients = new Map();

wss.on('connection', (ws, req) => {
    const userId = req.url.split('?userId=')[1];
    clients.set(userId, ws);

    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        // Handle different message types
        switch (data.type) {
            case 'NEW_GIFT':
                broadcastToAll({ type: 'GIFT_ADDED', gift: data.gift });
                break;
            case 'GIFT_SOLD':
                broadcastToAll({ type: 'GIFT_SOLD', giftId: data.giftId });
                break;
            case 'NEW_COLLECTION':
                broadcastToAll({ type: 'COLLECTION_ADDED', collection: data.collection });
                break;
        }
    });

    ws.on('close', () => {
        clients.delete(userId);
    });
});

function broadcastToAll(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// API Routes
app.get('/api/gifts', async (req, res) => {
    try {
        const gifts = await Listing.find().sort({ createdAt: -1 });
        res.json(gifts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/collections', async (req, res) => {
    try {
        const collections = await Listing.find().populate('userId');
        res.json(collections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/gifts', async (req, res) => {
    try {
        const gift = new Listing(req.body);
        await gift.save();
        res.status(201).json(gift);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/collections', async (req, res) => {
    try {
        const collection = new Listing(req.body);
        await collection.save();
        res.status(201).json(collection);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const transaction = new Listing(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'telegram-app.html'));
});

// Запуск сервера
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 