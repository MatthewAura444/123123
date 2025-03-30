const Gift = require('../models/Gift');
const Collection = require('../models/Collection');
const { validationResult } = require('express-validator');

exports.createGift = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            description,
            price,
            image,
            model,
            category,
            collection,
            tags
        } = req.body;

        const gift = new Gift({
            name,
            description,
            price,
            image,
            model,
            category,
            owner: req.user.userId,
            collection,
            tags
        });

        await gift.save();

        // Если указана коллекция, добавляем подарок в нее
        if (collection) {
            const collectionDoc = await Collection.findById(collection);
            if (collectionDoc) {
                collectionDoc.gifts.push(gift._id);
                await collectionDoc.save();
            }
        }

        res.status(201).json(gift);
    } catch (error) {
        console.error('Error in createGift:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getGifts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            tags,
            minPrice,
            maxPrice,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = { status: 'available' };

        // Поиск по названию и описанию
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Фильтр по категории
        if (category) {
            query.category = category;
        }

        // Фильтр по тегам
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        // Фильтр по цене
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const sortOptions = {};
        sortOptions[sort] = order === 'desc' ? -1 : 1;

        const gifts = await Gift.find(query)
            .populate('owner', 'username firstName lastName avatar')
            .populate('collection', 'name')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Gift.countDocuments(query);

        res.json({
            gifts,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error in getGifts:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getGift = async (req, res) => {
    try {
        const gift = await Gift.findById(req.params.id)
            .populate('owner', 'username firstName lastName avatar')
            .populate('collection', 'name')
            .populate('stats.reviews.user', 'username firstName lastName avatar');

        if (!gift) {
            return res.status(404).json({ message: 'Подарок не найден' });
        }

        // Увеличиваем счетчик просмотров
        gift.stats.views += 1;
        await gift.save();

        res.json(gift);
    } catch (error) {
        console.error('Error in getGift:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.updateGift = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            description,
            price,
            image,
            model,
            category,
            collection,
            tags,
            status
        } = req.body;

        const gift = await Gift.findById(req.params.id);
        if (!gift) {
            return res.status(404).json({ message: 'Подарок не найден' });
        }

        // Проверяем права на редактирование
        if (gift.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав на редактирование' });
        }

        // Обновляем данные подарка
        gift.name = name || gift.name;
        gift.description = description || gift.description;
        gift.price = price || gift.price;
        gift.image = image || gift.image;
        gift.model = model || gift.model;
        gift.category = category || gift.category;
        gift.tags = tags || gift.tags;
        gift.status = status || gift.status;

        // Обновляем коллекцию
        if (collection && collection !== gift.collection?.toString()) {
            // Удаляем из старой коллекции
            if (gift.collection) {
                const oldCollection = await Collection.findById(gift.collection);
                if (oldCollection) {
                    oldCollection.gifts = oldCollection.gifts.filter(id => id.toString() !== gift._id.toString());
                    await oldCollection.save();
                }
            }

            // Добавляем в новую коллекцию
            const newCollection = await Collection.findById(collection);
            if (newCollection) {
                newCollection.gifts.push(gift._id);
                await newCollection.save();
            }

            gift.collection = collection;
        }

        await gift.save();

        res.json(gift);
    } catch (error) {
        console.error('Error in updateGift:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.deleteGift = async (req, res) => {
    try {
        const gift = await Gift.findById(req.params.id);
        if (!gift) {
            return res.status(404).json({ message: 'Подарок не найден' });
        }

        // Проверяем права на удаление
        if (gift.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав на удаление' });
        }

        // Удаляем из коллекции
        if (gift.collection) {
            const collection = await Collection.findById(gift.collection);
            if (collection) {
                collection.gifts = collection.gifts.filter(id => id.toString() !== gift._id.toString());
                await collection.save();
            }
        }

        await gift.remove();

        res.json({ message: 'Подарок удален' });
    } catch (error) {
        console.error('Error in deleteGift:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.addReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rating, comment } = req.body;
        const gift = await Gift.findById(req.params.id);

        if (!gift) {
            return res.status(404).json({ message: 'Подарок не найден' });
        }

        // Проверяем, не оставлял ли пользователь уже отзыв
        const existingReview = gift.stats.reviews.find(
            review => review.user.toString() === req.user.userId
        );

        if (existingReview) {
            return res.status(400).json({ message: 'Вы уже оставили отзыв' });
        }

        // Добавляем новый отзыв
        gift.stats.reviews.push({
            user: req.user.userId,
            rating,
            comment
        });

        // Обновляем средний рейтинг
        gift.stats.rating = gift.calculateRating();

        await gift.save();

        res.json(gift);
    } catch (error) {
        console.error('Error in addReview:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rating, comment } = req.body;
        const gift = await Gift.findById(req.params.id);

        if (!gift) {
            return res.status(404).json({ message: 'Подарок не найден' });
        }

        // Находим отзыв пользователя
        const reviewIndex = gift.stats.reviews.findIndex(
            review => review.user.toString() === req.user.userId
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Отзыв не найден' });
        }

        // Обновляем отзыв
        gift.stats.reviews[reviewIndex] = {
            ...gift.stats.reviews[reviewIndex],
            rating,
            comment
        };

        // Обновляем средний рейтинг
        gift.stats.rating = gift.calculateRating();

        await gift.save();

        res.json(gift);
    } catch (error) {
        console.error('Error in updateReview:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const gift = await Gift.findById(req.params.id);
        if (!gift) {
            return res.status(404).json({ message: 'Подарок не найден' });
        }

        // Находим и удаляем отзыв пользователя
        gift.stats.reviews = gift.stats.reviews.filter(
            review => review.user.toString() !== req.user.userId
        );

        // Обновляем средний рейтинг
        gift.stats.rating = gift.calculateRating();

        await gift.save();

        res.json(gift);
    } catch (error) {
        console.error('Error in deleteReview:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}; 