const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const giftController = require('../controllers/giftController');
const { uploadImage, uploadModel } = require('../middleware/upload');

// Валидация для создания подарка
const createGiftValidation = [
    body('name').notEmpty().withMessage('Название подарка обязательно'),
    body('description').optional(),
    body('price').isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').isIn(['digital', 'physical', 'art', 'collectibles', 'other']).withMessage('Недопустимая категория'),
    body('collection').optional(),
    body('tags').optional().isArray().withMessage('Теги должны быть массивом')
];

// Валидация для обновления подарка
const updateGiftValidation = [
    body('name').optional().notEmpty().withMessage('Название подарка не может быть пустым'),
    body('description').optional(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').optional().isIn(['digital', 'physical', 'art', 'collectibles', 'other']).withMessage('Недопустимая категория'),
    body('collection').optional(),
    body('tags').optional().isArray().withMessage('Теги должны быть массивом'),
    body('status').optional().isIn(['available', 'sold', 'reserved']).withMessage('Недопустимый статус')
];

// Валидация для отзыва
const reviewValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
    body('comment').optional().isLength({ max: 1000 }).withMessage('Комментарий не может быть длиннее 1000 символов')
];

// Роуты
router.post('/', createGiftValidation, giftController.createGift);
router.get('/', giftController.getGifts);
router.get('/:id', giftController.getGift);
router.put('/:id', updateGiftValidation, giftController.updateGift);
router.delete('/:id', giftController.deleteGift);

// Роуты для загрузки файлов
router.post('/:id/image', uploadImage, giftController.updateGift);
router.post('/:id/model', uploadModel, giftController.updateGift);

// Роуты для отзывов
router.post('/:id/reviews', reviewValidation, giftController.addReview);
router.put('/:id/reviews', reviewValidation, giftController.updateReview);
router.delete('/:id/reviews', giftController.deleteReview);

module.exports = router; 