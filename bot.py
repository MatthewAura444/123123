import os
import logging
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Get bot token from environment variable
TOKEN = "8019781527:AAFM9My4_fxzX4e94Us8H2DgQmcNa5m2dSs"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button that opens the web app."""
    await update.message.reply_text(
        "Welcome to TelegramGift! 🎁\n\n"
        "Here you can send beautiful gifts to your friends and loved ones. "
        "Click the button below to open our gift shop:",
        reply_markup={
            "inline_keyboard": [[
                {
                    "text": "Open Gift Shop 🎁",
                    "web_app": {"url": "https://matthewaura444.github.io/123123/public/telegram-app.html"}
                }
            ]]
        }
    )

async def web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the web app data."""
    data = update.effective_message.web_app_data.data
    await update.message.reply_text(
        f"Thank you for your selection! 🎁\n\n"
        f"Your gift data: {data}\n\n"
        f"We'll process your order shortly."
    )

def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token
    application = Application.builder().token(TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_data))

    # Start the Bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 