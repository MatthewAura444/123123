const redis = require('./redis').redis;
const logger = require('./logger');

const DEFAULT_EXPIRATION = 3600; // 1 час

const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Ошибка при получении кэша: ${error.message}`);
    return null;
  }
};

const setCache = async (key, value, expiration = DEFAULT_EXPIRATION) => {
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

const cacheMiddleware = (duration = DEFAULT_EXPIRATION) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await getCache(key);
      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Сохраняем оригинальный метод res.json
      const originalJson = res.json;
      res.json = function(data) {
        setCache(key, data, duration);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error(`Ошибка в middleware кэширования: ${error.message}`);
      next();
    }
  };
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCache,
  cacheMiddleware
}; 