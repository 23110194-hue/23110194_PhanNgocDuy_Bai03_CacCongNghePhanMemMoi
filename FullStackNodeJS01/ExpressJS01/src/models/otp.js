const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['register', 'forgot-password'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    },
});

otpSchema.index({ email: 1, type: 1 }, { unique: true });

const OTP = mongoose.model('otp', otpSchema);

module.exports = OTP;
