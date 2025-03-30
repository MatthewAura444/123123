const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем директории для загрузок, если они не существуют
const uploadDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadDir, 'images');
const modelsDir = path.join(uploadDir, 'models');

[uploadDir, imagesDir, modelsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Настройка хранилища для изображений
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Настройка хранилища для 3D моделей
const modelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, modelsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Фильтр для изображений
const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат изображения'), false);
    }
};

// Фильтр для 3D моделей
const modelFilter = (req, file, cb) => {
    const allowedTypes = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат 3D модели'), false);
    }
};

// Создаем экземпляры multer
const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

const uploadModel = multer({
    storage: modelStorage,
    fileFilter: modelFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// Middleware для загрузки изображения
exports.uploadImage = uploadImage.single('image');

// Middleware для загрузки 3D модели
exports.uploadModel = uploadModel.single('model');

// Middleware для загрузки нескольких файлов
exports.uploadMultiple = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = file.mimetype.startsWith('image/') ? imagesDir : modelsDir;
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            imageFilter(req, file, cb);
        } else if (file.mimetype.startsWith('model/') || file.mimetype === 'application/octet-stream') {
            modelFilter(req, file, cb);
        } else {
            cb(new Error('Неподдерживаемый формат файла'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
}).array('files', 10); // Максимум 10 файлов

// Функция для удаления файла
exports.deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}; 