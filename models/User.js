const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    walletAddress: String,
    balance: {
        type: Number,
        default: 0
    },
    collections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection'
    }],
    gifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift'
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift'
    }],
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    settings: {
        notifications: {
            type: Boolean,
            default: true
        },
        darkMode: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Хук для хеширования пароля перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Индексы для оптимизации поиска
userSchema.index({ telegramId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ walletAddress: 1 });

// Методы для работы с пользователем
userSchema.methods.updateBalance = async function(amount) {
    this.balance += amount;
    await this.save();
};

userSchema.methods.addToFavorites = async function(giftId) {
    if (!this.favorites.includes(giftId)) {
        this.favorites.push(giftId);
        await this.save();
    }
};

userSchema.methods.removeFromFavorites = async function(giftId) {
    this.favorites = this.favorites.filter(id => id.toString() !== giftId.toString());
    await this.save();
};

userSchema.methods.follow = async function(userId) {
    if (!this.following.includes(userId)) {
        this.following.push(userId);
        await this.save();
    }
};

userSchema.methods.unfollow = async function(userId) {
    this.following = this.following.filter(id => id.toString() !== userId.toString());
    await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 