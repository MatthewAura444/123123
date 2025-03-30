const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const collectionController = require('../controllers/collectionController');
const { uploadImage } = require('../middleware/upload');

// Валидация для создания коллекции
const createCollectionValidation = [
    body('name').notEmpty().withMessage('Название коллекции обязательно'),
    body('description').optional(),
    body('cover').optional(),
    body('isPublic').optional().isBoolean().withMessage('isPublic должен быть булевым значением'),
    body('tags').optional().isArray().withMessage('Теги должны быть массивом')
];

// Валидация для обновления коллекции
const updateCollectionValidation = [
    body('name').optional().notEmpty().withMessage('Название коллекции не может быть пустым'),
    body('description').optional(),
    body('cover').optional(),
    body('isPublic').optional().isBoolean().withMessage('isPublic должен быть булевым значением'),
    body('tags').optional().isArray().withMessage('Теги должны быть массивом')
];

// Роуты
router.post('/', createCollectionValidation, collectionController.createCollection);
router.get('/', collectionController.getCollections);
router.get('/:id', collectionController.getCollection);
router.put('/:id', updateCollectionValidation, collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

// Роуты для управления подарками в коллекции
router.post('/:id/gifts', body('giftId').notEmpty().withMessage('ID подарка обязателен'), collectionController.addGiftToCollection);
router.delete('/:id/gifts/:giftId', collectionController.removeGiftFromCollection);

module.exports = router; 