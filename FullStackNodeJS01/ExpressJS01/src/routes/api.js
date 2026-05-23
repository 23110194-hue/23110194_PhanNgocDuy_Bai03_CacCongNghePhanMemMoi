const express = require('express');
const { getApiStatus } = require('../controllers/commonController');
const {
    createUser,
    handleVerifyRegisterOTP,
    handleLogin,
    getUser,
    getAccount,
    getUserProfile,
    getAdminProfile,
    handleSendForgotPasswordOTP,
    handleVerifyForgotPasswordOTP,
} = require('../controllers/userController');

const { apiGetProducts, apiGetProductDetail } = require('../controllers/homeController');

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require('../controllers/cartController');

const {
    createOrder,
    getOrders,
    getAllOrders,
    getOrderDetail,
    cancelOrder,
    updateOrderStatus,
} = require('../controllers/orderController');

const { registerShop, getMyShop, updateMyShop } = require('../controllers/shopController');
const {
    createProductReviewHandler,
    createOrderReviewHandler,
    createShopReviewHandler,
    getProductReviews,
    getOrderReview,
    getShopReviews,
} = require('../controllers/reviewController');
const {
    getFavorites,
    addFavoriteHandler,
    removeFavoriteHandler,
} = require('../controllers/favoriteController');
const {
    getVendorProducts,
    getVendorProduct,
    createVendorProductHandler,
    updateVendorProductHandler,
    removeVendorProductHandler,
    getVendorOrders,
    updateVendorOrderStatusHandler,
    getVendorRevenueHandler,
    getVendorReviews,
    updateVendorReviewVisibility,
    getVendorFavorites,
} = require('../controllers/vendorController');
const {
    getVendors,
    updateVendorStatusHandler,
    getManagerProducts,
    updateManagerProductStatus,
} = require('../controllers/managerController');
const {
    getUsers,
    updateUserRoleHandler,
    getAdminProducts,
    updateAdminProductStatus,
    getAdminShops,
    updateAdminShopStatus,
    getAdminRevenue,
} = require('../controllers/adminController');

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

routerAPI.get('/', getApiStatus);

routerAPI.post('/register', registerLimiter, validateRegister, createUser);
routerAPI.post('/verify-register', otpLimiter, validateVerifyOTP, handleVerifyRegisterOTP);
routerAPI.post('/login', loginLimiter, validateLogin, handleLogin);
routerAPI.post('/forgot-password', otpLimiter, validateForgotPassword, handleSendForgotPasswordOTP);
routerAPI.post('/verify-forgot-password', otpLimiter, validateResetPassword, handleVerifyForgotPasswordOTP);

routerAPI.get('/account', delay, getAccount);
routerAPI.get('/user', getUser);
routerAPI.get('/user/profile', authorizeRole('user', 'admin'), getUserProfile);
routerAPI.get('/admin/profile', authorizeRole('admin'), getAdminProfile);

routerAPI.get('/products', apiGetProducts);
routerAPI.get('/products/:slug', apiGetProductDetail);

routerAPI.get('/cart', getCart);
routerAPI.post('/cart/items', addToCart);
routerAPI.patch('/cart/items/:productId', updateCartItem);
routerAPI.delete('/cart/items/:productId', removeCartItem);
routerAPI.delete('/cart', clearCart);

routerAPI.post('/orders', createOrder);
routerAPI.get('/orders', getOrders);
routerAPI.get('/orders/admin', authorizeRole('admin'), getAllOrders);
routerAPI.get('/orders/:id', getOrderDetail);
routerAPI.patch('/orders/:id/cancel', cancelOrder);
routerAPI.patch('/orders/:id/status', authorizeRole('admin'), updateOrderStatus);

routerAPI.get('/favorites', authorizeRole('user', 'vendor', 'manager', 'admin'), getFavorites);
routerAPI.post('/favorites/:productId', authorizeRole('user', 'vendor', 'manager', 'admin'), addFavoriteHandler);
routerAPI.delete('/favorites/:productId', authorizeRole('user', 'vendor', 'manager', 'admin'), removeFavoriteHandler);

routerAPI.get('/reviews/product/:productId', getProductReviews);
routerAPI.get('/reviews/order/:orderId', authorizeRole('user', 'admin'), getOrderReview);
routerAPI.get('/reviews/shop/:shopId', getShopReviews);
routerAPI.post('/reviews/product', authorizeRole('user', 'vendor', 'manager', 'admin'), createProductReviewHandler);
routerAPI.post('/reviews/order', authorizeRole('user', 'vendor', 'manager', 'admin'), createOrderReviewHandler);
routerAPI.post('/reviews/shop', authorizeRole('user', 'vendor', 'manager', 'admin'), createShopReviewHandler);

routerAPI.post('/shops/register', authorizeRole('user', 'vendor'), registerShop);
routerAPI.get('/shops/me', authorizeRole('vendor', 'user'), getMyShop);
routerAPI.patch('/shops/me', authorizeRole('vendor', 'user'), updateMyShop);

routerAPI.get('/vendor/products', authorizeRole('vendor'), getVendorProducts);
routerAPI.get('/vendor/products/:productId', authorizeRole('vendor'), getVendorProduct);
routerAPI.post('/vendor/products', authorizeRole('vendor'), createVendorProductHandler);
routerAPI.patch('/vendor/products/:productId', authorizeRole('vendor'), updateVendorProductHandler);
routerAPI.delete('/vendor/products/:productId', authorizeRole('vendor'), removeVendorProductHandler);
routerAPI.get('/vendor/orders', authorizeRole('vendor'), getVendorOrders);
routerAPI.patch('/vendor/orders/:orderId/status', authorizeRole('vendor'), updateVendorOrderStatusHandler);
routerAPI.get('/vendor/revenue', authorizeRole('vendor'), getVendorRevenueHandler);
routerAPI.get('/vendor/reviews', authorizeRole('vendor'), getVendorReviews);
routerAPI.patch('/vendor/reviews/:reviewId', authorizeRole('vendor'), updateVendorReviewVisibility);
routerAPI.get('/vendor/favorites', authorizeRole('vendor'), getVendorFavorites);

routerAPI.get('/manager/vendors', authorizeRole('manager'), getVendors);
routerAPI.patch('/manager/vendors/:shopId/status', authorizeRole('manager'), updateVendorStatusHandler);
routerAPI.get('/manager/products', authorizeRole('manager'), getManagerProducts);
routerAPI.patch('/manager/products/:productId/status', authorizeRole('manager'), updateManagerProductStatus);

routerAPI.get('/admin/users', authorizeRole('admin'), getUsers);
routerAPI.patch('/admin/users/:userId/role', authorizeRole('admin'), updateUserRoleHandler);
routerAPI.get('/admin/shops', authorizeRole('admin'), getAdminShops);
routerAPI.patch('/admin/shops/:shopId/status', authorizeRole('admin'), updateAdminShopStatus);
routerAPI.get('/admin/products', authorizeRole('admin'), getAdminProducts);
routerAPI.patch('/admin/products/:productId/status', authorizeRole('admin'), updateAdminProductStatus);
routerAPI.get('/admin/revenue', authorizeRole('admin'), getAdminRevenue);

module.exports = routerAPI;