const fs = require('fs');
const path = require('path');

// Список всех моделей из main.js
const models = [
  'plush-pepe.glb',
  'durov-cap.glb',
  'signet-ring.glb',
  'eternal-rose.glb',
  'bday-candles.glb',
  'berry-boxes.glb',
  'bunny-muffin.glb',
  'vintage-cigar.glb',
  'crystal-ball.glb',
  'desk-calendars.glb',
  'cookie-hearts.glb',
  'flying-brooms.glb',
  'diamond-ring.glb',
  'electric-skull.glb',
  'eternal-candle.glb',
  'genie-lamps.glb',
  'ginger-cookies.glb',
  'hanging-stars.glb'
];

// Путь к директории с моделями
const modelsDir = path.join(__dirname, '../public/models');

// Создаем директорию, если она не существует
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Копируем базовую модель для каждого подарка
models.forEach(model => {
  const sourcePath = path.join(modelsDir, 'base.glb');
  const targetPath = path.join(modelsDir, model);
  
  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Created model: ${model}`);
  }
});

console.log('All models have been created successfully!'); 