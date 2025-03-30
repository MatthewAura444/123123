const Transaction = require('../models/Transaction');
const Gift = require('../models/Gift');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.createTransaction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { giftId, paymentMethod, paymentDetails } = req.body;

        // Проверяем подарок
        const gift = await Gift.findById(giftId);
        if (!gift) {
            return res.status(404).json({ message: 'Подарок не найден' });
        }

        if (gift.status !== 'available') {
            return res.status(400).json({ message: 'Подарок недоступен для покупки' });
        }

        if (gift.owner.toString() === req.user.userId) {
            return res.status(400).json({ message: 'Нельзя купить свой подарок' });
        }

        // Создаем транзакцию
        const transaction = new Transaction({
            gift: giftId,
            seller: gift.owner,
            buyer: req.user.userId,
            price: gift.price,
            type: 'purchase',
            paymentMethod,
            paymentDetails
        });

        await transaction.save();

        // Обновляем статус подарка
        gift.status = 'sold';
        await gift.save();

        // Обновляем баланс продавца
        const seller = await User.findById(gift.owner);
        seller.balance += gift.price;
        await seller.save();

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error in createTransaction:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const query = {};

        // Фильтр по статусу
        if (status) {
            query.status = status;
        }

        // Фильтр по типу
        if (type) {
            query.type = type;
        }

        // Фильтр по пользователю
        query.$or = [
            { seller: req.user.userId },
            { buyer: req.user.userId }
        ];

        const transactions = await Transaction.find(query)
            .populate('gift', 'name image price')
            .populate('seller', 'username firstName lastName avatar')
            .populate('buyer', 'username firstName lastName avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error in getTransactions:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('gift', 'name image price')
            .populate('seller', 'username firstName lastName avatar')
            .populate('buyer', 'username firstName lastName avatar');

        if (!transaction) {
            return res.status(404).json({ message: 'Транзакция не найдена' });
        }

        // Проверяем доступ
        if (
            transaction.seller._id.toString() !== req.user.userId &&
            transaction.buyer._id.toString() !== req.user.userId
        ) {
            return res.status(403).json({ message: 'Нет доступа к транзакции' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error in getTransaction:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Транзакция не найдена' });
        }

        // Проверяем права на обновление
        if (transaction.seller.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав на обновление статуса' });
        }

        // Обновляем статус
        transaction.status = status;
        await transaction.save();

        // Если транзакция отменена, возвращаем статус подарка
        if (status === 'cancelled') {
            const gift = await Gift.findById(transaction.gift);
            gift.status = 'available';
            await gift.save();
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error in updateTransactionStatus:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getTransactionStats = async (req, res) => {
    try {
        const stats = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { seller: req.user.userId },
                        { buyer: req.user.userId }
                    ],
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: {
                            $cond: [
                                { $eq: ['$seller', req.user.userId] },
                                '$price',
                                0
                            ]
                        }
                    },
                    totalPurchases: {
                        $sum: {
                            $cond: [
                                { $eq: ['$buyer', req.user.userId] },
                                '$price',
                                0
                            ]
                        }
                    },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        res.json(stats[0] || {
            totalSales: 0,
            totalPurchases: 0,
            totalTransactions: 0
        });
    } catch (error) {
        console.error('Error in getTransactionStats:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}; 