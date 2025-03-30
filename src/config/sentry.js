const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const logger = require('./logger');

const sentryConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    new ProfilingIntegration(),
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: require('../index') })
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event:', event);
    }
    return event;
  },
  beforeSendTransaction(event) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Transaction:', event);
    }
    return event;
  }
};

// Инициализация Sentry
const initSentry = () => {
  try {
    Sentry.init(sentryConfig);
    logger.info('Sentry initialized successfully');
  } catch (error) {
    logger.error(`Sentry initialization error: ${error.message}`);
  }
};

// Обработчик ошибок
const errorHandler = (err, req, res, next) => {
  Sentry.captureException(err);
  next(err);
};

// Обработчик запросов
const requestHandler = Sentry.Handlers.requestHandler();

// Обработчик транзакций
const tracingHandler = Sentry.Handlers.tracingHandler();

module.exports = {
  sentryConfig,
  initSentry,
  errorHandler,
  requestHandler,
  tracingHandler
}; 