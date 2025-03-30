const jwt = require('jsonwebtoken');
const logger = require('./logger');

// Настройки JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'telegram-gifts-marketplace',
  audience: 'telegram-gifts-marketplace-users'
};

// Функция для создания токена
const createToken = (payload) => {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при создании токена: ${error.message}`);
    throw error;
  }
};

// Функция для проверки токена
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при проверке токена: ${error.message}`);
    throw error;
  }
};

// Функция для декодирования токена
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error(`Ошибка при декодировании токена: ${error.message}`);
    throw error;
  }
};

// Функция для создания refresh токена
const createRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: '7d',
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при создании refresh токена: ${error.message}`);
    throw error;
  }
};

// Функция для проверки refresh токена
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при проверке refresh токена: ${error.message}`);
    throw error;
  }
};

// Функция для создания токена сброса пароля
const createPasswordResetToken = (payload) => {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: '1h',
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при создании токена сброса пароля: ${error.message}`);
    throw error;
  }
};

// Функция для проверки токена сброса пароля
const verifyPasswordResetToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при проверке токена сброса пароля: ${error.message}`);
    throw error;
  }
};

// Функция для создания токена подтверждения email
const createEmailVerificationToken = (payload) => {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: '24h',
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при создании токена подтверждения email: ${error.message}`);
    throw error;
  }
};

// Функция для проверки токена подтверждения email
const verifyEmailVerificationToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    logger.error(`Ошибка при проверке токена подтверждения email: ${error.message}`);
    throw error;
  }
};

// Функция для обновления настроек JWT
const updateJwtConfig = (newConfig) => {
  Object.assign(jwtConfig, newConfig);
  logger.info('Настройки JWT обновлены');
};

// Функция для получения оставшегося времени действия токена
const getTokenExpirationTime = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return decoded.exp * 1000 - Date.now();
  } catch (error) {
    logger.error(`Ошибка при получении времени истечения токена: ${error.message}`);
    return null;
  }
};

// Функция для проверки истечения токена
const isTokenExpired = (token) => {
  try {
    const expirationTime = getTokenExpirationTime(token);
    return expirationTime === null || expirationTime <= 0;
  } catch (error) {
    logger.error(`Ошибка при проверке истечения токена: ${error.message}`);
    return true;
  }
};

module.exports = {
  jwtConfig,
  createToken,
  verifyToken,
  decodeToken,
  createRefreshToken,
  verifyRefreshToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  createEmailVerificationToken,
  verifyEmailVerificationToken,
  updateJwtConfig,
  getTokenExpirationTime,
  isTokenExpired
}; 