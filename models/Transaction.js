const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    gift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['purchase', 'transfer', 'refund'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['ton', 'credit_card', 'bank_transfer'],
        required: true
    },
    paymentDetails: {
        transactionId: String,
        paymentAddress: String,
        paymentAmount: Number,
        paymentCurrency: String,
        paymentTimestamp: Date
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
transactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Индексы для оптимизации поиска
transactionSchema.index({ gift: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

// Методы для работы с транзакциями
transactionSchema.methods.complete = async function(transactionHash) {
    this.status = 'completed';
    this.transactionHash = transactionHash;
    await this.save();
};

transactionSchema.methods.fail = async function() {
    this.status = 'failed';
    await this.save();
};

transactionSchema.methods.cancel = async function() {
    this.status = 'cancelled';
    await this.save();
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 