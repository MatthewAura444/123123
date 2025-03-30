const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { telegramId, username, firstName, lastName, avatar } = req.body;

        // Проверяем, существует ли пользователь
        let user = await User.findOne({ telegramId });
        if (user) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }

        // Создаем нового пользователя
        user = new User({
            telegramId,
            username,
            firstName,
            lastName,
            avatar
        });

        await user.save();

        // Создаем токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                telegramId: user.telegramId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { telegramId } = req.body;

        // Ищем пользователя
        const user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        // Создаем токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                telegramId: user.telegramId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('collections')
            .populate('gifts')
            .populate('favorites');

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, firstName, lastName, bio, settings } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Обновляем данные пользователя
        user.username = username || user.username;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.bio = bio || user.bio;
        user.settings = { ...user.settings, ...settings };

        await user.save();

        res.json(user);
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        user.avatar = req.file.path;
        await user.save();

        res.json({ avatar: user.avatar });
    } catch (error) {
        console.error('Error in updateAvatar:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}; 