const {
    createUserService,
    verifyRegisterOTPService,
    loginService,
    sendForgotPasswordOTPService,
    verifyForgotPasswordOTPService,
    getUserService,
} = require("../services/userService");

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
    return res.status(200).json(req.user);
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
    handleSendForgotPasswordOTP,
    handleVerifyForgotPasswordOTP,
};