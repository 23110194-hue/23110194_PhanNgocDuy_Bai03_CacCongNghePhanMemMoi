import axios from './axios.customize';

const createUserApi = (name, email, password) =>
    axios.post("/v1/api/register", { name, email, password });

const verifyRegisterOTPApi = (email, otp) =>
    axios.post("/v1/api/verify-register", { email, otp });

const loginApi = (email, password) =>
    axios.post("/v1/api/login", { email, password });

const sendForgotPasswordOTPApi = (email) =>
    axios.post("/v1/api/forgot-password", { email });

const verifyForgotPasswordOTPApi = (email, otp, newPassword) =>
    axios.post("/v1/api/verify-forgot-password", { email, otp, newPassword });

const getUserApi = () =>
    axios.get("/v1/api/user");

const getUserProfileApi = () =>
    axios.get("/v1/api/user/profile");

const updateProfileApi = (data) =>
    axios.patch("/v1/api/user/profile", data);

const getAdminProfileApi = () =>
    axios.get("/v1/api/admin/profile");

const getProductsApi = (params) =>
    axios.get("/v1/api/products", { params });

const getProductDetailApi = (slug) =>
    axios.get(`/v1/api/products/${slug}`);

const getCartApi = () =>
    axios.get("/v1/api/cart");

const addToCartApi = (productId, quantity = 1) =>
    axios.post("/v1/api/cart/items", { productId, quantity });

const updateCartItemApi = (productId, quantity) =>
    axios.patch(`/v1/api/cart/items/${productId}`, { quantity });

const removeCartItemApi = (productId) =>
    axios.delete(`/v1/api/cart/items/${productId}`);

const clearCartApi = () =>
    axios.delete("/v1/api/cart");

const createOrderApi = (payload) =>
    axios.post("/v1/api/orders", payload);

const getOrdersApi = () =>
    axios.get("/v1/api/orders");

const getAdminOrdersApi = () =>
    axios.get("/v1/api/orders/admin");

const getOrderDetailApi = (orderId) =>
    axios.get(`/v1/api/orders/${orderId}`);

const cancelOrderApi = (orderId) =>
    axios.patch(`/v1/api/orders/${orderId}/cancel`);

const updateOrderStatusApi = (orderId, status, note = "") =>
    axios.patch(`/v1/api/orders/${orderId}/status`, { status, note });

const getFavoritesApi = () =>
    axios.get('/v1/api/favorites');

const addFavoriteApi = (productId) =>
    axios.post(`/v1/api/favorites/${productId}`);

const removeFavoriteApi = (productId) =>
    axios.delete(`/v1/api/favorites/${productId}`);

const getProductReviewsApi = (productId) =>
    axios.get(`/v1/api/reviews/product/${productId}`);

const getOrderReviewApi = (orderId) =>
    axios.get(`/v1/api/reviews/order/${orderId}`);

const getShopReviewsApi = (shopId) =>
    axios.get(`/v1/api/reviews/shop/${shopId}`);

const createProductReviewApi = (productId, rating, comment) =>
    axios.post('/v1/api/reviews/product', { productId, rating, comment });

const createOrderReviewApi = (orderId, rating, comment) =>
    axios.post('/v1/api/reviews/order', { orderId, rating, comment });

const createShopReviewApi = (shopId, rating, comment) =>
    axios.post('/v1/api/reviews/shop', { shopId, rating, comment });

const registerShopApi = (payload) =>
    axios.post('/v1/api/shops/register', payload);

const getMyShopApi = () =>
    axios.get('/v1/api/shops/me');

const updateMyShopApi = (payload) =>
    axios.patch('/v1/api/shops/me', payload);

const getVendorProductsApi = () =>
    axios.get('/v1/api/vendor/products');

const getVendorProductApi = (productId) =>
    axios.get(`/v1/api/vendor/products/${productId}`);

const createVendorProductApi = (payload) =>
    axios.post('/v1/api/vendor/products', payload);

