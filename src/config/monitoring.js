const Sentry = require('@sentry/node');
const logger = require('./logger');

// Инициализация Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: require('../app') }),
    new Sentry.Integrations.Mongo(),
    new Sentry.Integrations.Redis()
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0
});

// Метрики приложения
const metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    latency: []
  },
  websocket: {
    connections: 0,
    messages: 0,
    errors: 0
  },
  database: {
    queries: 0,
    errors: 0,
    latency: []
  },
  cache: {
    hits: 0,
    misses: 0,
    errors: 0
  },
  queue: {
    jobs: 0,
    completed: 0,
    failed: 0,
    latency: []
  }
};

// Функции для обновления метрик
const updateRequestMetrics = (success, latency) => {
  metrics.requests.total++;
  if (success) {
    metrics.requests.success++;
  } else {
    metrics.requests.error++;
  }
  metrics.requests.latency.push(latency);
};

const updateWebSocketMetrics = (type, error = false) => {
  if (type === 'connection') {
    metrics.websocket.connections++;
  } else if (type === 'message') {
    metrics.websocket.messages++;
  } else if (type === 'error') {
    metrics.websocket.errors++;
  }
};

const updateDatabaseMetrics = (success, latency) => {
  metrics.database.queries++;
  if (!success) {
    metrics.database.errors++;
  }
  metrics.database.latency.push(latency);
};

const updateCacheMetrics = (hit) => {
  if (hit) {
    metrics.cache.hits++;
  } else {
    metrics.cache.misses++;
  }
};

const updateQueueMetrics = (success, latency) => {
  metrics.queue.jobs++;
  if (success) {
    metrics.queue.completed++;
  } else {
    metrics.queue.failed++;
  }
  metrics.queue.latency.push(latency);
};

// Функции для получения статистики
const getRequestStats = () => {
  const avgLatency = metrics.requests.latency.reduce((a, b) => a + b, 0) / metrics.requests.latency.length;
  return {
    total: metrics.requests.total,
    success: metrics.requests.success,
    error: metrics.requests.error,
    successRate: (metrics.requests.success / metrics.requests.total) * 100,
    avgLatency
  };
};

const getWebSocketStats = () => {
  return {
    connections: metrics.websocket.connections,
    messages: metrics.websocket.messages,
    errors: metrics.websocket.errors,
    errorRate: (metrics.websocket.errors / metrics.websocket.messages) * 100
  };
};

const getDatabaseStats = () => {
  const avgLatency = metrics.database.latency.reduce((a, b) => a + b, 0) / metrics.database.latency.length;
  return {
    queries: metrics.database.queries,
    errors: metrics.database.errors,
    errorRate: (metrics.database.errors / metrics.database.queries) * 100,
    avgLatency
  };
};

const getCacheStats = () => {
  const total = metrics.cache.hits + metrics.cache.misses;
  return {
    hits: metrics.cache.hits,
    misses: metrics.cache.misses,
    hitRate: (metrics.cache.hits / total) * 100
  };
};

const getQueueStats = () => {
  const avgLatency = metrics.queue.latency.reduce((a, b) => a + b, 0) / metrics.queue.latency.length;
  return {
    jobs: metrics.queue.jobs,
    completed: metrics.queue.completed,
    failed: metrics.queue.failed,
    successRate: (metrics.queue.completed / metrics.queue.jobs) * 100,
    avgLatency
  };
};

// Функция для получения всех метрик
const getAllMetrics = () => {
  return {
    requests: getRequestStats(),
    websocket: getWebSocketStats(),
    database: getDatabaseStats(),
    cache: getCacheStats(),
    queue: getQueueStats()
  };
};

// Функция для сброса метрик
const resetMetrics = () => {
  Object.keys(metrics).forEach(key => {
    if (Array.isArray(metrics[key].latency)) {
      metrics[key].latency = [];
    }
  });
};

module.exports = {
  Sentry,
  updateRequestMetrics,
  updateWebSocketMetrics,
  updateDatabaseMetrics,
  updateCacheMetrics,
  updateQueueMetrics,
  getAllMetrics,
  resetMetrics
}; 