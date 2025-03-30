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
    cover: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift'
    }],
    isPublic: {
        type: Boolean,
        default: true
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
        }
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
collectionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Индексы для оптимизации поиска
collectionSchema.index({ name: 'text', description: 'text', tags: 'text' });
collectionSchema.index({ owner: 1, isPublic: 1 });

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection; 