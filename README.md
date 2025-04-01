# Telegram Stars Shop Bot

Бот для продажи Stars в Telegram с интеграцией TON.

## Возможности

- Покупка Stars через TON
- Интеграция с Telegram Mini App
- Система комиссий
- Статистика покупок
- Административная панель

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/MatthewAura444/123123.git
cd 123123
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` и добавьте необходимые переменные:
```
BOT_TOKEN=7687296256:AAEnJhFMiWWKAZ0aXQaqQF3pzynVS9Do4OU
TON_API_KEY=your_ton_api_key
ADMIN_ID=your_admin_id
```

4. Запустите бота:
```bash
python bot.py
```

## Настройка

1. В файле `config.py` настройте:
   - Токен бота
   - ID администратора
   - API ключ TON
   - URL веб-приложения
   - Комиссию
   - Цены на Stars

2. В файле `public/telegram-app.js` обновите URL вашего бота:
```javascript
const BOT_URL = 'https://your-bot-domain.com';
```

## Использование

1. Запустите бота командой `/start`
2. Используйте кнопку "Buy Stars" для открытия веб-интерфейса
3. Выберите количество Stars для покупки
4. Оплатите через TON
5. Получите Stars на свой аккаунт

## Административные команды

- `/stats` - статистика продаж
- `/users` - список пользователей
- `/broadcast` - рассылка сообщений
- `/setprice` - установка цен
- `/withdraw` - вывод средств

## Разработка

### Структура проекта

```
├── bot.py              # Основной файл бота
├── config.py           # Конфигурация
├── database.py         # Работа с базой данных
├── handlers/           # Обработчики команд
├── models/            # Модели данных
├── public/            # Веб-интерфейс
└── utils/             # Вспомогательные функции
```

### Добавление новых функций

1. Создайте новый обработчик в `handlers/`
2. Добавьте маршрут в `bot.py`
3. Обновите документацию

## Лицензия

MIT License 