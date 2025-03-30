const multer = require('multer');
const path = require('path');

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Определяем папку назначения в зависимости от типа файла
    if (file.fieldname === 'image') {
      uploadPath += 'images/';
    } else if (file.fieldname === 'model') {
      uploadPath += 'models/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Разрешаем только изображения
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  } else if (file.fieldname === 'model') {
    // Разрешаем только 3D модели
    if (file.mimetype === 'model/gltf-binary' || file.mimetype === 'model/gltf+json') {
      cb(null, true);
    } else {
      cb(new Error('Только GLTF модели разрешены!'), false);
    }
  } else {
    cb(new Error('Неподдерживаемый тип файла!'), false);
  }
};

// Создаем экземпляр multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Максимальный размер файла: 10MB
  }
});

module.exports = upload; 