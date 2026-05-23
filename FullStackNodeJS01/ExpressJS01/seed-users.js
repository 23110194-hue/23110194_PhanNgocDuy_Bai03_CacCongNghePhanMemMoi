require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('user', userSchema);

const ACCOUNTS = [
    { name: 'Admin Master',   email: 'admin@bookstore.vn',   password: '123456', role: 'admin',   isActive: true },
    { name: 'Manager Duy',    email: 'manager@bookstore.vn', password: '123456', role: 'manager', isActive: true },
    { name: 'Vendor Shop',    email: 'vendor@bookstore.vn',  password: '123456', role: 'vendor',  isActive: true },
    { name: 'User Ngoc',      email: 'user@bookstore.vn',    password: '123456', role: 'user',    isActive: true },
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log('✅ Đã kết nối MongoDB');

    for (const acc of ACCOUNTS) {
        const existing = await User.findOne({ email: acc.email });
        if (existing) {
            console.log(`⚠️  Đã tồn tại: ${acc.email} (${acc.role}) — bỏ qua`);
            continue;
        }
        const hashed = await bcrypt.hash(acc.password, 10);
        await User.create({ ...acc, password: hashed });
        console.log(`✅ Tạo xong: ${acc.email} | role: ${acc.role} | pass: ${acc.password}`);
    }

    await mongoose.disconnect();
    console.log('\n🎉 Seed xong! Danh sách tài khoản:');
    console.log('┌─────────────────────────────┬──────────┬──────────┐');
    console.log('│ Email                        │ Password │ Role     │');
    console.log('├─────────────────────────────┼──────────┼──────────┤');
    ACCOUNTS.forEach(a => {
        console.log(`│ ${a.email.padEnd(28)} │ ${a.password.padEnd(8)} │ ${a.role.padEnd(8)} │`);
    });
    console.log('└─────────────────────────────┴──────────┴──────────┘');
};

seed().catch(err => {
    console.error('❌ Lỗi seed:', err.message);
    process.exit(1);
});
