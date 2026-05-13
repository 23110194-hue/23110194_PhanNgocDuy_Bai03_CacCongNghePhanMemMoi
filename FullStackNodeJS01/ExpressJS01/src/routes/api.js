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

const {
    apiGetProducts,
    apiGetProductDetail,
} = require('../controllers/homeController');

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

routerAPI.use(auth);

routerAPI.get("/", (req, res) => res.status(200).json("Hello world api"));

routerAPI.get("/products", apiGetProducts);
routerAPI.get("/products/:slug", apiGetProductDetail);

routerAPI.post("/register", registerLimiter, validateRegister, createUser);

routerAPI.post("/verify-register", otpLimiter, validateVerifyOTP, handleVerifyRegisterOTP);

routerAPI.post("/login", loginLimiter, validateLogin, handleLogin);

routerAPI.post("/forgot-password", otpLimiter, validateForgotPassword, handleSendForgotPasswordOTP);

routerAPI.post("/verify-forgot-password", otpLimiter, validateResetPassword, handleVerifyForgotPasswordOTP);

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

routerAPI.get("/user/profile", authorizeRole("user", "admin"), (req, res) => {
    return res.status(200).json({
        EC: 0,
        message: "User Profile",
        user: req.user,
    });
});

routerAPI.get("/admin/profile", authorizeRole("admin"), (req, res) => {
    return res.status(200).json({
        EC: 0,
        message: "Admin Profile",
        user: req.user,
    });
});

module.exports = routerAPI;