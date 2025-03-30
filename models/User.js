const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    photoUrl: {
        type: String
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true
    },
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
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    totalSales: {
        type: Number,
        default: 0
    },
    totalPurchases: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        notifications: {
            type: Boolean,
            default: true
        },
        privacy: {
            type: String,
            enum: ['public', 'private', 'friends'],
            default: 'public'
        }
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

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