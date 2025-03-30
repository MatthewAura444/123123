const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift'
    }],
    category: {
        type: String,
        required: true,
        enum: ['digital', 'physical', 'art', 'collectibles', 'other']
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'draft'],
        default: 'active'
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    totalSales: {
        type: Number,
        default: 0
    },
    totalVolume: {
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
collectionSchema.index({ name: 'text', description: 'text', tags: 'text' });
collectionSchema.index({ creator: 1, status: 1 });
collectionSchema.index({ category: 1, status: 1 });

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection; 