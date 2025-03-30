const TelegramBot = require('node-telegram-bot-api');
const logger = require('./logger');

const botConfig = {
  token: process.env.BOT_TOKEN,
  polling: true,
  filepath: false,
  webHook: {
    port: process.env.BOT_WEBHOOK_PORT || 8443
  }
};

const bot = new TelegramBot(botConfig.token, {
  polling: botConfig.polling
});

// Обработка ошибок бота
bot.on('error', (error) => {
  logger.error(`Telegram Bot Error: ${error.message}`);
});

bot.on('polling_error', (error) => {
  logger.error(`Telegram Bot Polling Error: ${error.message}`);
});

// Обработка успешного запуска
bot.on('webhook_error', (error) => {
  logger.error(`Telegram Bot Webhook Error: ${error.message}`);
});

bot.on('webhook_info', (info) => {
  logger.info(`Telegram Bot Webhook Info: ${JSON.stringify(info)}`);
});

module.exports = {
  botConfig,
  bot
}; 