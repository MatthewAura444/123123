const https = require('https');
const fs = require('fs');
const path = require('path');

// Конфигурация для загрузки моделей
const config = {
  baseUrl: 'https://fragment.com/api/models',
  modelsDir: path.join(__dirname, '../public/models'),
  models: {
    'plush-pepe': {
      url: '/plush-pepe',
      scale: 1.0,
      rotation: [0, 0, 0]
    },
    'durov-cap': {
      url: '/durov-cap',
      scale: 1.2,
      rotation: [0, Math.PI / 2, 0]
    },
    'signet-ring': {
      url: '/signet-ring',
      scale: 0.8,
      rotation: [0, Math.PI / 4, 0]
    },
    'eternal-rose': {
      url: '/eternal-rose',
      scale: 1.5,
      rotation: [0, 0, 0]
    },
    'bday-candles': {
      url: '/bday-candles',
      scale: 1.3,
      rotation: [0, 0, 0]
    },
    'berry-boxes': {
      url: '/berry-boxes',
      scale: 1.1,
      rotation: [0, Math.PI / 6, 0]
    },
    'bunny-muffin': {
      url: '/bunny-muffin',
      scale: 1.4,
      rotation: [0, 0, 0]
    },
    'vintage-cigar': {
      url: '/vintage-cigar',
      scale: 0.9,
      rotation: [0, Math.PI / 3, 0]
    },
    'crystal-ball': {
      url: '/crystal-ball',
      scale: 1.6,
      rotation: [0, 0, 0]
    },
    'desk-calendars': {
      url: '/desk-calendars',
      scale: 1.2,
      rotation: [0, Math.PI / 4, 0]
    },
    'cookie-hearts': {
      url: '/cookie-hearts',
      scale: 1.3,
      rotation: [0, 0, 0]
    },
    'flying-brooms': {
      url: '/flying-brooms',
      scale: 1.5,
      rotation: [0, Math.PI / 2, 0]
    },
    'diamond-ring': {
      url: '/diamond-ring',
      scale: 0.7,
      rotation: [0, Math.PI / 4, 0]
    },
    'electric-skull': {
      url: '/electric-skull',
      scale: 1.4,
      rotation: [0, 0, 0]
    },
    'eternal-candle': {
      url: '/eternal-candle',
      scale: 1.2,
      rotation: [0, 0, 0]
    },
    'genie-lamps': {
      url: '/genie-lamps',
      scale: 1.3,
      rotation: [0, Math.PI / 3, 0]
    },
    'ginger-cookies': {
      url: '/ginger-cookies',
      scale: 1.1,
      rotation: [0, 0, 0]
    },
    'hanging-stars': {
      url: '/hanging-stars',
      scale: 1.4,
      rotation: [0, Math.PI / 6, 0]
    }
  }
};

// Функция для загрузки модели
async function downloadModel(modelName, modelConfig) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(config.modelsDir, `${modelName}.glb`);
    const file = fs.createWriteStream(filePath);
    
    https.get(`${config.baseUrl}${modelConfig.url}`, response => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${modelName}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {});
      console.error(`Error downloading ${modelName}:`, err.message);
      reject(err);
    });
  });
}

// Основная функция для загрузки всех моделей
async function downloadAllModels() {
  console.log('Starting model downloads...');
  
  for (const [modelName, modelConfig] of Object.entries(config.models)) {
    try {
      await downloadModel(modelName, modelConfig);
    } catch (error) {
      console.error(`Failed to download ${modelName}:`, error);
    }
  }
  
  console.log('All model downloads completed!');
}

// Запускаем загрузку
downloadAllModels().catch(console.error); 