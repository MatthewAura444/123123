const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const csrf = require('csrf');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cache = require('memory-cache');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const crypto = require('crypto');
const app = express();

// Middleware для обхода страницы предупреждения localtunnel
app.use((req, res, next) => {
    res.setHeader('bypass-tunnel-reminder', 'true');
    next();
});

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ port: 8083 });

// Обработка ошибок WebSocket сервера
wss.on('error', (error) => {
    console.error('Ошибка WebSocket сервера:', error);
});

// Хранилище подключенных клиентов
const clients = new Map();

// Функция для отправки уведомлений
function sendNotification(userId, notification) {
    try {
        const client = clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
        }
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
    }
}

// Обработка WebSocket подключений
wss.on('connection', (ws, req) => {
    try {
        const userId = req.url.split('?userId=')[1];
        if (!userId) {
            console.error('Отсутствует userId в запросе');
            ws.close();
            return;
        }
        
        clients.set(userId, ws);
        console.log(`Клиент ${userId} подключен`);

        ws.on('error', (error) => {
            console.error(`Ошибка WebSocket для клиента ${userId}:`, error);
            clients.delete(userId);
        });

        ws.on('close', () => {
            console.log(`Клиент ${userId} отключен`);
            clients.delete(userId);
        });
    } catch (error) {
        console.error('Ошибка при обработке подключения:', error);
        ws.close();
    }
});

// Конфигурация Telegram Mini Apps
const BOT_TOKEN = '7330941572:AAGghstyq7lAhmtanvlgwmvSx0dvVEUiDBo';
const WEBAPP_URL = 'http://localhost:3000/telegram-app.html';

// Настройка статических файлов
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Middleware для безопасности
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "ton.org", "telegram.org"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "*.ton.org"],
            connectSrc: ["'self'", "*.ton.org", "telegram.org", "https://*.telegram.org"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://*.telegram.org"],
            sandbox: ["allow-forms", "allow-scripts", "allow-same-origin"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(cors({
    origin: ['https://*.telegram.org', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
    credentials: true
}));
app.use(compression());

// Ограничение количества запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: 'Слишком много запросов с вашего IP, пожалуйста, подождите 15 минут'
});
app.use(limiter);

// Улучшенная система валидации
class ValidationSystem {
    constructor() {
        this.rules = new Map();
        this.customValidators = new Map();
    }

    addRule(name, rule) {
        this.rules.set(name, rule);
    }

    addCustomValidator(name, validator) {
        this.customValidators.set(name, validator);
    }

    validate(data, rules) {
        const errors = [];
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            
            for (const rule of fieldRules) {
                const result = this.validateField(value, rule);
                if (!result.isValid) {
                    errors.push({
                        field,
                        message: result.message,
                        code: result.code
                    });
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateField(value, rule) {
        const { type, params = {}, message, code } = rule;

        // Проверка на обязательность
        if (rule.required && (value === undefined || value === null || value === '')) {
            return {
                isValid: false,
                message: message || `Поле ${rule.field} обязательно для заполнения`,
                code: 'REQUIRED'
            };
        }

        // Проверка типа
        if (type && !this.validateType(value, type)) {
            return {
                isValid: false,
                message: message || `Неверный тип данных для поля ${rule.field}`,
                code: 'INVALID_TYPE'
            };
        }

        // Проверка длины
        if (params.minLength && String(value).length < params.minLength) {
            return {
                isValid: false,
                message: message || `Минимальная длина ${params.minLength} символов`,
                code: 'MIN_LENGTH'
            };
        }

        if (params.maxLength && String(value).length > params.maxLength) {
            return {
                isValid: false,
                message: message || `Максимальная длина ${params.maxLength} символов`,
                code: 'MAX_LENGTH'
            };
        }

        // Проверка диапазона
        if (params.min !== undefined && Number(value) < params.min) {
            return {
                isValid: false,
                message: message || `Минимальное значение ${params.min}`,
                code: 'MIN_VALUE'
            };
        }

        if (params.max !== undefined && Number(value) > params.max) {
            return {
                isValid: false,
                message: message || `Максимальное значение ${params.max}`,
                code: 'MAX_VALUE'
            };
        }

        // Проверка формата
        if (params.pattern && !params.pattern.test(String(value))) {
            return {
                isValid: false,
                message: message || `Неверный формат`,
                code: 'INVALID_FORMAT'
            };
        }

        // Проверка списка допустимых значений
        if (params.enum && !params.enum.includes(value)) {
            return {
                isValid: false,
                message: message || `Допустимые значения: ${params.enum.join(', ')}`,
                code: 'INVALID_ENUM'
            };
        }

        // Пользовательская валидация
        if (params.custom && this.customValidators.has(params.custom)) {
            const validator = this.customValidators.get(params.custom);
            const result = validator(value);
            if (!result.isValid) {
                return {
                    isValid: false,
                    message: result.message || message,
                    code: result.code || 'CUSTOM_VALIDATION'
                };
            }
        }

        return { isValid: true };
    }

    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null;
            case 'date':
                return value instanceof Date && !isNaN(value);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'url':
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            default:
                return true;
        }
    }
}

const validationSystem = new ValidationSystem();

// Добавляем правила валидации
validationSystem.addRule('gift', {
    name: {
        required: true,
        type: 'string',
        params: {
            minLength: 3,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\s\-_]+$/
        },
        message: 'Название должно быть от 3 до 100 символов и содержать только буквы, цифры, пробелы, дефисы и подчеркивания'
    },
    description: {
        required: true,
        type: 'string',
        params: {
            minLength: 10,
            maxLength: 1000
        },
        message: 'Описание должно быть от 10 до 1000 символов'
    },
    price: {
        required: true,
        type: 'number',
        params: {
            min: 0.1,
            max: 1000000
        },
        message: 'Цена должна быть от 0.1 до 1,000,000 TON'
    },
    category: {
        required: true,
        type: 'string',
        params: {
            enum: ['digital', 'physical', 'subscription']
        },
        message: 'Неверная категория подарка'
    },
    sellerAddress: {
        required: true,
        type: 'string',
        params: {
            pattern: /^[0-9a-fA-F]{48}$/
        },
        message: 'Неверный формат адреса продавца'
    }
});

// Обновляем middleware для валидации
const validateRequest = (ruleName) => {
    return (req, res, next) => {
        const rule = validationSystem.rules.get(ruleName);
        if (!rule) {
            return res.status(500).json({ error: 'Правило валидации не найдено' });
        }

        const result = validationSystem.validate(req.body, rule);
        if (!result.isValid) {
            return res.status(400).json({ errors: result.errors });
        }

        next();
    };
};

// Расширенная валидация данных
const validateGift = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Название должно быть от 3 до 100 символов')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Название может содержать только буквы, цифры, пробелы, дефисы и подчеркивания')
        .escape(),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Описание должно быть от 10 до 1000 символов')
        .escape(),
    body('price')
        .isFloat({ min: 0.1, max: 1000000 })
        .withMessage('Цена должна быть от 0.1 до 1,000,000 TON'),
    body('category')
        .isIn(['digital', 'physical', 'subscription'])
        .withMessage('Неверная категория подарка'),
    body('sellerId')
        .isLength({ min: 48, max: 48 })
        .withMessage('Неверный формат ID продавца')
        .matches(/^[0-9a-fA-F]+$/)
        .withMessage('ID продавца должен содержать только шестнадцатеричные символы'),
    body('modelUrl')
        .optional()
        .isURL()
        .withMessage('Неверный формат URL 3D модели')
        .matches(/\.(glb|gltf)$/)
        .withMessage('Поддерживаются только форматы .glb и .gltf'),
    body('backgroundUrl')
        .optional()
        .isURL()
        .withMessage('Неверный формат URL фонового изображения')
        .matches(/\.(jpg|jpeg|png|webp)$/)
        .withMessage('Поддерживаются только форматы .jpg, .jpeg, .png и .webp')
];

