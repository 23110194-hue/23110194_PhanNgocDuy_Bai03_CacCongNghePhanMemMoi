require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const sendOTPEmail = async (email, otp, type) => {
    const isRegister = type === "register";

    const subject = isRegister
        ? "🔐 Mã OTP Kích Hoạt Tài Khoản"
        : "🔑 Mã OTP Đặt Lại Mật Khẩu";

    const actionTitle = isRegister
        ? "Kích Hoạt Tài Khoản"
        : "Đặt Lại Mật Khẩu";

    const description = isRegister
        ? "Bạn vừa đăng ký tài khoản. Vui lòng sử dụng mã OTP dưới đây để kích hoạt tài khoản:"
        : "Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây:";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 30px; }
        .body p { color: #555; font-size: 15px; line-height: 1.6; }
        .otp-box { background: #f0f0ff; border: 2px dashed #764ba2; border-radius: 10px; text-align: center; padding: 20px; margin: 25px 0; }
        .otp-code { font-size: 42px; font-weight: bold; color: #764ba2; letter-spacing: 10px; }
        .note { color: #999; font-size: 13px; text-align: center; margin-top: 10px; }
        .footer { background: #f4f4f4; padding: 15px; text-align: center; color: #aaa; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ${actionTitle}</h1>
        </div>
        <div class="body">
          <p>Xin chào,</p>
          <p>${description}</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="note">⏱ Mã OTP có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p>Nếu bạn không thực hiện thao tác này, hãy bỏ qua email này.</p>
        </div>
        <div class="footer">© 2025 FullStack App — Phan Ngọc Duy</div>
      </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"FullStack App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent,
        });
        console.log(`>>> OTP email sent to ${email} (type: ${type})`);
        return true;
    } catch (error) {
        console.error(">>> Error sending OTP email:", error.message);
        return false;
    }
};

module.exports = { sendOTPEmail };
