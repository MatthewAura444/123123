module.exports = (err, req, res, next) => {
    console.error(err.stack);

    // Ошибки валидации Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({ message: 'Ошибка валидации', errors });
    }

    // Ошибки дублирования ключей
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Дублирование данных' });
    }

    // Ошибки JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Недействительный токен' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Токен истек' });
    }

    // Ошибки загрузки файлов
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: 'Ошибка загрузки файла', error: err.message });
    }

    // Ошибки MongoDB
    if (err.name === 'MongoError') {
        return res.status(500).json({ message: 'Ошибка базы данных' });
    }

    // Ошибки Express-validator
    if (err.array) {
        return res.status(400).json({ message: 'Ошибка валидации', errors: err.array() });
    }

    // Ошибки по умолчанию
    res.status(500).json({
        message: 'Внутренняя ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}; 