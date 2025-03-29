import os
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Токен бота
TOKEN = "7330941572:AAGghstyq7lAhmtanvlgwmvSx0dvVEUiDBo"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    try:
        keyboard = [
            [InlineKeyboardButton("Открыть TelegramGift", web_app=WebAppInfo(url="https://matthewaura444.github.io/123123/public/telegram-app.html"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "Добро пожаловать в TelegramGift! Нажмите на кнопку ниже, чтобы открыть приложение:",
            reply_markup=reply_markup
        )
    except Exception as e:
        logger.error(f"Ошибка при запуске бота: {e}")
        await update.message.reply_text(
            "Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже."
        )

async def webapp(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /webapp"""
    try:
        keyboard = [
            [InlineKeyboardButton("Открыть TelegramGift", web_app=WebAppInfo(url="https://matthewaura444.github.io/123123/public/telegram-app.html"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "Нажмите на кнопку ниже, чтобы открыть TelegramGift:",
            reply_markup=reply_markup
        )
    except Exception as e:
        logger.error(f"Ошибка при открытии веб-приложения: {e}")
        await update.message.reply_text(
            "Произошла ошибка при открытии веб-приложения. Пожалуйста, попробуйте позже."
        )

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик ошибок"""
    logger.error(f"Произошла ошибка: {context.error}")
    if update and update.effective_message:
        await update.effective_message.reply_text(
            "Произошла ошибка. Пожалуйста, попробуйте позже."
        )

def main():
    """Основная функция"""
    try:
        # Создаем приложение
        application = Application.builder().token(TOKEN).build()

        # Добавляем обработчики команд
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("webapp", webapp))

        # Добавляем обработчик ошибок
        application.add_error_handler(error_handler)

        # Очищаем предыдущие обновления
        application.bot.delete_webhook(drop_pending_updates=True)

        # Запускаем бота
        application.run_polling(allowed_updates=Update.ALL_TYPES)
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}")

if __name__ == '__main__':
    main() 