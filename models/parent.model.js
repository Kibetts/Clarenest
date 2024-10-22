const mongoose = require('mongoose');
const User = require('./user.model');

const parentSchema = new mongoose.Schema({
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    relationship: {
        type: String,
        required: [true, 'Relationship to student is required'],
        enum: ['Mother', 'Father', 'Guardian', 'Other']
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    finances: {
        feesPaid: { type: Number, default: 0 },
        arrears: { type: Number, default: 0 },
        paymentHistory: [{
            amount: Number,
            date: Date,
            description: String
        }]
    },
}, { timestamps: true });

parentSchema.pre('save', function(next) {
    if (this.isNew) {
        this.role = 'parent';
    }
    next();
});

parentSchema.methods.updateFinances = function(amount, description) {
    this.finances.feesPaid += amount;
    this.finances.arrears -= amount;
    this.finances.paymentHistory.push({
        amount,
        date: new Date(),
        description
    });
};

const Parent = User.discriminator('Parent', parentSchema);
module.exports = Parent;