const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit_card', 'bank_transfer'],
        required: true
    },
    transactionId: String,
    notes: String
}, { timestamps: true });

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

module.exports = FeePayment;