import os
import json
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup, CallbackQuery
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get bot token from environment variable
TOKEN = "7687296256:AAEnJhFMiWWKAZ0aXQaqQF3pzynVS9Do4OU"  # Используем токен из config.py

# Комиссия и TON кошелек
COMMISSION_RATE = 0.02  # 2% комиссия
TON_WALLET = "UQASbk4JxjCjgU6Hj3mdW9iPiF-csOsPBLhLhEYoAQdt8vwY"

# Store orders data
orders = {}
user_orders = {}  # Хранение заказов пользователей
user_stats = {}  # Хранение статистики пользователей

# Web app URL
WEBAPP_URL = "https://matthewaura444.github.io/123123/index.html"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button that opens a web app."""
    await update.message.reply_text(
        "Добро пожаловать в Stars Market! 🌟\n\n"
        "Здесь вы можете купить Stars для себя или других пользователей.",
        reply_markup={
            "inline_keyboard": [[
                {"text": "Купить Stars ⭐️", "web_app": {"url": WEBAPP_URL}}
            ]]
        }
    )

async def web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle data from web app."""
    data = update.effective_message.web_app_data.data
    await update.message.reply_text(f"Получены данные от веб-приложения: {data}")

async def my_orders(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show user's orders."""
    user_id = update.effective_user.id
    user_order_ids = user_orders.get(user_id, [])
    user_order_list = [orders.get(order_id) for order_id in user_order_ids if order_id in orders]

    if not user_order_list:
        await update.message.reply_text(
            "You haven't made any orders yet.\n"
            "Use the shop to buy your first Stars!"
        )
        return

    message = "🛒 Your Orders:\n\n"
    for order in user_order_list:
        message += (
            f"Order #{order['id']}\n"
            f"Amount: {order['amount']} Stars\n"
            f"Price per Star: {order['price_per_star']} TON\n"
            f"Total Price: {order['total_price']} TON\n"
            f"Commission: {order['commission']} TON\n"
            f"Final Price: {order['final_price']} TON\n"
            f"Status: {order['status']}\n\n"
        )

    await update.message.reply_text(message)

async def my_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show user's profile with stats."""
    user_id = update.effective_user.id
    user = update.effective_user
    stats = user_stats.get(user_id, {
        'orders_made': 0,
        'total_spent': 0,
        'stars_bought': 0
    })

    message = f"👤 Your Profile:\n\n"
    message += f"Name: {user.first_name} {user.last_name or ''}\n"
    message += f"Username: @{user.username or 'None'}\n\n"
    message += f"📊 Statistics:\n"
    message += f"Orders Made: {stats['orders_made']}\n"
    message += f"Total Spent: {stats['total_spent']} TON\n"
    message += f"Stars Bought: {stats['stars_bought']} ⭐️\n"

    await update.message.reply_text(message)

async def handle_payment_confirmation(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle payment confirmation and send Stars."""
    query = update.callback_query
    await query.answer()
    
    try:
        # Получаем order_id из callback_data
        order_id = int(query.data.split('_')[2])
        order = orders.get(order_id)
        
        if not order:
            await query.message.reply_text("Order not found!")
            return
            
        if order['status'] != 'pending':
            await query.message.reply_text("This order has already been processed!")
            return
            
        # Обновляем статус заказа
        order['status'] = 'completed'
        
        # Обновляем статистику пользователя
        user_id = order['user_id']
        if user_id not in user_stats:
            user_stats[user_id] = {
                'orders_made': 0,
                'total_spent': 0,
                'stars_bought': 0
            }
            
        user_stats[user_id]['orders_made'] += 1
        user_stats[user_id]['total_spent'] += order['final_price']
        user_stats[user_id]['stars_bought'] += order['amount']
        
        # Отправляем подтверждение
        await query.message.reply_text(
            f"✅ Payment confirmed!\n\n"
            f"Order #{order_id}\n"
            f"Amount: {order['amount']} Stars\n"
            f"Final Price: {order['final_price']} TON\n\n"
            f"Stars have been sent to the recipient!"
        )
        
    except Exception as e:
        logger.error(f"Error handling payment confirmation: {e}")
        await query.message.reply_text("An error occurred while processing the payment!")

def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token
    application = Application.builder().token(TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("orders", my_orders))
    application.add_handler(CommandHandler("profile", my_profile))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_data))
    application.add_handler(CallbackQueryHandler(handle_payment_confirmation, pattern="^confirm_payment_"))

    # Start the Bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 