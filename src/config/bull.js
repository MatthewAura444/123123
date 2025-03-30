const Queue = require('bull');
const logger = require('./logger');

const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
};

// Очередь для обработки изображений
const imageQueue = new Queue('image-processing', redisConfig);

// Очередь для обработки 3D моделей
const modelQueue = new Queue('model-processing', redisConfig);

// Очередь для отправки уведомлений
const notificationQueue = new Queue('notifications', redisConfig);

// Обработка ошибок очередей
const handleQueueError = (error, queueName) => {
  logger.error(`Queue ${queueName} error: ${error.message}`);
};

// Обработка завершения очередей
const handleQueueCompleted = (job, queueName) => {
  logger.info(`Queue ${queueName} job ${job.id} completed`);
};

// Инициализация очередей
const initQueues = () => {
  // Обработка ошибок
  imageQueue.on('error', (error) => handleQueueError(error, 'image-processing'));
  modelQueue.on('error', (error) => handleQueueError(error, 'model-processing'));
  notificationQueue.on('error', (error) => handleQueueError(error, 'notifications'));

  // Обработка завершения
  imageQueue.on('completed', (job) => handleQueueCompleted(job, 'image-processing'));
  modelQueue.on('completed', (job) => handleQueueCompleted(job, 'model-processing'));
  notificationQueue.on('completed', (job) => handleQueueCompleted(job, 'notifications'));

  logger.info('Bull queues initialized successfully');
};

// Добавление задачи в очередь обработки изображений
const addImageJob = async (data) => {
  try {
    const job = await imageQueue.add(data);
    logger.info(`Image processing job ${job.id} added to queue`);
    return job;
  } catch (error) {
    logger.error(`Error adding image job to queue: ${error.message}`);
    throw error;
  }
};

// Добавление задачи в очередь обработки 3D моделей
const addModelJob = async (data) => {
  try {
    const job = await modelQueue.add(data);
    logger.info(`Model processing job ${job.id} added to queue`);
    return job;
  } catch (error) {
    logger.error(`Error adding model job to queue: ${error.message}`);
    throw error;
  }
};

// Добавление задачи в очередь уведомлений
const addNotificationJob = async (data) => {
  try {
    const job = await notificationQueue.add(data);
    logger.info(`Notification job ${job.id} added to queue`);
    return job;
  } catch (error) {
    logger.error(`Error adding notification job to queue: ${error.message}`);
    throw error;
  }
};

module.exports = {
  redisConfig,
  imageQueue,
  modelQueue,
  notificationQueue,
  initQueues,
  addImageJob,
  addModelJob,
  addNotificationJob
}; 