const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    model: {
        type: String
    },
    category: {
        type: String,
        required: true,
        enum: ['digital', 'physical', 'art', 'collectibles', 'other']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection'
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'reserved'],
        default: 'available'
    },
    tags: [{
        type: String,
        trim: true
    }],
    stats: {
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0
        },
        reviews: [{
            user: {
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
        }]
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Обновление updatedAt при изменении документа
giftSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Метод для расчета среднего рейтинга
giftSchema.methods.calculateRating = function() {
    if (this.stats.reviews.length === 0) return 0;
    const sum = this.stats.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.stats.reviews.length;
};

// Индексы для оптимизации поиска
giftSchema.index({ name: 'text', description: 'text', tags: 'text' });
giftSchema.index({ owner: 1, status: 1 });
giftSchema.index({ category: 1, status: 1 });
giftSchema.index({ collection: 1, status: 1 });

module.exports = mongoose.model('Gift', giftSchema); 