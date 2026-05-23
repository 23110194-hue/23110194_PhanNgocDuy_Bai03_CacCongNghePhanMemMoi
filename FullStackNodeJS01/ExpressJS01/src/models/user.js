const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'vendor', 'manager'],
        default: 'user',
    },
    isActive: { type: Boolean, default: false },
});

const User = mongoose.model('user', userSchema);

module.exports = User;