require("dotenv").config();
const User = require("../models/user");
const OTP = require("../models/otp");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOTPEmail } = require("./emailService");
const saltRounds = 10;

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const createUserService = async (name, email, password) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isActive) {
                return { EC: 1, EM: "Email đã được sử dụng, vui lòng chọn email khác" };
            }
            await User.deleteOne({ email });
        }

        await OTP.deleteOne({ email, type: "register" });

        const hashPassword = await bcrypt.hash(password, saltRounds);
        await User.create({ name, email, password: hashPassword, role: "user", isActive: false });

        const otp = generateOTP();
        await OTP.create({ email, otp, type: "register" });

        const emailSent = await sendOTPEmail(email, otp, "register");
        if (!emailSent) {
            return { EC: -1, EM: "Không thể gửi email OTP. Vui lòng kiểm tra lại email hoặc thử lại sau." };
        }

        return { EC: 0, EM: `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.` };
    } catch (error) {
        console.error("createUserService error:", error);
        return { EC: -1, EM: "Lỗi server, vui lòng thử lại sau" };
    }
};

const verifyRegisterOTPService = async (email, otp) => {
    try {
        const otpRecord = await OTP.findOne({ email, type: "register" });
        if (!otpRecord) {
            return { EC: 1, EM: "Mã OTP không hợp lệ hoặc đã hết hạn" };
        }
        if (otpRecord.otp !== otp) {
            return { EC: 2, EM: "Mã OTP không chính xác" };
        }

        await User.updateOne({ email }, { isActive: true });
        await OTP.deleteOne({ email, type: "register" });

        return { EC: 0, EM: "Tài khoản đã được kích hoạt thành công! Bạn có thể đăng nhập." };
    } catch (error) {
        console.error("verifyRegisterOTPService error:", error);
        return { EC: -1, EM: "Lỗi server, vui lòng thử lại sau" };
    }
};

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return { EC: 1, EM: "Email hoặc mật khẩu không hợp lệ" };
        }

        if (!user.isActive) {
            return { EC: 3, EM: "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để lấy mã OTP." };
        }

        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            return { EC: 2, EM: "Email hoặc mật khẩu không hợp lệ" };
        }

        const payload = { email: user.email, name: user.name, role: user.role };
        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        const redirectUrl = user.role === "admin" ? "/admin/profile" : "/user/profile";

        return {
            EC: 0,
            access_token,
            user: { email: user.email, name: user.name, role: user.role },
            redirectUrl,
        };
    } catch (error) {
        console.error("loginService error:", error);
        return { EC: -1, EM: "Lỗi server, vui lòng thử lại sau" };
    }
};

const sendForgotPasswordOTPService = async (email) => {
    try {
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return { EC: 1, EM: "Email không tồn tại hoặc tài khoản chưa được kích hoạt" };
        }

        await OTP.deleteOne({ email, type: "forgot-password" });

        const otp = generateOTP();
        await OTP.create({ email, otp, type: "forgot-password" });

        const emailSent = await sendOTPEmail(email, otp, "forgot-password");
        if (!emailSent) {
            return { EC: -1, EM: "Không thể gửi email OTP. Vui lòng thử lại sau." };
        }

        return { EC: 0, EM: `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.` };
    } catch (error) {
        console.error("sendForgotPasswordOTPService error:", error);
        return { EC: -1, EM: "Lỗi server, vui lòng thử lại sau" };
    }
};

const verifyForgotPasswordOTPService = async (email, otp, newPassword) => {
    try {
        const otpRecord = await OTP.findOne({ email, type: "forgot-password" });
        if (!otpRecord) {
            return { EC: 1, EM: "Mã OTP không hợp lệ hoặc đã hết hạn" };
        }
        if (otpRecord.otp !== otp) {
            return { EC: 2, EM: "Mã OTP không chính xác" };
        }

        const hashPassword = await bcrypt.hash(newPassword, saltRounds);
        await User.updateOne({ email }, { password: hashPassword });
        await OTP.deleteOne({ email, type: "forgot-password" });

        return { EC: 0, EM: "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập." };
    } catch (error) {
        console.error("verifyForgotPasswordOTPService error:", error);
        return { EC: -1, EM: "Lỗi server, vui lòng thử lại sau" };
    }
};

const getUserService = async () => {
    try {
        return await User.find({}).select("-password");
    } catch (error) {
        console.error("getUserService error:", error);
        return null;
    }
};

module.exports = {
    createUserService,
    verifyRegisterOTPService,
    loginService,
    sendForgotPasswordOTPService,
    verifyForgotPasswordOTPService,
    getUserService,
};