const Collection = require('../models/Collection');
const { validationResult } = require('express-validator');

exports.createCollection = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, cover, isPublic, tags } = req.body;

        const collection = new Collection({
            name,
            description,
            cover,
            isPublic,
            tags,
            owner: req.user.userId
        });

        await collection.save();

        res.status(201).json(collection);
    } catch (error) {
        console.error('Error in createCollection:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getCollections = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, tags } = req.query;
        const query = {};

        // Поиск по названию и описанию
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Фильтр по тегам
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        // Получаем только публичные коллекции
        query.isPublic = true;

        const collections = await Collection.find(query)
            .populate('owner', 'username firstName lastName avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Collection.countDocuments(query);

        res.json({
            collections,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error in getCollections:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id)
            .populate('owner', 'username firstName lastName avatar')
            .populate('gifts');

        if (!collection) {
            return res.status(404).json({ message: 'Коллекция не найдена' });
        }

        // Проверяем доступ
        if (!collection.isPublic && collection.owner._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет доступа к коллекции' });
        }

        res.json(collection);
    } catch (error) {
        console.error('Error in getCollection:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.updateCollection = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, cover, isPublic, tags } = req.body;

        const collection = await Collection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Коллекция не найдена' });
        }

        // Проверяем права на редактирование
        if (collection.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав на редактирование' });
        }

        // Обновляем данные коллекции
        collection.name = name || collection.name;
        collection.description = description || collection.description;
        collection.cover = cover || collection.cover;
        collection.isPublic = isPublic !== undefined ? isPublic : collection.isPublic;
        collection.tags = tags || collection.tags;

        await collection.save();

        res.json(collection);
    } catch (error) {
        console.error('Error in updateCollection:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Коллекция не найдена' });
        }

        // Проверяем права на удаление
        if (collection.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав на удаление' });
        }

        await collection.remove();

        res.json({ message: 'Коллекция удалена' });
    } catch (error) {
        console.error('Error in deleteCollection:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.addGiftToCollection = async (req, res) => {
    try {
        const { giftId } = req.body;
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Коллекция не найдена' });
        }

        // Проверяем права на редактирование
        if (collection.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав на редактирование' });
        }

        // Проверяем, не добавлен ли уже подарок
        if (collection.gifts.includes(giftId)) {
            return res.status(400).json({ message: 'Подарок уже добавлен в коллекцию' });
        }

        collection.gifts.push(giftId);
        await collection.save();

        res.json(collection);
    } catch (error) {
        console.error('Error in addGiftToCollection:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.removeGiftFromCollection = async (req, res) => {
    try {
        const { giftId } = req.params;
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Коллекция не найдена' });
        }

        // Проверяем права на редактирование
        if (collection.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав на редактирование' });
        }

        collection.gifts = collection.gifts.filter(id => id.toString() !== giftId);
        await collection.save();

        res.json(collection);
    } catch (error) {
        console.error('Error in removeGiftFromCollection:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}; 