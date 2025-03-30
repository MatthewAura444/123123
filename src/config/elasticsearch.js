const { Client } = require('@elastic/elasticsearch');
const logger = require('./logger');

const elasticConfig = {
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  ssl: {
    rejectUnauthorized: false
  },
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true
};

const client = new Client(elasticConfig);

// Проверка подключения
const checkConnection = async () => {
  try {
    const info = await client.info();
    logger.info('Elasticsearch Connected');
    return true;
  } catch (error) {
    logger.error(`Elasticsearch Connection Error: ${error.message}`);
    return false;
  }
};

// Создание индексов
const createIndices = async () => {
  try {
    // Индекс для подарков
    await client.indices.create({
      index: 'gifts',
      body: {
        mappings: {
          properties: {
            name: { type: 'text', analyzer: 'russian' },
            description: { type: 'text', analyzer: 'russian' },
            category: { type: 'keyword' },
            price: { type: 'float' },
            tags: { type: 'keyword' },
            rating: { type: 'float' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    }, { ignore: [400] });

    // Индекс для коллекций
    await client.indices.create({
      index: 'collections',
      body: {
        mappings: {
          properties: {
            name: { type: 'text', analyzer: 'russian' },
            description: { type: 'text', analyzer: 'russian' },
            isPublic: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    }, { ignore: [400] });

    logger.info('Elasticsearch Indices Created');
  } catch (error) {
    logger.error(`Elasticsearch Index Creation Error: ${error.message}`);
  }
};

module.exports = {
  elasticConfig,
  client,
  checkConnection,
  createIndices
}; 