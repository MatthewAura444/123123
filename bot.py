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
user_reviews = {}  # Хранение отзывов пользователей
user_stats = {}  # Хранение статистики пользователей

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button that opens the web app."""
    user_id = update.effective_user.id
    if user_id not in user_gifts:
        user_gifts[user_id] = []
    if user_id not in user_reviews:
        user_reviews[user_id] = []
    if user_id not in user_stats:
        user_stats[user_id] = {
            'gifts_sold': 0,
            'gifts_bought': 0,
            'gifts_for_sale': 0,
            'total_sales_amount': 0,
            'total_purchases_amount': 0,
            'rating': 5.0,
            'total_reviews': 0
        }
    
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

        if data.get('action') == 'delete_gift':
            # Обработка удаления подарка
            gift_id = data.get('gift_id')
            gift = gifts.get(gift_id)
            
            if not gift:
                await update.message.reply_text("❌ Error: Gift not found.")
                return

            if gift['seller']['id'] != user_id:
                await update.message.reply_text("❌ Error: You can only delete your own gifts.")
                return

            # Удаляем подарок из всех списков
            if gift_id in gifts:
                del gifts[gift_id]
            if user_id in user_gifts and gift_id in user_gifts[user_id]:
                user_gifts[user_id].remove(gift_id)
            
            # Обновляем статистику
            user_stats[user_id]['gifts_for_sale'] -= 1

            await update.message.reply_text(
                f"✅ Gift '{gift['name']}' has been successfully deleted from your profile."
            )
            return

        if data.get('action') == 'get_stats':
            # Получаем статистику пользователя
            user_gift_ids = user_gifts.get(user_id, [])
            stats = user_stats.get(user_id, {
                'gifts_sold': 0,
                'gifts_bought': 0,
                'gifts_for_sale': 0,
                'total_sales_amount': 0,
                'total_purchases_amount': 0,
                'rating': 5.0,
                'total_reviews': 0
            })
            
            # Подсчитываем количество подарков на продаже
            gifts_for_sale = sum(1 for gift_id in user_gift_ids if gift_id in gifts)
            stats['gifts_for_sale'] = gifts_for_sale
            
            # Отправляем статистику обратно в веб-приложение
            await update.message.reply_text(
                json.dumps({
                    'action': 'stats_update',
                    'total_gifts': len(user_gift_ids),
                    'gifts_sent': stats['gifts_sold'],
                    'gifts_received': stats['gifts_bought'],
                    'gifts_for_sale': stats['gifts_for_sale'],
                    'total_sales_amount': stats['total_sales_amount'],
                    'total_purchases_amount': stats['total_purchases_amount'],
                    'rating': stats['rating'],
                    'total_reviews': stats['total_reviews']
                })
            )
            return

        if data.get('action') == 'create_gift':
            # Create new gift
            gift_id = len(gifts) + 1
            gift_price = float(data.get('price', 0))
            gifts[gift_id] = {
                'id': gift_id,
                'name': data.get('name'),
                'model': data.get('model'),
                'background': data.get('background'),
                'pattern': data.get('pattern'),
                'price': gift_price,
                'description': data.get('description'),
                'seller': {
                    'id': user_id,
                    'name': user.first_name + ' ' + (user.last_name or ''),
                    'username': user.username or '',
                    'rating': user_stats[user_id]['rating']
                }
            }

            # Добавляем подарок в список подарков пользователя
            if user_id not in user_gifts:
                user_gifts[user_id] = []
            user_gifts[user_id].append(gift_id)

            # Обновляем статистику
            user_stats[user_id]['gifts_for_sale'] += 1

            await update.message.reply_text(
                f"🎉 Your gift '{data.get('name')}' has been created successfully!\n\n"
                f"Price: {gift_price} TON\n"
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

            gift_price = float(gift['price'])

            # Добавляем подарок в список подарков покупателя
            buyer_id = user_id
            if buyer_id not in user_gifts:
                user_gifts[buyer_id] = []
            user_gifts[buyer_id].append(gift_id)

            # Обновляем статистику
            user_stats[buyer_id]['gifts_bought'] += 1
            user_stats[buyer_id]['total_purchases_amount'] += gift_price
            user_stats[gift['seller']['id']]['gifts_sold'] += 1
            user_stats[gift['seller']['id']]['total_sales_amount'] += gift_price
            user_stats[gift['seller']['id']]['gifts_for_sale'] -= 1

            # Удаляем подарок из списка продавца
            seller_id = gift['seller']['id']
            if seller_id in user_gifts and gift_id in user_gifts[seller_id]:
                user_gifts[seller_id].remove(gift_id)

            # Notify seller
            await context.bot.send_message(
                chat_id=seller_id,
                text=f"🎁 New purchase!\n\n"
                     f"Someone bought your gift '{gift['name']}' for {gift_price} TON.\n"
                     f"Please check your TON wallet for the payment."
            )

            # Notify buyer
            await update.message.reply_text(
                f"🎉 Thank you for your purchase!\n\n"
                f"Gift: {gift['name']}\n"
                f"Price: {gift_price} TON\n"
                f"Seller: {gift['seller']['name']}\n\n"
                f"The payment has been processed successfully.\n\n"
                f"Would you like to leave a review for the seller?",
                reply_markup={
                    "inline_keyboard": [[
                        {
                            "text": "Leave Review ⭐️",
                            "callback_data": f"review_{seller_id}_{gift_id}"
                        }
                    ]]
                }
            )

            # Remove gift from available gifts
            del gifts[gift_id]

        elif data.get('action') == 'leave_review':
            # Обработка отзыва
            seller_id = data.get('seller_id')
            gift_id = data.get('gift_id')
            rating = data.get('rating')
            comment = data.get('comment')

            if seller_id not in user_reviews:
                user_reviews[seller_id] = []
            
            user_reviews[seller_id].append({
                'from_user_id': user_id,
                'from_user_name': user.first_name + ' ' + (user.last_name or ''),
                'gift_id': gift_id,
                'rating': rating,
                'comment': comment,
                'date': data.get('date')
            })

            # Обновляем рейтинг продавца
            reviews = user_reviews[seller_id]
            total_rating = sum(review['rating'] for review in reviews)
            user_stats[seller_id]['rating'] = round(total_rating / len(reviews), 1)
            user_stats[seller_id]['total_reviews'] = len(reviews)

            await update.message.reply_text(
                f"⭐️ Thank you for your review!\n\n"
                f"Rating: {rating}/5\n"
                f"Comment: {comment}\n\n"
                f"Your review has been added to the seller's profile."
            )

        elif data.get('action') == 'get_user_profile':
            # Получение профиля пользователя
            target_user_id = data.get('user_id')
            target_user = await context.bot.get_chat(target_user_id)
            
            stats = user_stats.get(target_user_id, {
                'gifts_sold': 0,
                'gifts_bought': 0,
                'gifts_for_sale': 0,
                'total_sales_amount': 0,
                'total_purchases_amount': 0,
                'rating': 5.0,
                'total_reviews': 0
            })
            
            reviews = user_reviews.get(target_user_id, [])
            
            await update.message.reply_text(
                json.dumps({
                    'action': 'profile_update',
                    'user': {
                        'id': target_user_id,
                        'name': target_user.first_name + ' ' + (target_user.last_name or ''),
                        'username': target_user.username or '',
                        'stats': stats,
                        'reviews': reviews
                    }
                })
            )

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
            f"Status: Available\n"
            f"ID: {gift['id']}\n\n"
        )

    message += "\nTo delete a gift, use the command:\n"
    message += "/delete_gift <gift_id>"

    await update.message.reply_text(message)

async def gift_count(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show the number of gifts the user has."""
    user_id = update.effective_user.id
    gift_count = len(user_gifts.get(user_id, []))
    
    await update.message.reply_text(
        f"🎁 You currently have {gift_count} gift(s) in your collection!"
    )

