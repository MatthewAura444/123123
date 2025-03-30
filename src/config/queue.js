const Queue = require('bull');
const logger = require('./logger');

// Создаем очереди для разных типов задач
const emailQueue = new Queue('email', process.env.REDIS_URL);
const notificationQueue = new Queue('notification', process.env.REDIS_URL);
const processingQueue = new Queue('processing', process.env.REDIS_URL);

// Обработка ошибок для всех очередей
[emailQueue, notificationQueue, processingQueue].forEach(queue => {
  queue.on('error', error => {
    logger.error(`Ошибка в очереди ${queue.name}: ${error.message}`);
  });

  queue.on('failed', (job, error) => {
    logger.error(`Задача ${job.id} в очереди ${queue.name} не выполнена: ${error.message}`);
  });
});

// Обработчики для очереди email
emailQueue.process('send-email', async (job) => {
  try {
    const { to, subject, text, html } = job.data;
    // Здесь будет логика отправки email
    logger.info(`Email отправлен на ${to}`);
  } catch (error) {
    logger.error(`Ошибка при отправке email: ${error.message}`);
    throw error;
  }
});

// Обработчики для очереди уведомлений
notificationQueue.process('send-notification', async (job) => {
  try {
    const { userId, type, data } = job.data;
    // Здесь будет логика отправки уведомлений
    logger.info(`Уведомление отправлено пользователю ${userId}`);
  } catch (error) {
    logger.error(`Ошибка при отправке уведомления: ${error.message}`);
    throw error;
  }
});

// Обработчики для очереди обработки
processingQueue.process('process-gift', async (job) => {
  try {
    const { giftId } = job.data;
    // Здесь будет логика обработки подарка
    logger.info(`Подарок ${giftId} обработан`);
  } catch (error) {
    logger.error(`Ошибка при обработке подарка: ${error.message}`);
    throw error;
  }
});

// Функции для добавления задач в очереди
const addEmailTask = async (data) => {
  try {
    const job = await emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    logger.info(`Задача отправки email добавлена: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Ошибка при добавлении задачи в очередь email: ${error.message}`);
    throw error;
  }
};

const addNotificationTask = async (data) => {
  try {
    const job = await notificationQueue.add('send-notification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    logger.info(`Задача отправки уведомления добавлена: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Ошибка при добавлении задачи в очередь уведомлений: ${error.message}`);
    throw error;
  }
};

const addProcessingTask = async (data) => {
  try {
    const job = await processingQueue.add('process-gift', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    logger.info(`Задача обработки подарка добавлена: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Ошибка при добавлении задачи в очередь обработки: ${error.message}`);
    throw error;
  }
};

module.exports = {
  emailQueue,
  notificationQueue,
  processingQueue,
  addEmailTask,
  addNotificationTask,
  addProcessingTask
}; 