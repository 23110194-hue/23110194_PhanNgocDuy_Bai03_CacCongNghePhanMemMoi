require('dotenv').config();
const jwt = require('jsonwebtoken');

const WHITE_LIST = [
    '/',
    '/register',
    '/login',
    '/verify-register',
    '/forgot-password',
    '/verify-forgot-password',
    '/products',
    '/reviews/product',
    '/reviews/shop',
];

const auth = (req, res, next) => {
    const baseUrl = req.originalUrl.split('?')[0];
    const isPublic = WHITE_LIST.some((item) => {
        if (item === '/') return baseUrl === '/v1/api' || baseUrl === '/v1/api/';
        return baseUrl === `/v1/api${item}` || baseUrl.startsWith(`/v1/api${item}/`);
    });

    if (isPublic) return next();

    const token = req?.headers?.authorization?.split(' ')?.[1];
    if (!token) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc token đã hết hạn' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role || 'user',
        };
        next();
    } catch {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Bạn không có quyền truy cập. Yêu cầu role: [${roles.join(', ')}]`,
            });
        }
        next();
    };
};

module.exports = { auth, authorizeRole };