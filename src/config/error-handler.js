const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Продакшен
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Программные ошибки
      logger.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Что-то пошло не так!'
      });
    }
  }
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Неверные входные данные. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Значение поля ${value} уже существует. Пожалуйста, используйте другое значение!`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Неверный ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Неверный токен. Пожалуйста, войдите снова!', 401);

const handleJWTExpiredError = () => new AppError('Ваш токен истек! Пожалуйста, войдите снова.', 401);

module.exports = {
  AppError,
  errorHandler,
  handleValidationError,
  handleDuplicateFieldsDB,
  handleCastErrorDB,
  handleJWTError,
  handleJWTExpiredError
}; 