const updateVendorProductApi = (productId, payload) =>
    axios.patch(`/v1/api/vendor/products/${productId}`, payload);

const removeVendorProductApi = (productId) =>
    axios.delete(`/v1/api/vendor/products/${productId}`);

const getVendorOrdersApi = () =>
    axios.get('/v1/api/vendor/orders');

const updateVendorOrderStatusApi = (orderId, status, note = '') =>
    axios.patch(`/v1/api/vendor/orders/${orderId}/status`, { status, note });

const getVendorRevenueApi = () =>
    axios.get('/v1/api/vendor/revenue');

const getVendorReviewsApi = () =>
    axios.get('/v1/api/vendor/reviews');

const updateVendorReviewVisibilityApi = (reviewId, isVisible) =>
    axios.patch(`/v1/api/vendor/reviews/${reviewId}`, { isVisible });

const getVendorFavoritesApi = () =>
    axios.get('/v1/api/vendor/favorites');

const getManagerVendorsApi = () =>
    axios.get('/v1/api/manager/vendors');

const updateManagerVendorStatusApi = (shopId, isActive) =>
    axios.patch(`/v1/api/manager/vendors/${shopId}/status`, { isActive });

const getManagerProductsApi = () =>
    axios.get('/v1/api/manager/products');

const updateManagerProductStatusApi = (productId, isActive) =>
    axios.patch(`/v1/api/manager/products/${productId}/status`, { isActive });

const getAdminUsersApi = () =>
    axios.get('/v1/api/admin/users');

const updateAdminUserRoleApi = (userId, role) =>
    axios.patch(`/v1/api/admin/users/${userId}/role`, { role });

const getAdminProductsApi = () =>
    axios.get('/v1/api/admin/products');

const updateAdminProductStatusApi = (productId, isActive) =>
    axios.patch(`/v1/api/admin/products/${productId}/status`, { isActive });

const getAdminShopsApi = () =>
    axios.get('/v1/api/admin/shops');

const updateAdminShopStatusApi = (shopId, isActive) =>
    axios.patch(`/v1/api/admin/shops/${shopId}/status`, { isActive });

const getAdminRevenueApi = () =>
    axios.get('/v1/api/admin/revenue');

export {
    createUserApi,
    verifyRegisterOTPApi,
    loginApi,
    sendForgotPasswordOTPApi,
    verifyForgotPasswordOTPApi,
    getUserApi,
    getUserProfileApi,
    updateProfileApi,
    getAdminProfileApi,
    getProductsApi,
    getProductDetailApi,
    getCartApi,
    addToCartApi,
    updateCartItemApi,
    removeCartItemApi,
    clearCartApi,
    createOrderApi,
    getOrdersApi,
    getAdminOrdersApi,
    getOrderDetailApi,
    cancelOrderApi,
    updateOrderStatusApi,
    getFavoritesApi,
    addFavoriteApi,
    removeFavoriteApi,
    getProductReviewsApi,
    getOrderReviewApi,
    getShopReviewsApi,
    createProductReviewApi,
    createOrderReviewApi,
    createShopReviewApi,
    registerShopApi,
    getMyShopApi,
    updateMyShopApi,
    getVendorProductsApi,
    getVendorProductApi,
    createVendorProductApi,
    updateVendorProductApi,
    removeVendorProductApi,
    getVendorOrdersApi,
    updateVendorOrderStatusApi,
    getVendorRevenueApi,
    getVendorReviewsApi,
    updateVendorReviewVisibilityApi,
    getVendorFavoritesApi,
    getManagerVendorsApi,
    updateManagerVendorStatusApi,
    getManagerProductsApi,
    updateManagerProductStatusApi,
    getAdminUsersApi,
    updateAdminUserRoleApi,
    getAdminProductsApi,
    updateAdminProductStatusApi,
    getAdminShopsApi,
    updateAdminShopStatusApi,
    getAdminRevenueApi,
};