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
TOKEN = "8019781527:AAFM9My4_fxzX4e94Us8H2DgQmcNa5m2dSs"

# Комиссия и TON кошелек
COMMISSION_RATE = 0.02  # 2% комиссия
TON_WALLET = "UQASbk4JxjCjgU6Hj3mdW9iPiF-csOsPBLhLhEYoAQdt8vwY"

# Store orders data
orders = {}
user_orders = {}  # Хранение заказов пользователей
user_stats = {}  # Хранение статистики пользователей

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button that opens the web app."""
    user_id = update.effective_user.id
    if user_id not in user_orders:
        user_orders[user_id] = []
    if user_id not in user_stats:
        user_stats[user_id] = {
            'orders_made': 0,
            'total_spent': 0,
            'stars_bought': 0
        }
    
    await update.message.reply_text(
        "Welcome to Telegram Stars Shop! ⭐️\n\n"
        "Here you can buy Telegram Stars at the best price.\n"
        "Click the button below to open our shop:",
        reply_markup={
            "inline_keyboard": [[
                {
                    "text": "Buy Stars ⭐️",
                    "web_app": {"url": "https://matthewaura444.github.io/123123/public/index.html"}
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

        if data.get('action') == 'buy_stars':
            # Обработка покупки звезд
            amount = int(data.get('amount', 0))
            price_per_star = float(data.get('price_per_star', 0))
            total_price = amount * price_per_star
            commission = total_price * COMMISSION_RATE
            final_price = total_price + commission

            # Создаем новый заказ
            order_id = len(orders) + 1
            orders[order_id] = {
                'id': order_id,
                'user_id': user_id,
                'amount': amount,
                'price_per_star': price_per_star,
                'total_price': total_price,
                'commission': commission,
                'final_price': final_price,
                'status': 'pending',
                'ton_wallet': TON_WALLET
            }

            # Добавляем заказ в список заказов пользователя
            if user_id not in user_orders:
                user_orders[user_id] = []
            user_orders[user_id].append(order_id)

            # Отправляем информацию о заказе пользователю
            await update.message.reply_text(
                f"🛒 Your Order #{order_id}:\n\n"
                f"Amount: {amount} Stars\n"
                f"Price per Star: {price_per_star} TON\n"
                f"Total Price: {total_price} TON\n"
                f"Commission (2%): {commission} TON\n"
                f"Final Price: {final_price} TON\n\n"
                f"💳 Payment Details:\n"
                f"Please send exactly {final_price} TON to this wallet:\n"
                f"`{TON_WALLET}`\n\n"
                f"⚠️ Important:\n"
                f"• Send exactly {final_price} TON\n"
                f"• Use only TON network\n"
                f"• Don't send any other tokens\n"
                f"• Keep the transaction hash\n\n"
                f"After sending, click the button below to confirm your payment:",
                reply_markup={
                    "inline_keyboard": [[
                        {
                            "text": "Confirm Payment ✅",
                            "callback_data": f"confirm_payment_{order_id}"
                        }
                    ]]
                },
                parse_mode='Markdown'
            )

        elif data.get('action') == 'get_stats':
            # Получаем статистику пользователя
            stats = user_stats.get(user_id, {
                'orders_made': 0,
                'total_spent': 0,
                'stars_bought': 0
            })
            
            # Отправляем статистику обратно в веб-приложение
            await update.message.reply_text(
                json.dumps({
                    'action': 'stats_update',
                    'orders_made': stats['orders_made'],
                    'total_spent': stats['total_spent'],
                    'stars_bought': stats['stars_bought']
                })
            )

    except Exception as e:
        logger.error(f"Error processing web app data: {e}")
        await update.message.reply_text(
            "❌ An error occurred while processing your request. Please try again later."
        )

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
            await query.message.reply_text("❌ Error: Order not found.")
            return
            
        if order['status'] != 'pending':
            await query.message.reply_text("❌ This order has already been processed.")
            return
            
        # Получаем информацию о пользователе
        user = await context.bot.get_chat(order['user_id'])
        
        # Отправляем Stars пользователю
        try:
            await context.bot.send_message(
                chat_id=order['user_id'],
                text=f"🎉 Your Stars have been sent!\n\n"
                     f"Amount: {order['amount']} Stars\n"
                     f"Order ID: #{order['id']}\n\n"
                     f"Thank you for your purchase! ⭐️"
            )
            
            # Обновляем статус заказа
            order['status'] = 'completed'
            
            # Обновляем статистику пользователя
            user_stats[order['user_id']]['orders_made'] += 1
            user_stats[order['user_id']]['total_spent'] += order['final_price']
            user_stats[order['user_id']]['stars_bought'] += order['amount']
            
            await query.message.reply_text(
                f"✅ Order #{order_id} completed successfully!\n\n"
                f"Stars have been sent to your account.\n"
                f"Amount: {order['amount']} Stars\n"
                f"Total Price: {order['final_price']} TON"
            )
            
        except Exception as e:
            logger.error(f"Error sending Stars: {e}")
            await query.message.reply_text(
                "❌ Error: Failed to send Stars. Please contact support."
            )
            
    except Exception as e:
        logger.error(f"Error processing payment confirmation: {e}")
        await query.message.reply_text(
            "❌ An error occurred while processing your payment confirmation."
        )

def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token
    application = Application.builder().token(TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("my_orders", my_orders))
    application.add_handler(CommandHandler("my_profile", my_profile))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_data))
    application.add_handler(CallbackQueryHandler(handle_payment_confirmation, pattern="^confirm_payment_"))

    # Start the Bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 