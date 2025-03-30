const { Client } = require('@elastic/elasticsearch');
const logger = require('./logger');

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  }
});

// Индексы для разных типов данных
const INDICES = {
  GIFTS: 'gifts',
  COLLECTIONS: 'collections',
  USERS: 'users'
};

// Создание индексов при запуске
const createIndices = async () => {
  try {
    for (const index of Object.values(INDICES)) {
      const exists = await client.indices.exists({ index });
      if (!exists) {
        await client.indices.create({ index });
        logger.info(`Индекс ${index} создан`);
      }
    }
  } catch (error) {
    logger.error(`Ошибка при создании индексов: ${error.message}`);
    throw error;
  }
};

// Функции для работы с подарками
const indexGift = async (gift) => {
  try {
    await client.index({
      index: INDICES.GIFTS,
      id: gift._id.toString(),
      body: {
        name: gift.name,
        description: gift.description,
        price: gift.price,
        category: gift.category,
        tags: gift.tags,
        rating: gift.rating,
        reviewsCount: gift.reviews.length,
        createdAt: gift.createdAt,
        updatedAt: gift.updatedAt
      }
    });
    logger.info(`Подарок ${gift._id} проиндексирован`);
  } catch (error) {
    logger.error(`Ошибка при индексации подарка: ${error.message}`);
    throw error;
  }
};

const searchGifts = async (query, filters = {}) => {
  try {
    const { body } = await client.search({
      index: INDICES.GIFTS,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['name^3', 'description^2', 'tags']
                }
              }
            ],
            filter: Object.entries(filters).map(([field, value]) => ({
              term: { [field]: value }
            }))
          }
        },
        sort: [
          { rating: 'desc' },
          { reviewsCount: 'desc' }
        ]
      }
    });
    return body.hits.hits.map(hit => hit._source);
  } catch (error) {
    logger.error(`Ошибка при поиске подарков: ${error.message}`);
    throw error;
  }
};

// Функции для работы с коллекциями
const indexCollection = async (collection) => {
  try {
    await client.index({
      index: INDICES.COLLECTIONS,
      id: collection._id.toString(),
      body: {
        name: collection.name,
        description: collection.description,
        giftsCount: collection.gifts.length,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      }
    });
    logger.info(`Коллекция ${collection._id} проиндексирована`);
  } catch (error) {
    logger.error(`Ошибка при индексации коллекции: ${error.message}`);
    throw error;
  }
};

const searchCollections = async (query) => {
  try {
    const { body } = await client.search({
      index: INDICES.COLLECTIONS,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^3', 'description^2']
          }
        },
        sort: [
          { giftsCount: 'desc' }
        ]
      }
    });
    return body.hits.hits.map(hit => hit._source);
  } catch (error) {
    logger.error(`Ошибка при поиске коллекций: ${error.message}`);
    throw error;
  }
};

// Функции для работы с пользователями
const indexUser = async (user) => {
  try {
    await client.index({
      index: INDICES.USERS,
      id: user._id.toString(),
      body: {
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    logger.info(`Пользователь ${user._id} проиндексирован`);
  } catch (error) {
    logger.error(`Ошибка при индексации пользователя: ${error.message}`);
    throw error;
  }
};

const searchUsers = async (query) => {
  try {
    const { body } = await client.search({
      index: INDICES.USERS,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['username^3', 'email^2']
          }
        }
      }
    });
    return body.hits.hits.map(hit => hit._source);
  } catch (error) {
    logger.error(`Ошибка при поиске пользователей: ${error.message}`);
    throw error;
  }
};

// Удаление документов
const deleteDocument = async (index, id) => {
  try {
    await client.delete({
      index,
      id: id.toString()
    });
    logger.info(`Документ ${id} удален из индекса ${index}`);
  } catch (error) {
    logger.error(`Ошибка при удалении документа: ${error.message}`);
    throw error;
  }
};

module.exports = {
  client,
  INDICES,
  createIndices,
  indexGift,
  searchGifts,
  indexCollection,
  searchCollections,
  indexUser,
  searchUsers,
  deleteDocument
}; 