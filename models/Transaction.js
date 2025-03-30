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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'TON'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    transactionHash: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentMethod: {
        type: String,
        enum: ['TON', 'TON_WALLET', 'CRYPTO'],
        required: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Индексы для оптимизации поиска
transactionSchema.index({ gift: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ transactionHash: 1 });

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