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
    try {
        const { name, email, password } = req.body;
        const data = await createUserService(name, email, password);
        return res.status(200).json(data);
    } catch (error) {
        console.error('createUser error:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server, vui lòng thử lại sau' });
    }
};

const handleVerifyRegisterOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const data = await verifyRegisterOTPService(email, otp);
        return res.status(200).json(data);
    } catch (error) {
        console.error('handleVerifyRegisterOTP error:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server, vui lòng thử lại sau' });
    }
};

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await loginService(email, password);
        return res.status(200).json(data);
    } catch (error) {
        console.error('handleLogin error:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server, vui lòng thử lại sau' });
    }
};

const getUser = async (req, res) => {
    try {
        const data = await getUserService();
        return res.status(200).json(data);
    } catch (error) {
        console.error('getUser error:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server, vui lòng thử lại sau' });
    }
};

const getAccount = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực' });
        }
        // Query DB để lấy role thực tế
        const user = await User.findById(req.user.id).select('id email name role').lean();
        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }
        return res.status(200).json({
            id: user._id,
            email: user.email,
            name: user.name,
            role: (user.role || 'user').toLowerCase(),
        });
    } catch (error) {
        console.error('getAccount error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
    }
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
    try {
        const { email } = req.body;
        const data = await sendForgotPasswordOTPService(email);
        return res.status(200).json(data);
    } catch (error) {
        console.error('handleSendForgotPasswordOTP error:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server, vui lòng thử lại sau' });
    }
};

const handleVerifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const data = await verifyForgotPasswordOTPService(email, otp, newPassword);
        return res.status(200).json(data);
    } catch (error) {
        console.error('handleVerifyForgotPasswordOTP error:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server, vui lòng thử lại sau' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Chưa xác thực' });
        
        const updateData = {};
        if (name) updateData.name = name;
        
        const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
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
    updateProfile,
};