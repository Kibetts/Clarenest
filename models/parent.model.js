const mongoose = require('mongoose');
const User = require('./user.model');

const parentSchema = new mongoose.Schema({
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
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


parentSchema.methods.updateFinances = function(amount, description) {
    this.finances.feesPaid += amount;
    this.finances.arrears -= amount;
    this.finances.paymentHistory.push({
        amount,
        date: new Date(),
        description
    });
};

// Add methods for managing children
parentSchema.methods.addChild = async function(studentId) {
    if (!this.children.includes(studentId)) {
        this.children.push(studentId);
        await this.save();
        
        // Update student's parent reference
        await mongoose.model('Student').findByIdAndUpdate(
            studentId,
            { parent: this._id }
        );
    }
};

parentSchema.methods.removeChild = async function(studentId) {
    this.children = this.children.filter(id => id.toString() !== studentId.toString());
    await this.save();
    
    // Remove parent reference from student
    await mongoose.model('Student').findByIdAndUpdate(
        studentId,
        { parent: null }
    );
};

// Pre-save middleware to ensure role is set
parentSchema.pre('save', function(next) {
    if (this.isNew) {
        this.role = 'parent';
    }
    next();
});


const Parent = User.discriminator('Parent', parentSchema);
module.exports = Parent;