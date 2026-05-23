const {
    createUserService,
    verifyRegisterOTPService,
    loginService,
    sendForgotPasswordOTPService,
    verifyForgotPasswordOTPService,
    getUserService,
} = require("../services/userService");
const User = require('../models/user');

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data);
};

const handleVerifyRegisterOTP = async (req, res) => {
    const { email, otp } = req.body;
    const data = await verifyRegisterOTPService(email, otp);
    return res.status(200).json(data);
};

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data);
};

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
};

const getAccount = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Chưa xác thực' });
    }
    // Query DB để lấy role thực tế (JWT có thể đã cũ khi role bị thay đổi trong DB)
    const user = await User.findById(req.user.id).select('id email name role').lean();
    if (!user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    return res.status(200).json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
    });
};

const getUserProfile = async (req, res) => {
    return res.status(200).json({
        EC: 0,
        message: "User Profile",
        user: req.user,
    });
};

const getAdminProfile = async (req, res) => {
    return res.status(200).json({
        EC: 0,
        message: "Admin Profile",
        user: req.user,
    });
};

const handleSendForgotPasswordOTP = async (req, res) => {
    const { email } = req.body;
    const data = await sendForgotPasswordOTPService(email);
    return res.status(200).json(data);
};

const handleVerifyForgotPasswordOTP = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const data = await verifyForgotPasswordOTPService(email, otp, newPassword);
    return res.status(200).json(data);
};

module.exports = {
    createUser,
    handleVerifyRegisterOTP,
    handleLogin,
    getUser,
    getAccount,
    getUserProfile,
    getAdminProfile,
    handleSendForgotPasswordOTP,
    handleVerifyForgotPasswordOTP,
};