// Валидация транзакций
const validateTransaction = [
    body('giftId')
        .isLength({ min: 36, max: 36 })
        .withMessage('Неверный формат ID подарка')
        .matches(/^[0-9a-fA-F-]+$/)
        .withMessage('ID подарка должен содержать только шестнадцатеричные символы и дефисы'),
    body('buyerAddress')
        .isLength({ min: 48, max: 48 })
        .withMessage('Неверный формат адреса покупателя')
        .matches(/^[0-9a-fA-F]+$/)
        .withMessage('Адрес покупателя должен содержать только шестнадцатеричные символы'),
    body('amount')
        .isFloat({ min: 0.1, max: 1000000 })
        .withMessage('Сумма должна быть от 0.1 до 1,000,000 TON')
];

// Валидация рейтинга
const validateRating = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Рейтинг должен быть от 1 до 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Комментарий должен быть от 10 до 500 символов')
        .escape()
];

// Улучшенная система кэширования
class CacheSystem {
    constructor() {
        this.memoryCache = new Map();
        this.defaultTTL = 300; // 5 минут
        this.maxMemorySize = 100 * 1024 * 1024; // 100MB
        this.currentMemorySize = 0;
    }

    async get(key) {
        try {
            // Сначала проверяем память
            const memoryData = this.memoryCache.get(key);
            if (memoryData && memoryData.expires > Date.now()) {
                return memoryData.value;
            }

            return null;
        } catch (error) {
            console.error('Ошибка получения данных из кэша:', error);
            return null;
        }
    }

    async set(key, value, ttl = this.defaultTTL) {
        try {
            // Сохраняем в память
            this.setMemory(key, value, ttl);
            
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных в кэш:', error);
            return false;
        }
    }

    setMemory(key, value, ttl = this.defaultTTL) {
        const dataSize = JSON.stringify(value).length;
        
        // Проверяем размер памяти
        while (this.currentMemorySize + dataSize > this.maxMemorySize) {
            const oldestKey = this.getOldestKey();
            if (oldestKey) {
                this.removeFromMemory(oldestKey);
            } else {
                break;
            }
        }

        this.memoryCache.set(key, {
            value,
            expires: Date.now() + (ttl * 1000),
            size: dataSize
        });
        this.currentMemorySize += dataSize;
    }

