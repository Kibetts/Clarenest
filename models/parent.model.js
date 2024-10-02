const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    finances: {
        feesPaid: { type: Number, default: 0 },
        arrears: { type: Number, default: 0 }
    },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
});

module.exports = mongoose.model('Parent', parentSchema);