async def my_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show user's profile with stats and reviews."""
    user_id = update.effective_user.id
    user = update.effective_user
    stats = user_stats.get(user_id, {
        'gifts_sold': 0,
        'gifts_bought': 0,
        'gifts_for_sale': 0,
        'total_sales_amount': 0,
        'total_purchases_amount': 0,
        'rating': 5.0,
        'total_reviews': 0
    })
    reviews = user_reviews.get(user_id, [])

    message = f"👤 Your Profile:\n\n"
    message += f"Name: {user.first_name} {user.last_name or ''}\n"
    message += f"Username: @{user.username or 'None'}\n\n"
    message += f"📊 Statistics:\n"
    message += f"Gifts Sold: {stats['gifts_sold']}\n"
    message += f"Gifts Bought: {stats['gifts_bought']}\n"
    message += f"Gifts for Sale: {stats['gifts_for_sale']}\n"
    message += f"Total Sales: {stats['total_sales_amount']} TON\n"
    message += f"Total Purchases: {stats['total_purchases_amount']} TON\n"
    message += f"Rating: {stats['rating']} ⭐️\n"
    message += f"Total Reviews: {stats['total_reviews']}\n\n"

    if reviews:
        message += "📝 Recent Reviews:\n"
        for review in reviews[-3:]:  # Показываем последние 3 отзыва
            message += f"From: {review['from_user_name']}\n"
            message += f"Rating: {review['rating']} ⭐️\n"
            message += f"Comment: {review['comment']}\n"
            message += f"Date: {review['date']}\n\n"

    await update.message.reply_text(message)

async def delete_gift(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Delete a gift by ID."""
    try:
        gift_id = int(context.args[0])
        user_id = update.effective_user.id
        gift = gifts.get(gift_id)
        
        if not gift:
            await update.message.reply_text("❌ Error: Gift not found.")
            return

        if gift['seller']['id'] != user_id:
            await update.message.reply_text("❌ Error: You can only delete your own gifts.")
            return

        # Удаляем подарок из всех списков
        del gifts[gift_id]
        if user_id in user_gifts and gift_id in user_gifts[user_id]:
            user_gifts[user_id].remove(gift_id)
        
        # Обновляем статистику
        user_stats[user_id]['gifts_for_sale'] -= 1

        await update.message.reply_text(
            f"✅ Gift '{gift['name']}' has been successfully deleted from your profile."
        )
    except (IndexError, ValueError):
        await update.message.reply_text(
            "❌ Error: Please provide a valid gift ID.\n"
            "Usage: /delete_gift <gift_id>"
        )

def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token
    application = Application.builder().token(TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("my_gifts", my_gifts))
    application.add_handler(CommandHandler("gift_count", gift_count))
    application.add_handler(CommandHandler("my_profile", my_profile))
    application.add_handler(CommandHandler("delete_gift", delete_gift))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_data))

    # Start the Bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 