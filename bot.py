import os
import json
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get bot token from environment variable
TOKEN = "8019781527:AAFM9My4_fxzX4e94Us8H2DgQmcNa5m2dSs"

# Store gifts data (in production, use a database)
gifts = {}
user_gifts = {}  # Хранение подарков пользователей

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button that opens the web app."""
    user_id = update.effective_user.id
    if user_id not in user_gifts:
        user_gifts[user_id] = []
    
    await update.message.reply_text(
        "Welcome to TelegramGift! 🎁\n\n"
        "Here you can create and sell beautiful gifts, or buy them from other users. "
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
    try:
        data = json.loads(update.effective_message.web_app_data.data)
        user = update.effective_user
        user_id = user.id

        if data.get('action') == 'get_stats':
            # Получаем статистику пользователя
            user_gift_ids = user_gifts.get(user_id, [])
            total_gifts = len(user_gift_ids)
            
            # Отправляем статистику обратно в веб-приложение
            await update.message.reply_text(
                json.dumps({
                    'action': 'stats_update',
                    'total_gifts': total_gifts,
                    'gifts_sent': sum(1 for gift_id in user_gift_ids if gifts.get(gift_id, {}).get('seller', {}).get('id') == user_id),
                    'gifts_received': sum(1 for gift_id in user_gift_ids if gifts.get(gift_id, {}).get('seller', {}).get('id') != user_id)
                })
            )
            return

        if data.get('action') == 'create_gift':
            # Create new gift
            gift_id = len(gifts) + 1
            gifts[gift_id] = {
                'id': gift_id,
                'name': data.get('name'),
                'model': data.get('model'),
                'background': data.get('background'),
                'pattern': data.get('pattern'),
                'price': data.get('price'),
                'description': data.get('description'),
                'seller': {
                    'id': user_id,
                    'name': user.first_name + ' ' + (user.last_name or ''),
                    'username': user.username or '',
                    'rating': 5.0
                }
            }

            # Добавляем подарок в список подарков пользователя
            if user_id not in user_gifts:
                user_gifts[user_id] = []
            user_gifts[user_id].append(gift_id)

            await update.message.reply_text(
                f"🎉 Your gift '{data.get('name')}' has been created successfully!\n\n"
                f"Price: {data.get('price')} TON\n"
                f"Model: {data.get('model')}\n"
                f"Background: {data.get('background')}\n"
                f"Pattern: {data.get('pattern')}\n\n"
                f"Your gift is now available in the shop!"
            )

        elif data.get('action') == 'buy_gift':
            # Process gift purchase
            gift_id = data.get('gift_id')
            gift = gifts.get(gift_id)
            
            if not gift:
                await update.message.reply_text("❌ Error: Gift not found.")
                return

            # Добавляем подарок в список подарков покупателя
            buyer_id = user_id
            if buyer_id not in user_gifts:
                user_gifts[buyer_id] = []
            user_gifts[buyer_id].append(gift_id)

            # Удаляем подарок из списка продавца
            seller_id = gift['seller']['id']
            if seller_id in user_gifts and gift_id in user_gifts[seller_id]:
                user_gifts[seller_id].remove(gift_id)

            # Notify seller
            await context.bot.send_message(
                chat_id=seller_id,
                text=f"🎁 New purchase!\n\n"
                     f"Someone bought your gift '{gift['name']}' for {gift['price']} TON.\n"
                     f"Please check your TON wallet for the payment."
            )

            # Notify buyer
            await update.message.reply_text(
                f"🎉 Thank you for your purchase!\n\n"
                f"Gift: {gift['name']}\n"
                f"Price: {gift['price']} TON\n"
                f"Seller: {gift['seller']['name']}\n\n"
                f"The payment has been processed successfully."
            )

            # Remove gift from available gifts
            del gifts[gift_id]

    except Exception as e:
        logger.error(f"Error processing web app data: {e}")
        await update.message.reply_text(
            "❌ An error occurred while processing your request. Please try again later."
        )

async def my_gifts(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show user's created gifts."""
    user_id = update.effective_user.id
    user_gift_ids = user_gifts.get(user_id, [])
    user_gift_list = [gifts.get(gift_id) for gift_id in user_gift_ids if gift_id in gifts]

    if not user_gift_list:
        await update.message.reply_text(
            "You haven't created any gifts yet.\n"
            "Use the gift shop to create your first gift!"
        )
        return

    message = "🎁 Your Gifts:\n\n"
    for gift in user_gift_list:
        message += (
            f"Name: {gift['name']}\n"
            f"Price: {gift['price']} TON\n"
            f"Model: {gift['model']}\n"
            f"Status: Available\n\n"
        )

    await update.message.reply_text(message)

async def gift_count(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show the number of gifts the user has."""
    user_id = update.effective_user.id
    gift_count = len(user_gifts.get(user_id, []))
    
    await update.message.reply_text(
        f"🎁 You currently have {gift_count} gift(s) in your collection!"
    )

def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token
    application = Application.builder().token(TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("my_gifts", my_gifts))
    application.add_handler(CommandHandler("gift_count", gift_count))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_data))

    # Start the Bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 