const mongoose = require('mongoose');
const logger = require('./logger');

// Настройки подключения к MongoDB
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority',
  readPreference: 'secondaryPreferred',
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority' }
};

// Создание URI для подключения
const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGODB_URI}`;

// Подключение к MongoDB
mongoose.connect(uri, options)
  .then(() => {
    logger.info('Подключение к MongoDB установлено');
  })
  .catch((error) => {
    logger.error(`Ошибка подключения к MongoDB: ${error.message}`);
    process.exit(1);
  });

// Обработка событий подключения
mongoose.connection.on('connected', () => {
  logger.info('MongoDB подключена');
});

mongoose.connection.on('error', (error) => {
  logger.error(`Ошибка MongoDB: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB отключена');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB переподключена');
});

// Обработка ошибок процесса
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Соединение с MongoDB закрыто');
    process.exit(0);
  } catch (error) {
    logger.error(`Ошибка при закрытии соединения с MongoDB: ${error.message}`);
    process.exit(1);
  }
});

// Функции для работы с MongoDB
const getConnection = () => {
  return mongoose.connection;
};

const getCollection = (collectionName) => {
  return mongoose.connection.collection(collectionName);
};

const createIndex = async (model, index, options = {}) => {
  try {
    await model.collection.createIndex(index, options);
    logger.info(`Индекс создан для модели ${model.modelName}`);
  } catch (error) {
    logger.error(`Ошибка при создании индекса: ${error.message}`);
    throw error;
  }
};

const dropIndex = async (model, indexName) => {
  try {
    await model.collection.dropIndex(indexName);
    logger.info(`Индекс ${indexName} удален для модели ${model.modelName}`);
  } catch (error) {
    logger.error(`Ошибка при удалении индекса: ${error.message}`);
    throw error;
  }
};

const getIndexes = async (model) => {
  try {
    return await model.collection.indexes();
  } catch (error) {
    logger.error(`Ошибка при получении индексов: ${error.message}`);
    throw error;
  }
};

const getStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      documents: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    };
  } catch (error) {
    logger.error(`Ошибка при получении статистики MongoDB: ${error.message}`);
    throw error;
  }
};

const getCollectionStats = async (collectionName) => {
  try {
    return await mongoose.connection.collection(collectionName).stats();
  } catch (error) {
    logger.error(`Ошибка при получении статистики коллекции: ${error.message}`);
    throw error;
  }
};

const optimizeCollection = async (collectionName) => {
  try {
    await mongoose.connection.collection(collectionName).compact();
    logger.info(`Коллекция ${collectionName} оптимизирована`);
  } catch (error) {
    logger.error(`Ошибка при оптимизации коллекции: ${error.message}`);
    throw error;
  }
};

module.exports = {
  mongoose,
  getConnection,
  getCollection,
  createIndex,
  dropIndex,
  getIndexes,
  getStats,
  getCollectionStats,
  optimizeCollection
}; 