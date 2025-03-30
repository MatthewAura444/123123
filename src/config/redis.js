const Redis = require('ioredis');
const logger = require('./logger');

// Создание клиента Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Обработка событий Redis
redis.on('connect', () => {
  logger.info('Подключение к Redis установлено');
});

redis.on('error', (error) => {
  logger.error(`Ошибка Redis: ${error.message}`);
});

redis.on('reconnecting', () => {
  logger.warn('Переподключение к Redis...');
});

redis.on('close', () => {
  logger.warn('Соединение с Redis закрыто');
});

// Функции для работы с кэшем
const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Ошибка при получении кэша: ${error.message}`);
    return null;
  }
};

const setCache = async (key, value, expiration = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', expiration);
    return true;
  } catch (error) {
    logger.error(`Ошибка при установке кэша: ${error.message}`);
    return false;
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error(`Ошибка при удалении кэша: ${error.message}`);
    return false;
  }
};

const clearCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    return true;
  } catch (error) {
    logger.error(`Ошибка при очистке кэша: ${error.message}`);
    return false;
  }
};

// Функции для работы с сессиями
const getSession = async (sessionId) => {
  try {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Ошибка при получении сессии: ${error.message}`);
    return null;
  }
};

const setSession = async (sessionId, data, expiration = 86400) => {
  try {
    await redis.set(`session:${sessionId}`, JSON.stringify(data), 'EX', expiration);
    return true;
  } catch (error) {
    logger.error(`Ошибка при установке сессии: ${error.message}`);
    return false;
  }
};

const deleteSession = async (sessionId) => {
  try {
    await redis.del(`session:${sessionId}`);
    return true;
  } catch (error) {
    logger.error(`Ошибка при удалении сессии: ${error.message}`);
    return false;
  }
};

// Функции для работы с блокировками
const acquireLock = async (lockKey, expiration = 30) => {
  try {
    const result = await redis.set(lockKey, '1', 'NX', 'EX', expiration);
    return result === 'OK';
  } catch (error) {
    logger.error(`Ошибка при получении блокировки: ${error.message}`);
    return false;
  }
};

const releaseLock = async (lockKey) => {
  try {
    await redis.del(lockKey);
    return true;
  } catch (error) {
    logger.error(`Ошибка при освобождении блокировки: ${error.message}`);
    return false;
  }
};

// Функции для работы с очередями
const addToQueue = async (queueKey, data) => {
  try {
    await redis.rpush(queueKey, JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error(`Ошибка при добавлении в очередь: ${error.message}`);
    return false;
  }
};

const getFromQueue = async (queueKey) => {
  try {
    const data = await redis.lpop(queueKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Ошибка при получении из очереди: ${error.message}`);
    return null;
  }
};

const getQueueLength = async (queueKey) => {
  try {
    return await redis.llen(queueKey);
  } catch (error) {
    logger.error(`Ошибка при получении длины очереди: ${error.message}`);
    return 0;
  }
};

// Функции для работы с счетчиками
const incrementCounter = async (counterKey) => {
  try {
    return await redis.incr(counterKey);
  } catch (error) {
    logger.error(`Ошибка при увеличении счетчика: ${error.message}`);
    return null;
  }
};

const decrementCounter = async (counterKey) => {
  try {
    return await redis.decr(counterKey);
  } catch (error) {
    logger.error(`Ошибка при уменьшении счетчика: ${error.message}`);
    return null;
  }
};

const getCounter = async (counterKey) => {
  try {
    return await redis.get(counterKey);
  } catch (error) {
    logger.error(`Ошибка при получении значения счетчика: ${error.message}`);
    return null;
  }
};

module.exports = {
  redis,
  getCache,
  setCache,
  deleteCache,
  clearCache,
  getSession,
  setSession,
  deleteSession,
  acquireLock,
  releaseLock,
  addToQueue,
  getFromQueue,
  getQueueLength,
  incrementCounter,
  decrementCounter,
  getCounter
}; 