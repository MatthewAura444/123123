# Telegram Gifts Marketplace

Платформа для продажи и покупки подарков через Telegram с поддержкой TON.

## Возможности

- Создание и управление коллекциями подарков
- Загрузка и продажа цифровых и физических подарков
- Поддержка 3D моделей
- Интеграция с TON для платежей
- Система рейтингов и отзывов
- WebSocket уведомления в реальном времени
- Адаптивный дизайн
- Поддержка темной темы

## Технологии

- Node.js
- Express
- MongoDB
- WebSocket
- TON Connect
- React
- Tailwind CSS

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/telegram-gifts.git
cd telegram-gifts
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл .env:
```env
BOT_TOKEN=your_telegram_bot_token
MONGODB_URI=mongodb://localhost:27017/telegram-gifts
PORT=3000
WS_PORT=8080
JWT_SECRET=your_jwt_secret
```

4. Запустите сервер:
```bash
npm run dev
```

## API Endpoints

### Аутентификация
- POST /api/auth/register - Регистрация
- POST /api/auth/login - Вход
- GET /api/auth/profile - Получение профиля
- PUT /api/auth/profile - Обновление профиля
- PUT /api/auth/avatar - Обновление аватара

### Коллекции
- POST /api/collections - Создание коллекции
- GET /api/collections - Получение списка коллекций
- GET /api/collections/:id - Получение коллекции
- PUT /api/collections/:id - Обновление коллекции
- DELETE /api/collections/:id - Удаление коллекции

### Подарки
- POST /api/gifts - Создание подарка
- GET /api/gifts - Получение списка подарков
- GET /api/gifts/:id - Получение подарка
- PUT /api/gifts/:id - Обновление подарка
- DELETE /api/gifts/:id - Удаление подарка

### Транзакции
- POST /api/transactions - Создание транзакции
- GET /api/transactions - Получение списка транзакций
- GET /api/transactions/:id - Получение транзакции
- PUT /api/transactions/:id/status - Обновление статуса транзакции
- GET /api/transactions/stats - Получение статистики транзакций

## WebSocket Events

### События подарков
- NEW_GIFT - Новый подарок
- GIFT_UPDATED - Подарок обновлен
- GIFT_DELETED - Подарок удален

### События коллекций
- NEW_COLLECTION - Новая коллекция
- COLLECTION_UPDATED - Коллекция обновлена
- COLLECTION_DELETED - Коллекция удалена

### События транзакций
- NEW_TRANSACTION - Новая транзакция
- TRANSACTION_UPDATED - Транзакция обновлена

### События отзывов
- NEW_REVIEW - Новый отзыв

### События пользователей
- USER_STATUS - Статус пользователя

## Разработка

### Структура проекта
```
telegram-gifts/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── websocket/
├── uploads/
│   ├── images/
│   └── models/
├── .env
├── .gitignore
├── package.json
└── README.md
```

### Скрипты
- `npm start` - Запуск сервера
- `npm run dev` - Запуск сервера в режиме разработки
- `npm test` - Запуск тестов

## Лицензия

MIT 