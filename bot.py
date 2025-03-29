import os
import json
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
TOKEN = "8019781527:AAFM9My4_fxzX4e94Us8H2DgQmcNa5m2dSs"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    try:
        keyboard = [
            [InlineKeyboardButton("Выбрать подарок", web_app=WebAppInfo(url="https://matthewaura444.github.io/123123/public/telegram-app.html"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "Добро пожаловать в TelegramGift! Нажмите на кнопку ниже, чтобы выбрать подарок:",
            reply_markup=reply_markup
        )
    except Exception as e:
        logger.error(f"Ошибка при запуске бота: {e}")
        await update.message.reply_text(
            "Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже."
        )

async def webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик данных от веб-приложения"""
    try:
        data = json.loads(update.message.web_app_data.data)
        if data.get('action') == 'select_gift':
            gift_name = data.get('gift_name', 'Неизвестный подарок')
            gift_price = data.get('gift_price', 'Цена не указана')
            await update.message.reply_text(
                f"Вы выбрали подарок: {gift_name}\n"
                f"Стоимость: {gift_price}\n\n"
                f"Для оплаты и отправки подарка, пожалуйста, свяжитесь с @your_support_username"
            )
    except Exception as e:
        logger.error(f"Ошибка при обработке данных веб-приложения: {e}")
        await update.message.reply_text(
            "Произошла ошибка при обработке данных. Пожалуйста, попробуйте позже."
        )

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик ошибок"""
    logger.error(f"Update {update} caused error {context.error}")

def main():
    """Запуск бота"""
    # Создаем приложение
    application = Application.builder().token(TOKEN).build()

    # Добавляем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, webapp_data))
    
    # Обработчик ошибок
    application.add_error_handler(error_handler)

    # Удаляем вебхук и запускаем бота
    application.bot.delete_webhook(drop_pending_updates=True)
    
    # Запускаем бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 