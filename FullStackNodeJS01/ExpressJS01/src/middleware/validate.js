const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            EC: 400,
            EM: errors.array()[0].msg,
        });
    }
    next();
};

const validateRegister = [
    body("name")
        .trim()
        .notEmpty().withMessage("Họ tên không được để trống")
        .isLength({ min: 2 }).withMessage("Họ tên phải có ít nhất 2 ký tự"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email không được để trống")
        .isEmail().withMessage("Email không hợp lệ")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Mật khẩu không được để trống")
        .isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),

    handleValidationErrors,
];

const validateLogin = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email không được để trống")
        .isEmail().withMessage("Email không hợp lệ")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Mật khẩu không được để trống"),

    handleValidationErrors,
];

const validateForgotPassword = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email không được để trống")
        .isEmail().withMessage("Email không hợp lệ")
        .normalizeEmail(),

    handleValidationErrors,
];

const validateVerifyOTP = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email không được để trống")
        .isEmail().withMessage("Email không hợp lệ")
        .normalizeEmail(),

    body("otp")
        .trim()
        .notEmpty().withMessage("Mã OTP không được để trống")
        .isLength({ min: 6, max: 6 }).withMessage("Mã OTP phải gồm 6 chữ số")
        .isNumeric().withMessage("Mã OTP chỉ gồm chữ số"),

    handleValidationErrors,
];

const validateResetPassword = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email không được để trống")
        .isEmail().withMessage("Email không hợp lệ")
        .normalizeEmail(),

    body("otp")
        .trim()
        .notEmpty().withMessage("Mã OTP không được để trống")
        .isLength({ min: 6, max: 6 }).withMessage("Mã OTP phải gồm 6 chữ số")
        .isNumeric().withMessage("Mã OTP chỉ gồm chữ số"),

    body("newPassword")
        .notEmpty().withMessage("Mật khẩu mới không được để trống")
        .isLength({ min: 6 }).withMessage("Mật khẩu mới phải có ít nhất 6 ký tự"),

    handleValidationErrors,
];

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateVerifyOTP,
    validateResetPassword,
};