    removeFromMemory(key) {
        const data = this.memoryCache.get(key);
        if (data) {
            this.currentMemorySize -= data.size;
            this.memoryCache.delete(key);
        }
    }

    getOldestKey() {
        let oldestKey = null;
        let oldestExpires = Infinity;

        for (const [key, data] of this.memoryCache.entries()) {
            if (data.expires < oldestExpires) {
                oldestExpires = data.expires;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    async invalidate(pattern) {
        try {
            // Инвалидация в памяти
            for (const key of this.memoryCache.keys()) {
                if (key.match(pattern)) {
                    this.removeFromMemory(key);
                }
            }
        } catch (error) {
            console.error('Ошибка инвалидации кэша:', error);
        }
    }

    async clear() {
        try {
            this.memoryCache.clear();
            this.currentMemorySize = 0;
        } catch (error) {
            console.error('Ошибка очистки кэша:', error);
        }
    }
}

const cacheSystem = new CacheSystem();

// Обновленный middleware для кэширования
const cacheMiddleware = (duration, options = {}) => {
    return async (req, res, next) => {
        const key = `__express__${req.originalUrl || req.url}`;
        
        try {
            const cachedResponse = await cacheSystem.get(key);
            
            if (cachedResponse) {
                if (options.addHeaders) {
                    res.set('X-Cache', 'HIT');
                }
                res.json(cachedResponse);
                return;
            }
            
            if (options.addHeaders) {
                res.set('X-Cache', 'MISS');
            }

            res.sendResponse = res.json;
            res.json = (body) => {
                cacheSystem.set(key, body, duration);
                res.sendResponse(body);
            };
            next();
        } catch (error) {
            console.error('Ошибка кэширования:', error);
            next();
        }
    };
};

// Middleware для проверки ошибок валидации
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Статические файлы с кэшированием
app.use(express.static('public', {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));
app.use('/uploads', express.static('public/uploads'));

// Константы
const COMMISSION_WALLET = 'UQASbk4JxjCjgU6Hj3mdW9iPiF-csOsPBLhLhEYoAQdt8vwY';
const COMMISSION_RATE = 0.025; // 2.5%
const DEAL_TIMEOUT = 24 * 60 * 60 * 1000; // 24 часа
const DEAL_STATUS = {
    PENDING: 'pending',
    WAITING_DELIVERY: 'waiting_delivery',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    DISPUTED: 'disputed',
    REFUNDED: 'refunded'
};

// Модели данных
const gifts = new Map();
const deals = new Map();

// Создание директории для загрузок, если её нет
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

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = {
            'image/jpeg': true,
            'image/png': true,
            'image/gif': true,
            'model/gltf-binary': true,
            'model/gltf+json': true
        };
        
        if (allowedTypes[file.mimetype]) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый тип файла'));
        }
    }
});

// Создание транзакции TON
app.post('/api/withdrawal', async (req, res) => {
    try {
        const {
            amount,
            walletAddress,
            memo
        } = req.body;

        // Валидация данных
        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'Минимальная сумма 1 TON' });
        }

        if (!walletAddress || !/^[0-9a-zA-Z]{48}$/.test(walletAddress)) {
            return res.status(400).json({ error: 'Неверный формат адреса TON кошелька' });
        }

        // Расчет комиссии
        const commission = amount * COMMISSION_RATE;
        const finalAmount = amount - commission;

        // Создание транзакции
        const transaction = {
            id: Date.now().toString(),
            amount: finalAmount,
            originalAmount: amount,
            commission: commission,
            commissionWallet: COMMISSION_WALLET,
            walletAddress,
            memo: memo || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            networkFee: 0.05, // Комиссия сети TON
            estimatedTime: '1-2 минуты'
        };

        // В реальном приложении здесь будет интеграция с TON API
        // Сначала отправляем комиссию
        // Затем отправляем основную сумму
        transactions.push(transaction);

        // Имитация обработки транзакции
        setTimeout(() => {
            transaction.status = 'processing';
            // В реальном приложении здесь будет проверка статуса транзакции через TON API
        }, 1000);

        res.json({
            success: true,
            transactionId: transaction.id,
            message: 'Транзакция создана',
            details: {
                originalAmount: amount,
                commission: commission,
                finalAmount: finalAmount,
                commissionWallet: COMMISSION_WALLET
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Ошибка при создании транзакции' });
    }
});

// Получение статуса транзакции
app.get('/api/withdrawal/:id', (req, res) => {
    const transaction = transactions.find(t => t.id === req.params.id);
    if (!transaction) {
        return res.status(404).json({ error: 'Транзакция не найдена' });
    }
    res.json(transaction);
});

// Получение курса TON
app.get('/api/ton-rate', (req, res) => {
    // В реальном приложении здесь будет запрос к API биржи
    res.json({
        rate: 2.5, // Примерный курс TON/USD
        lastUpdated: new Date().toISOString()
    });
});

