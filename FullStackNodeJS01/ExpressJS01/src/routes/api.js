const express = require('express');
const {
    createUser,
    handleVerifyRegisterOTP,
    handleLogin,
    getUser,
    getAccount,
    handleSendForgotPasswordOTP,
    handleVerifyForgotPasswordOTP,
} = require('../controllers/userController');

const { auth, authorizeRole } = require('../middleware/auth');
const delay = require('../middleware/delay');
const { registerLimiter, loginLimiter, otpLimiter } = require('../middleware/rateLimiter');
const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateVerifyOTP,
    validateResetPassword,
} = require('../middleware/validate');

const routerAPI = express.Router();

// Áp dụng auth middleware cho toàn bộ router
routerAPI.use(auth);

// ── Public Routes ────────────────────────────────────────────
routerAPI.get("/", (req, res) => res.status(200).json("Hello world api"));

// Register: rate limit + validate → tạo user + gửi OTP
routerAPI.post("/register", registerLimiter, validateRegister, createUser);

// Verify Register OTP: OTP limit + validate → kích hoạt tài khoản
routerAPI.post("/verify-register", otpLimiter, validateVerifyOTP, handleVerifyRegisterOTP);

// Login: rate limit + validate → trả về JWT + redirectUrl
routerAPI.post("/login", loginLimiter, validateLogin, handleLogin);

// Forgot Password: OTP limit + validate → gửi OTP qua email
routerAPI.post("/forgot-password", otpLimiter, validateForgotPassword, handleSendForgotPasswordOTP);

// Verify Forgot Password OTP: OTP limit + validate → reset password
routerAPI.post("/verify-forgot-password", otpLimiter, validateResetPassword, handleVerifyForgotPasswordOTP);

// ── Protected Routes (cần đăng nhập) ────────────────────────
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

// User Profile: chỉ user và admin mới vào được
routerAPI.get("/user/profile", authorizeRole("user", "admin"), (req, res) => {
    return res.status(200).json({
        EC: 0,
        message: "User Profile",
        user: req.user,
    });
});

// Admin Profile: chỉ admin mới vào được
routerAPI.get("/admin/profile", authorizeRole("admin"), (req, res) => {
    return res.status(200).json({
        EC: 0,
        message: "Admin Profile",
        user: req.user,
    });
});

module.exports = routerAPI;