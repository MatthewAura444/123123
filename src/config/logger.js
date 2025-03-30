const winston = require('winston');
const path = require('path');

// Форматирование логов
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Создание логгера
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'telegram-gifts-marketplace' },
  transports: [
    // Запись ошибок в файл
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Запись всех логов в файл
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Добавление консольного транспорта в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Создание отдельного логгера для HTTP-запросов
const httpLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'http' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/http.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Создание отдельного логгера для WebSocket
const wsLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'websocket' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/websocket.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Создание отдельного логгера для базы данных
const dbLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'database' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/database.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Создание отдельного логгера для кэша
const cacheLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'cache' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/cache.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Создание отдельного логгера для очередей
const queueLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'queue' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/queue.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Создание отдельного логгера для поиска
const searchLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'search' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/search.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Создание отдельного логгера для мониторинга
const monitoringLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'monitoring' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/monitoring.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Функция для очистки старых логов
const cleanOldLogs = () => {
  const fs = require('fs');
  const logDir = path.join(__dirname, '../../logs');
  
  fs.readdir(logDir, (err, files) => {
    if (err) {
      logger.error(`Ошибка при чтении директории логов: ${err.message}`);
      return;
    }

    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(logDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error(`Ошибка при получении статистики файла ${file}: ${err.message}`);
          return;
        }

        // Удаляем файлы старше 30 дней
        if (now - stats.mtime.getTime() > 30 * 24 * 60 * 60 * 1000) {
          fs.unlink(filePath, err => {
            if (err) {
              logger.error(`Ошибка при удалении файла ${file}: ${err.message}`);
            } else {
              logger.info(`Удален старый лог-файл: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Запуск очистки старых логов каждый день
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);

module.exports = {
  logger,
  httpLogger,
  wsLogger,
  dbLogger,
  cacheLogger,
  queueLogger,
  searchLogger,
  monitoringLogger
}; 