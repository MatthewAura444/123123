module.exports = {
  // Корневая директория проекта
  rootDir: process.cwd(),

  // Директории для поиска тестов
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],

  // Директории для игнорирования
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Файлы для игнорирования
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ],

  // Расширения файлов
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],

  // Преобразование файлов
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.(css|less|scss|sass)$': 'jest-transform-css'
  },

  // Настройки для тестового окружения
  testEnvironment: 'node',

  // Настройки для покрытия кода
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Настройки для моков
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },

  // Настройки для таймаутов
  testTimeout: 10000,

  // Настройки для параллельного выполнения
  maxWorkers: '50%',

  // Настройки для отображения результатов
  verbose: true,
  silent: false,

  // Настройки для кэширования
  cache: true,
  cacheDirectory: '.jest-cache',

  // Настройки для автоматического очищения
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Настройки для глобальных переменных
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  // Настройки для тестовых хуков
  setupFiles: [
    '<rootDir>/src/config/jest.setup.js'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/config/jest.setup.afterEnv.js'
  ],

  // Настройки для тестовых трансформаций
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel|@jest|@typescript-eslint)/)'
  ],

  // Настройки для тестовых репортеров
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],

  // Настройки для тестовых утилит
  testRunner: 'jest-circus/runner',

  // Настройки для тестовых плагинов
  plugins: [
    'jest-html-reporter'
  ],

  // Настройки для тестовых расширений
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Настройки для тестовых модулей
  moduleDirectories: [
    'node_modules',
    'src'
  ],

  // Настройки для тестовых файлов
  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // Настройки для тестовых данных
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Настройки для тестовых результатов
  testResultsProcessor: 'jest-sonar-reporter',

  // Настройки для тестовых уведомлений
  notify: true,
  notifyMode: 'always'
}; 