// Функция для проверки таймаута сделок
function checkDealTimeout() {
    const now = Date.now();
    deals.forEach((deal, dealId) => {
        if (deal.status === DEAL_STATUS.WAITING_DELIVERY && 
            (now - new Date(deal.createdAt).getTime()) > DEAL_TIMEOUT) {
            deal.status = DEAL_STATUS.REFUNDED;
            deal.refundedAt = new Date();
            deals.set(dealId, deal);
            console.log(`Сделка ${dealId} автоматически возвращена из-за таймаута`);
        }
    });
}

// Проверяем таймаут каждые 5 минут
setInterval(checkDealTimeout, 5 * 60 * 1000);

// API для подарков
app.post('/api/gifts', validateGift, checkValidation, upload.fields([
    { name: 'background', maxCount: 1 },
    { name: 'model', maxCount: 1 },
    { name: 'pattern', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, description, price, sellerAddress } = req.body;
        
        if (!req.files || !req.files.background || !req.files.model || !req.files.pattern) {
            return res.status(400).json({ error: 'Необходимо загрузить все файлы' });
        }
        
        const gift = {
            id: Date.now().toString(),
            name,
            description,
            price: parseFloat(price),
            sellerAddress,
            backgroundUrl: `/uploads/${req.files.background[0].filename}`,
            modelUrl: `/uploads/${req.files.model[0].filename}`,
            patternUrl: `/uploads/${req.files.pattern[0].filename}`,
            createdAt: new Date(),
            status: 'active'
        };
        
        gifts.set(gift.id, gift);
        res.json(gift);
    } catch (error) {
        console.error('Ошибка при создании подарка:', error);
        res.status(500).json({ error: error.message });
    }
});

// API для подарков с кэшированием
app.get('/api/gifts', cacheMiddleware(300), async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sortBy } = req.query;
        let activeGifts = Array.from(gifts.values()).filter(gift => gift.status === 'active');
        
        // Фильтрация по категории
        if (category) {
            activeGifts = activeGifts.filter(gift => gift.category === category);
        }
        
        // Фильтрация по цене
        if (minPrice) {
            activeGifts = activeGifts.filter(gift => gift.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            activeGifts = activeGifts.filter(gift => gift.price <= parseFloat(maxPrice));
        }
        
        // Сортировка
        if (sortBy) {
            switch (sortBy) {
                case 'price_asc':
                    activeGifts.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    activeGifts.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    activeGifts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'popular':
                    activeGifts.sort((a, b) => (b.sales || 0) - (a.sales || 0));
                    break;
            }
        }
        
        res.json(activeGifts);
    } catch (error) {
        console.error('Ошибка при получении подарков:', error);
        res.status(500).json({ error: error.message });
    }
});

