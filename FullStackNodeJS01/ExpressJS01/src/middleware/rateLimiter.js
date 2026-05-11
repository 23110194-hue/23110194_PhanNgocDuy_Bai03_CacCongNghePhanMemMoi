const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        EC: 429,
        EM: "Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 15 phút."
    },
    skipSuccessfulRequests: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        EC: 429,
        EM: "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút."
    },
});

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 phút
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        EC: 429,
        EM: "Bạn đã gửi OTP quá nhiều lần. Vui lòng thử lại sau 10 phút."
    },
});

module.exports = { registerLimiter, loginLimiter, otpLimiter };
