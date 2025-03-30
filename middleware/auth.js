const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Получаем токен из заголовка
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Добавляем информацию о пользователе в запрос
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        res.status(401).json({ message: 'Недействительный токен' });
    }
}; 