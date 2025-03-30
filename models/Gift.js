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
    imageUrl: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'TON'
    },
    creator: {
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
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Индексы для оптимизации поиска
giftSchema.index({ name: 'text', description: 'text', tags: 'text' });
giftSchema.index({ status: 1, createdAt: -1 });
giftSchema.index({ creator: 1, status: 1 });

const Gift = mongoose.model('Gift', giftSchema);

module.exports = Gift; 