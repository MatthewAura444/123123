const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');

// Валидация для создания транзакции
const createTransactionValidation = [
    body('giftId').notEmpty().withMessage('ID подарка обязателен'),
    body('paymentMethod').isIn(['ton', 'credit_card', 'bank_transfer']).withMessage('Недопустимый метод оплаты'),
    body('paymentDetails').isObject().withMessage('Детали оплаты должны быть объектом')
];

// Валидация для обновления статуса транзакции
const updateStatusValidation = [
    body('status').isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Недопустимый статус')
];

// Роуты
router.post('/', createTransactionValidation, transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransaction);
router.put('/:id/status', updateStatusValidation, transactionController.updateTransactionStatus);
router.get('/stats', transactionController.getTransactionStats);

module.exports = router; 