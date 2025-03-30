require('dotenv').config({ path: '.env.test' });

// Мокаем все внешние зависимости
jest.mock('@sentry/node');
jest.mock('aws-sdk');
jest.mock('bull');
jest.mock('ioredis');
jest.mock('node-telegram-bot-api');
jest.mock('ton-connect');

// Глобальные переменные для тестов
global.testUser = {
  id: 'test-user-id',
  telegramId: '123456789',
  username: 'testuser',
  bio: 'Test bio'
};

global.testGift = {
  id: 'test-gift-id',
  name: 'Test Gift',
  description: 'Test Description',
  price: 100,
  category: 'digital',
  tags: ['test', 'gift']
};

global.testCollection = {
  id: 'test-collection-id',
  name: 'Test Collection',
  description: 'Test Collection Description',
  isPublic: true
};

// Очистка всех моков после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});

// Очистка всех таймеров после каждого теста
afterEach(() => {
  jest.useRealTimers();
});

// Установка таймаута для всех тестов
jest.setTimeout(10000); 