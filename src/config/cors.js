const cors = require('cors');
const logger = require('./logger');

// Настройки CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Заблокирован запрос с неразрешенного источника: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Token',
    'X-API-Key'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Создание middleware для CORS
const corsMiddleware = cors(corsOptions);

// Функция для проверки разрешенных источников
const isAllowedOrigin = (origin) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  return !origin || allowedOrigins.includes(origin);
};

// Функция для получения списка разрешенных методов
const getAllowedMethods = () => {
  return corsOptions.methods;
};

// Функция для получения списка разрешенных заголовков
const getAllowedHeaders = () => {
  return corsOptions.allowedHeaders;
};

// Функция для получения списка открытых заголовков
const getExposedHeaders = () => {
  return corsOptions.exposedHeaders;
};

// Функция для проверки поддержки учетных данных
const isCredentialsAllowed = () => {
  return corsOptions.credentials;
};

// Функция для получения максимального времени кэширования preflight запросов
const getMaxAge = () => {
  return corsOptions.maxAge;
};

// Функция для проверки продолжения preflight запросов
const isPreflightContinue = () => {
  return corsOptions.preflightContinue;
};

// Функция для получения статуса успешного preflight запроса
const getOptionsSuccessStatus = () => {
  return corsOptions.optionsSuccessStatus;
};

// Функция для обновления настроек CORS
const updateCorsOptions = (newOptions) => {
  Object.assign(corsOptions, newOptions);
  logger.info('Настройки CORS обновлены');
};

// Функция для добавления разрешенного источника
const addAllowedOrigin = (origin) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  if (!allowedOrigins.includes(origin)) {
    allowedOrigins.push(origin);
    process.env.ALLOWED_ORIGINS = allowedOrigins.join(',');
    logger.info(`Добавлен разрешенный источник: ${origin}`);
  }
};

// Функция для удаления разрешенного источника
const removeAllowedOrigin = (origin) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  const index = allowedOrigins.indexOf(origin);
  if (index > -1) {
    allowedOrigins.splice(index, 1);
    process.env.ALLOWED_ORIGINS = allowedOrigins.join(',');
    logger.info(`Удален разрешенный источник: ${origin}`);
  }
};

// Функция для добавления разрешенного метода
const addAllowedMethod = (method) => {
  if (!corsOptions.methods.includes(method)) {
    corsOptions.methods.push(method);
    logger.info(`Добавлен разрешенный метод: ${method}`);
  }
};

// Функция для удаления разрешенного метода
const removeAllowedMethod = (method) => {
  const index = corsOptions.methods.indexOf(method);
  if (index > -1) {
    corsOptions.methods.splice(index, 1);
    logger.info(`Удален разрешенный метод: ${method}`);
  }
};

// Функция для добавления разрешенного заголовка
const addAllowedHeader = (header) => {
  if (!corsOptions.allowedHeaders.includes(header)) {
    corsOptions.allowedHeaders.push(header);
    logger.info(`Добавлен разрешенный заголовок: ${header}`);
  }
};

// Функция для удаления разрешенного заголовка
const removeAllowedHeader = (header) => {
  const index = corsOptions.allowedHeaders.indexOf(header);
  if (index > -1) {
    corsOptions.allowedHeaders.splice(index, 1);
    logger.info(`Удален разрешенный заголовок: ${header}`);
  }
};

module.exports = {
  corsMiddleware,
  isAllowedOrigin,
  getAllowedMethods,
  getAllowedHeaders,
  getExposedHeaders,
  isCredentialsAllowed,
  getMaxAge,
  isPreflightContinue,
  getOptionsSuccessStatus,
  updateCorsOptions,
  addAllowedOrigin,
  removeAllowedOrigin,
  addAllowedMethod,
  removeAllowedMethod,
  addAllowedHeader,
  removeAllowedHeader
}; 