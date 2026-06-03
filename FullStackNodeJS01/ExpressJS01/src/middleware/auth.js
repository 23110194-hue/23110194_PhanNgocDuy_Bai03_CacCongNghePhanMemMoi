require('dotenv').config();
const jwt = require('jsonwebtoken');

// Route chỉ public với GET (không cần đăng nhập để xem)
const GET_ONLY_WHITE_LIST = [
    '/reviews/product',
    '/reviews/shop',
];

// Route public với mọi method
const WHITE_LIST = [
    '/',
    '/register',
    '/login',
    '/verify-register',
    '/forgot-password',
    '/verify-forgot-password',
    '/products',
];

const auth = (req, res, next) => {
    const baseUrl = req.originalUrl.split('?')[0];

    // Kiểm tra public với mọi method
    const isPublic = WHITE_LIST.some((item) => {
        if (item === '/') return baseUrl === '/v1/api' || baseUrl === '/v1/api/';
        return baseUrl === `/v1/api${item}` || baseUrl.startsWith(`/v1/api${item}/`);
    });
    if (isPublic) return next();

    // Kiểm tra public chỉ với GET
    if (req.method === 'GET') {
        const isGetPublic = GET_ONLY_WHITE_LIST.some((item) =>
            baseUrl === `/v1/api${item}` || baseUrl.startsWith(`/v1/api${item}/`)
        );
        if (isGetPublic) return next();
    }

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
            role: (decoded.role || 'user').toLowerCase(),
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
        const userRole = (req.user.role || '').toLowerCase();
        const allowedRoles = roles.map((r) => r.toLowerCase());
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Bạn không có quyền truy cập. Yêu cầu role: [${roles.join(', ')}]`,
            });
        }
        next();
    };
};

module.exports = { auth, authorizeRole };