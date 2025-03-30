const jwt = require('jsonwebtoken');
const { AppError } = require('./error-handler');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Удаляем пароль из вывода
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

const protect = async (req, res, next) => {
  try {
    // 1) Получаем токен
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('Вы не авторизованы! Пожалуйста, войдите чтобы получить доступ.', 401));
    }

    // 2) Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Проверяем существует ли пользователь
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('Пользователь с этим токеном больше не существует.', 401));
    }

    // 4) Проверяем не изменился ли пароль после выдачи токена
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Пользователь недавно изменил пароль! Пожалуйста, войдите снова.', 401));
    }

    // Предоставляем доступ к защищенному маршруту
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('У вас нет прав для выполнения этого действия', 403));
    }
    next();
  };
};

const forgotPassword = async (req, res, next) => {
  try {
    // 1) Получаем пользователя по email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('Пользователь с таким email не существует.', 404));
    }

    // 2) Генерируем случайный токен
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Отправляем токен на email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    const message = `Забыли пароль? Отправьте PATCH запрос с новым паролем на: ${resetURL}.\nЕсли вы не забыли пароль, пожалуйста, проигнорируйте это письмо!`;

    // Здесь будет код отправки email

    res.status(200).json({
      status: 'success',
      message: 'Токен отправлен на email!'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Произошла ошибка при отправке email. Попробуйте позже!', 500));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    // 1) Получаем пользователя по токену
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 2) Если токен не истек, устанавливаем новый пароль
    if (!user) {
      return next(new AppError('Токен неверный или истек', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Обновляем changedPasswordAt для пользователя
    // Это делается в модели User

    // 4) Логируем пользователя, отправляем JWT
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    // 1) Получаем пользователя
    const user = await User.findById(req.user.id).select('+password');

    // 2) Проверяем текущий пароль
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Ваш текущий пароль неверный.', 401));
    }

    // 3) Обновляем пароль
    user.password = req.body.password;
    await user.save();

    // 4) Логируем пользователя, отправляем JWT
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signToken,
  createSendToken,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword
}; 