// Обновляем API для сделок с уведомлениями
app.post('/api/deals', async (req, res) => {
    try {
        const { giftId, buyerAddress, sellerAddress, amount, transactionHash } = req.body;
        
        const gift = gifts.get(giftId);
        if (!gift) {
            return res.status(404).json({ error: 'Подарок не найден' });
        }
        
        if (gift.price !== amount) {
            return res.status(400).json({ error: 'Неверная сумма' });
        }
        
        const deal = {
            id: Date.now().toString(),
            giftId,
            buyerAddress,
            sellerAddress,
            amount,
            transactionHash,
            status: DEAL_STATUS.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        deals.set(deal.id, deal);

        // Отправляем уведомления
        sendNotification(sellerAddress, {
            type: 'new_deal',
            message: 'Новая сделка!',
            dealId: deal.id,
            amount: deal.amount
        });

        res.json(deal);
    } catch (error) {
        console.error('Ошибка при создании сделки:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/deals/:dealId/deliver', async (req, res) => {
    try {
        const deal = deals.get(req.params.dealId);
        if (!deal) {
            return res.status(404).json({ error: 'Сделка не найдена' });
        }
        
        if (deal.status !== DEAL_STATUS.PENDING) {
            return res.status(400).json({ error: 'Неверный статус сделки' });
        }
        
        deal.status = DEAL_STATUS.WAITING_DELIVERY;
        deal.updatedAt = new Date();
        deals.set(deal.id, deal);
        res.json(deal);
    } catch (error) {
        console.error('Ошибка при обновлении статуса доставки:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/deals/:dealId/confirm', async (req, res) => {
    try {
        const deal = deals.get(req.params.dealId);
        if (!deal) {
            return res.status(404).json({ error: 'Сделка не найдена' });
        }
        
        if (deal.status !== DEAL_STATUS.WAITING_DELIVERY) {
            return res.status(400).json({ error: 'Неверный статус сделки' });
        }
        
        deal.status = DEAL_STATUS.COMPLETED;
        deal.completedAt = new Date();
        deal.updatedAt = new Date();
        deals.set(deal.id, deal);
        res.json(deal);
    } catch (error) {
        console.error('Ошибка при подтверждении сделки:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/deals/:dealId/dispute', async (req, res) => {
    try {
        const deal = deals.get(req.params.dealId);
        if (!deal) {
            return res.status(404).json({ error: 'Сделка не найдена' });
        }
        
        if (deal.status !== DEAL_STATUS.WAITING_DELIVERY) {
            return res.status(400).json({ error: 'Неверный статус сделки' });
        }
        
        deal.status = DEAL_STATUS.DISPUTED;
        deal.disputedAt = new Date();
        deal.updatedAt = new Date();
        deals.set(deal.id, deal);
        res.json(deal);
    } catch (error) {
        console.error('Ошибка при открытии спора:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/deals/:dealId', (req, res) => {
    try {
        const deal = deals.get(req.params.dealId);
        if (!deal) {
            return res.status(404).json({ error: 'Сделка не найдена' });
        }
        res.json(deal);
    } catch (error) {
        console.error('Ошибка при получении сделки:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/seller/:id/dashboard', (req, res) => {
    // Логика получения данных панели управления продавца
    res.json({
        stats: {
            totalSales: 0,
            totalRevenue: 0,
            activeGifts: 0
        },
        recentTransactions: [],
        popularGifts: []
    });
});

app.get('/api/seller/:id/transactions', (req, res) => {
    // Логика получения истории транзакций
    res.json({ transactions: [] });
});

// API для истории транзакций с пагинацией
app.get('/api/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const transactions = Array.from(deals.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(offset, offset + limit);
            
        const total = deals.size;
        
        res.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Ошибка при получении транзакций:', error);
        res.status(500).json({ error: error.message });
    }
});

// API для рейтинга продавца
app.get('/api/seller/:id/rating', cacheMiddleware(300), (req, res) => {
    try {
        const sellerId = req.params.id;
        const sellerDeals = Array.from(deals.values())
            .filter(deal => deal.sellerAddress === sellerId);
            
        const ratings = sellerDeals
            .filter(deal => deal.rating)
            .map(deal => deal.rating);
            
        const averageRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
            
        res.json({
            rating: averageRating,
            totalReviews: ratings.length,
            recentReviews: sellerDeals
                .filter(deal => deal.rating)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
        });
    } catch (error) {
        console.error('Ошибка при получении рейтинга:', error);
        res.status(500).json({ error: error.message });
    }
});

// API для аналитики продавца
app.get('/api/seller/:id/analytics', async (req, res) => {
    try {
        const sellerId = req.params.id;
        const period = req.query.period || '30d'; // 30d, 7d, 24h
        
        // Получаем все сделки продавца
        const sellerDeals = Array.from(deals.values())
            .filter(deal => deal.sellerAddress === sellerId);
            
        // Рассчитываем период
        const now = new Date();
        let startDate;
        switch (period) {
            case '7d':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '24h':
                startDate = new Date(now.setHours(now.getHours() - 24));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 30));
        }
        
        // Фильтруем сделки по периоду
        const periodDeals = sellerDeals.filter(deal => 
            new Date(deal.createdAt) >= startDate
        );
        
        // Рассчитываем статистику
        const stats = {
            totalSales: periodDeals.length,
            totalRevenue: periodDeals.reduce((sum, deal) => sum + deal.amount, 0),
            averageRating: calculateAverageRating(periodDeals),
            popularGifts: getPopularGifts(sellerId, period),
            salesByDay: getSalesByDay(periodDeals),
            conversionRate: calculateConversionRate(sellerId, period)
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Ошибка при получении аналитики:', error);
        res.status(500).json({ error: error.message });
    }
});

// Вспомогательные функции для аналитики
function calculateAverageRating(deals) {
    const ratedDeals = deals.filter(deal => deal.rating);
    if (ratedDeals.length === 0) return 0;
    return ratedDeals.reduce((sum, deal) => sum + deal.rating, 0) / ratedDeals.length;
}

function getPopularGifts(sellerId, period) {
    const sellerGifts = Array.from(gifts.values())
        .filter(gift => gift.sellerAddress === sellerId);
        
    return sellerGifts
        .map(gift => ({
            id: gift.id,
            name: gift.name,
            sales: deals.filter(deal => 
                deal.giftId === gift.id && 
                new Date(deal.createdAt) >= getStartDate(period)
            ).length
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
}

function getSalesByDay(deals) {
    const salesByDay = {};
    deals.forEach(deal => {
        const date = new Date(deal.createdAt).toISOString().split('T')[0];
        salesByDay[date] = (salesByDay[date] || 0) + 1;
    });
    return salesByDay;
}

function calculateConversionRate(sellerId, period) {
    const sellerGifts = Array.from(gifts.values())
        .filter(gift => gift.sellerAddress === sellerId);
        
    const totalViews = sellerGifts.reduce((sum, gift) => sum + (gift.views || 0), 0);
    const totalSales = deals.filter(deal => 
        deal.sellerAddress === sellerId && 
        new Date(deal.createdAt) >= getStartDate(period)
    ).length;
    
    return totalViews > 0 ? (totalSales / totalViews) * 100 : 0;
}

function getStartDate(period) {
    const now = new Date();
    switch (period) {
        case '7d':
            return new Date(now.setDate(now.getDate() - 7));
        case '24h':
            return new Date(now.setHours(now.getHours() - 24));
        default:
            return new Date(now.setDate(now.getDate() - 30));
    }
}

// API для рекомендаций подарков
app.get('/api/recommendations', async (req, res) => {
    try {
        const userId = req.query.userId;
        const limit = parseInt(req.query.limit) || 10;
        
        // Получаем историю покупок пользователя
        const userDeals = Array.from(deals.values())
            .filter(deal => deal.buyerAddress === userId);
            
        // Получаем категории купленных подарков
        const userCategories = userDeals.map(deal => {
            const gift = gifts.get(deal.giftId);
            return gift ? gift.category : null;
        }).filter(Boolean);
        
        // Получаем популярные подарки в этих категориях
        const recommendations = getRecommendationsByCategories(userCategories, limit);
        
        res.json(recommendations);
    } catch (error) {
        console.error('Ошибка при получении рекомендаций:', error);
        res.status(500).json({ error: error.message });
    }
});

// Вспомогательные функции для рекомендаций
function getRecommendationsByCategories(categories, limit) {
    // Считаем частоту категорий
    const categoryFrequency = {};
    categories.forEach(category => {
        categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
    });
    
    // Сортируем категории по частоте
    const sortedCategories = Object.entries(categoryFrequency)
        .sort(([,a], [,b]) => b - a)
        .map(([category]) => category);
    
    // Получаем подарки из этих категорий
    const recommendedGifts = [];
    sortedCategories.forEach(category => {
        const categoryGifts = Array.from(gifts.values())
            .filter(gift => gift.category === category && gift.status === 'active')
            .sort((a, b) => (b.views || 0) - (a.views || 0));
            
        recommendedGifts.push(...categoryGifts);
    });
    
    // Удаляем дубликаты и ограничиваем количество
    return [...new Set(recommendedGifts.map(gift => gift.id))]
        .map(id => recommendedGifts.find(gift => gift.id === id))
        .slice(0, limit);
}

// API для похожих подарков
app.get('/api/gifts/:id/similar', async (req, res) => {
    try {
        const giftId = req.params.id;
        const limit = parseInt(req.query.limit) || 5;
        
        const gift = gifts.get(giftId);
        if (!gift) {
            return res.status(404).json({ error: 'Подарок не найден' });
        }
        
        const similarGifts = getSimilarGifts(gift, limit);
        res.json(similarGifts);
    } catch (error) {
        console.error('Ошибка при получении похожих подарков:', error);
        res.status(500).json({ error: error.message });
    }
});

function getSimilarGifts(gift, limit) {
    return Array.from(gifts.values())
        .filter(g => 
            g.id !== gift.id && 
            g.status === 'active' &&
            (g.category === gift.category || 
             Math.abs(g.price - gift.price) < gift.price * 0.2)
        )
        .sort((a, b) => {
            // Сначала сортируем по категории
            if (a.category === gift.category && b.category !== gift.category) return -1;
            if (a.category !== gift.category && b.category === gift.category) return 1;
            
            // Затем по цене
            return Math.abs(a.price - gift.price) - Math.abs(b.price - gift.price);
        })
        .slice(0, limit);
}

// Улучшенный API для поиска подарков
app.get('/api/gifts/search', async (req, res) => {
    try {
        const {
            query,
            category,
            minPrice,
            maxPrice,
            sortBy,
            sellerId,
            rating,
            tags,
            page = 1,
            limit = 12
        } = req.query;

        let filteredGifts = Array.from(gifts.values())
            .filter(gift => gift.status === 'active');

        // Поиск по тексту
        if (query) {
            const searchQuery = query.toLowerCase();
            filteredGifts = filteredGifts.filter(gift => 
                gift.name.toLowerCase().includes(searchQuery) ||
                gift.description.toLowerCase().includes(searchQuery)
            );
        }

        // Фильтр по категории
        if (category) {
            filteredGifts = filteredGifts.filter(gift => gift.category === category);
        }

        // Фильтр по цене
        if (minPrice) {
            filteredGifts = filteredGifts.filter(gift => gift.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filteredGifts = filteredGifts.filter(gift => gift.price <= parseFloat(maxPrice));
        }

        // Фильтр по продавцу
        if (sellerId) {
            filteredGifts = filteredGifts.filter(gift => gift.sellerAddress === sellerId);
        }

        // Фильтр по рейтингу
        if (rating) {
            filteredGifts = filteredGifts.filter(gift => {
                const giftDeals = Array.from(deals.values())
                    .filter(deal => deal.giftId === gift.id);
                const averageRating = calculateAverageRating(giftDeals);
                return averageRating >= parseFloat(rating);
            });
        }

        // Фильтр по тегам
        if (tags) {
            const tagArray = tags.split(',');
            filteredGifts = filteredGifts.filter(gift => 
                tagArray.every(tag => gift.tags && gift.tags.includes(tag))
            );
        }

        // Сортировка
        if (sortBy) {
            filteredGifts.sort((a, b) => {
                switch (sortBy) {
                    case 'price_asc':
                        return a.price - b.price;
                    case 'price_desc':
                        return b.price - a.price;
                    case 'newest':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'popular':
                        const aDeals = deals.filter(d => d.giftId === a.id).length;
                        const bDeals = deals.filter(d => d.giftId === b.id).length;
                        return bDeals - aDeals;
                    case 'rating':
                        const aRating = calculateAverageRating(
                            deals.filter(d => d.giftId === a.id)
                        );
                        const bRating = calculateAverageRating(
                            deals.filter(d => d.giftId === b.id)
                        );
                        return bRating - aRating;
                    default:
                        return 0;
                }
            });
        }

        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedGifts = filteredGifts.slice(startIndex, endIndex);

        // Добавляем дополнительную информацию
        const enrichedGifts = paginatedGifts.map(gift => ({
            ...gift,
            rating: calculateAverageRating(
                deals.filter(d => d.giftId === gift.id)
            ),
            sales: deals.filter(d => d.giftId === gift.id).length,
            sellerRating: calculateSellerRating(gift.sellerAddress)
        }));

        res.json({
            gifts: enrichedGifts,
            total: filteredGifts.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredGifts.length / limit)
        });
    } catch (error) {
        console.error('Ошибка при поиске подарков:', error);
        res.status(500).json({ error: error.message });
    }
});

// Вспомогательные функции для поиска
function calculateSellerRating(sellerAddress) {
    const sellerDeals = Array.from(deals.values())
        .filter(deal => deal.sellerAddress === sellerAddress);
    return calculateAverageRating(sellerDeals);
}

// API для получения популярных тегов
app.get('/api/tags/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Собираем все теги
        const allTags = Array.from(gifts.values())
            .reduce((tags, gift) => {
                if (gift.tags) {
                    gift.tags.forEach(tag => {
                        tags[tag] = (tags[tag] || 0) + 1;
                    });
                }
                return tags;
            }, {});
            
        // Сортируем по популярности
        const popularTags = Object.entries(allTags)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
            
        res.json(popularTags);
    } catch (error) {
        console.error('Ошибка при получении популярных тегов:', error);
        res.status(500).json({ error: error.message });
    }
});

// Улучшенная система обработки ошибок
class ErrorHandler {
    constructor() {
        this.errorTypes = new Map();
        this.errorHandlers = new Map();
        this.defaultHandler = this.handleDefaultError.bind(this);
    }

    registerErrorType(name, statusCode, defaultMessage) {
        this.errorTypes.set(name, {
            statusCode,
            defaultMessage
        });
    }

    registerHandler(errorType, handler) {
        this.errorHandlers.set(errorType, handler);
    }

    handleError(error, req, res, next) {
        const errorType = this.getErrorType(error);
        const handler = this.errorHandlers.get(errorType) || this.defaultHandler;
        
        try {
            handler(error, req, res, next);
        } catch (handlerError) {
            this.handleDefaultError(handlerError, req, res, next);
        }
    }

    getErrorType(error) {
        if (error.name) {
            return error.name;
        }
        return 'UnknownError';
    }

    handleDefaultError(error, req, res, next) {
        const errorType = this.getErrorType(error);
        const typeInfo = this.errorTypes.get(errorType) || {
            statusCode: 500,
            defaultMessage: 'Внутренняя ошибка сервера'
        };

        const response = {
            error: {
                type: errorType,
                message: error.message || typeInfo.defaultMessage,
                code: error.code || 'INTERNAL_ERROR',
                timestamp: new Date().toISOString()
            }
        };

        // Добавляем детали ошибки в режиме разработки
        if (process.env.NODE_ENV === 'development') {
            response.error.details = {
                stack: error.stack,
                path: req.path,
                method: req.method,
                query: req.query,
                body: req.body
            };
        }

        // Логируем ошибку
        this.logError(error, req);

        res.status(typeInfo.statusCode).json(response);
    }

    logError(error, req) {
        const logData = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            request: {
                method: req.method,
                path: req.path,
                query: req.query,
                body: req.body,
                ip: req.ip,
                userAgent: req.get('user-agent')
            }
        };

        console.error(JSON.stringify(logData, null, 2));
    }
}

const errorHandler = new ErrorHandler();

// Регистрируем типы ошибок
errorHandler.registerErrorType('ValidationError', 400, 'Ошибка валидации');
errorHandler.registerErrorType('NotFoundError', 404, 'Ресурс не найден');
errorHandler.registerErrorType('AuthenticationError', 401, 'Ошибка аутентификации');
errorHandler.registerErrorType('AuthorizationError', 403, 'Ошибка авторизации');
errorHandler.registerErrorType('RateLimitError', 429, 'Превышен лимит запросов');
errorHandler.registerErrorType('DatabaseError', 503, 'Ошибка базы данных');
errorHandler.registerErrorType('ExternalServiceError', 502, 'Ошибка внешнего сервиса');

// Регистрируем обработчики ошибок
errorHandler.registerHandler('ValidationError', (error, req, res) => {
    res.status(400).json({
        error: {
            type: 'ValidationError',
            message: 'Ошибка валидации',
            details: error.errors,
            timestamp: new Date().toISOString()
        }
    });
});

errorHandler.registerHandler('NotFoundError', (error, req, res) => {
    res.status(404).json({
        error: {
            type: 'NotFoundError',
            message: error.message || 'Ресурс не найден',
            timestamp: new Date().toISOString()
        }
    });
});

errorHandler.registerHandler('RateLimitError', (error, req, res) => {
    res.status(429).json({
        error: {
            type: 'RateLimitError',
            message: 'Превышен лимит запросов',
            retryAfter: error.retryAfter,
            timestamp: new Date().toISOString()
        }
    });
});

// Обновляем middleware для обработки ошибок
app.use((err, req, res, next) => {
    errorHandler.handleError(err, req, res, next);
});

// Middleware для проверки данных от Telegram
function validateTelegramData(initData, botToken) {
    const initDataObj = Object.fromEntries(new URLSearchParams(initData));
    const hash = initDataObj.hash;
    delete initDataObj.hash;
    const dataCheckString = Object.keys(initDataObj)
        .sort()
        .map(key => `${key}=${initDataObj[key]}`)
        .join('\n');
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    return calculatedHash === hash;
}

// Middleware для проверки данных Telegram
app.use('/api/telegram/*', (req, res, next) => {
    const initData = req.headers['x-telegram-init-data'];
    if (!initData) {
        return res.status(401).json({ error: 'Отсутствуют данные инициализации Telegram' });
    }
    if (!validateTelegramData(initData, BOT_TOKEN)) {
        return res.status(401).json({ error: 'Неверные данные инициализации' });
    }
    next();
});

// API эндпоинты
app.get('/api/telegram/init', (req, res) => {
    const initData = req.headers['x-telegram-init-data'];
    const initDataObj = Object.fromEntries(new URLSearchParams(initData));
    
    let user = null;
    try {
        user = JSON.parse(initDataObj.user);
    } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
    }
    
    res.json({
        user: {
            id: user?.id,
            username: user?.username,
            firstName: user?.first_name,
            lastName: user?.last_name
        },
        config: {
            mainButtonText: 'Создать подарок',
            mainButtonColor: '#2481cc'
        }
    });
});

// API для получения подарков пользователя
app.get('/api/telegram/gifts', (req, res) => {
    const initData = req.headers['x-telegram-init-data'];
    const initDataObj = Object.fromEntries(new URLSearchParams(initData));
    let user = null;
    try {
        user = JSON.parse(initDataObj.user);
    } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
        return res.status(400).json({ error: 'Неверные данные пользователя' });
    }
    
    const userGifts = Array.from(gifts.values())
        .filter(gift => gift.sellerAddress === user.id);
    
    res.json(userGifts);
});

// API для создания подарка через Telegram
app.post('/api/telegram/gifts', upload.fields([
    { name: 'background', maxCount: 1 },
    { name: 'model', maxCount: 1 }
]), async (req, res) => {
    const initData = req.headers['x-telegram-init-data'];
    const initDataObj = Object.fromEntries(new URLSearchParams(initData));
    let user = null;
    try {
        user = JSON.parse(initDataObj.user);
    } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
        return res.status(400).json({ error: 'Неверные данные пользователя' });
    }
    
    const { name, description, price, category } = req.body;
    const giftId = Date.now().toString();
    
    const gift = {
        id: giftId,
        name,
        description,
        price: parseFloat(price),
        category,
        sellerAddress: user.id,
        backgroundUrl: req.files.background ? `/uploads/${req.files.background[0].filename}` : null,
        modelUrl: req.files.model ? `/uploads/${req.files.model[0].filename}` : null,
        createdAt: new Date(),
        stats: {
            views: 0,
            sales: 0,
            rating: 0
        }
    };
    
    gifts.set(giftId, gift);
    res.json(gift);
});

// API для получения сделок пользователя
app.get('/api/telegram/deals', (req, res) => {
    const initData = req.headers['x-telegram-init-data'];
    const initDataObj = Object.fromEntries(new URLSearchParams(initData));
    let user = null;
    try {
        user = JSON.parse(initDataObj.user);
    } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
        return res.status(400).json({ error: 'Неверные данные пользователя' });
    }
    
    const userDeals = Array.from(deals.values())
        .filter(deal => deal.sellerId === user.id || deal.buyerId === user.id);
    
    res.json(userDeals);
});

// API для получения статистики пользователя
app.get('/api/telegram/stats', (req, res) => {
    const initData = req.headers['x-telegram-init-data'];
    const initDataObj = Object.fromEntries(new URLSearchParams(initData));
    let user = null;
    try {
        user = JSON.parse(initDataObj.user);
    } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
        return res.status(400).json({ error: 'Неверные данные пользователя' });
    }
    
    const userGifts = Array.from(gifts.values())
        .filter(gift => gift.sellerAddress === user.id);
    
    const userDeals = Array.from(deals.values())
        .filter(deal => deal.sellerId === user.id);
    
    const stats = {
        totalGifts: userGifts.length,
        activeGifts: userGifts.filter(g => !g.deleted).length,
        totalSales: userDeals.length,
        totalRevenue: userDeals.reduce((sum, deal) => sum + deal.amount, 0),
        recentDeals: userDeals
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5)
            .map(deal => ({
                gift: gifts.get(deal.giftId),
                amount: deal.amount,
                createdAt: deal.createdAt
            }))
    };
    
    res.json(stats);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
}); 