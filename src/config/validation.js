const { body } = require('express-validator');

// Валидация для регистрации
const registerValidation = [
  body('telegramId')
    .notEmpty()
    .withMessage('Telegram ID обязателен'),
  body('username')
    .notEmpty()
    .withMessage('Имя пользователя обязательно')
    .isLength({ min: 3, max: 30 })
    .withMessage('Имя пользователя должно быть от 3 до 30 символов'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Био не должно превышать 500 символов')
];

// Валидация для входа
const loginValidation = [
  body('telegramId')
    .notEmpty()
    .withMessage('Telegram ID обязателен')
];

// Валидация для создания коллекции
const createCollectionValidation = [
  body('name')
    .notEmpty()
    .withMessage('Название коллекции обязательно')
    .isLength({ min: 3, max: 100 })
    .withMessage('Название коллекции должно быть от 3 до 100 символов'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic должен быть булевым значением')
];

// Валидация для создания подарка
const createGiftValidation = [
  body('name')
    .notEmpty()
    .withMessage('Название подарка обязательно')
    .isLength({ min: 3, max: 100 })
    .withMessage('Название подарка должно быть от 3 до 100 символов'),
  body('description')
    .notEmpty()
    .withMessage('Описание подарка обязательно')
    .isLength({ max: 2000 })
    .withMessage('Описание не должно превышать 2000 символов'),
  body('price')
    .notEmpty()
    .withMessage('Цена обязательна')
    .isFloat({ min: 0 })
    .withMessage('Цена должна быть положительным числом'),
  body('category')
    .notEmpty()
    .withMessage('Категория обязательна')
    .isIn(['digital', 'physical', '3d'])
    .withMessage('Недопустимая категория'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом')
];

// Валидация для создания транзакции
const createTransactionValidation = [
  body('giftId')
    .notEmpty()
    .withMessage('ID подарка обязателен'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Метод оплаты обязателен')
    .isIn(['ton', 'credit_card', 'bank_transfer'])
    .withMessage('Недопустимый метод оплаты'),
  body('paymentDetails')
    .notEmpty()
    .withMessage('Детали оплаты обязательны')
    .isObject()
    .withMessage('Детали оплаты должны быть объектом')
];

// Валидация для отзыва
const createReviewValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Рейтинг обязателен')
    .isInt({ min: 1, max: 5 })
    .withMessage('Рейтинг должен быть от 1 до 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Комментарий не должен превышать 1000 символов')
];

module.exports = {
  registerValidation,
  loginValidation,
  createCollectionValidation,
  createGiftValidation,
  createTransactionValidation,
  createReviewValidation
}; 