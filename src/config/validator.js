const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Пожалуйста, загрузите файл'
    });
  }
  next();
};

const validateFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Пожалуйста, загрузите файлы'
    });
  }
  next();
};

const validateImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Пожалуйста, загрузите изображение'
    });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      status: 'error',
      message: 'Неподдерживаемый формат изображения. Разрешены: JPEG, PNG, GIF, WEBP'
    });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      status: 'error',
      message: 'Размер изображения не должен превышать 5MB'
    });
  }

  next();
};

const validateModel = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Пожалуйста, загрузите 3D модель'
    });
  }

  const allowedTypes = ['model/gltf-binary', 'model/gltf+json'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      status: 'error',
      message: 'Неподдерживаемый формат модели. Разрешены: GLTF, GLB'
    });
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      status: 'error',
      message: 'Размер модели не должен превышать 50MB'
    });
  }

  next();
};

module.exports = {
  validate,
  validateFile,
  validateFiles,
  validateImage,
  validateModel
}; 