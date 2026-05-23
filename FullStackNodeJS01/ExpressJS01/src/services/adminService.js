const User = require('../models/user');
const Shop = require('../models/shop');
const Product = require('../models/product');
const Order = require('../models/order');

const listUsers = async () => User.find({}).select('-password').sort({ createdAt: -1 });

const updateUserRole = async (userId, role) => {
    if (!['user', 'admin', 'vendor', 'manager'].includes(role)) {
        return { error: 'Role không hợp lệ.' };
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!user) return { error: 'User không tồn tại.' };
    return user;
};

const listProducts = async () => Product.find({}).sort({ createdAt: -1 });

const updateProductStatus = async (productId, isActive) => {
    const product = await Product.findOneAndUpdate(
        { id: Number(productId) },
        { isActive: Boolean(isActive) },
        { new: true }
    );
    if (!product) return { error: 'Sản phẩm không tồn tại.' };
    return product;
};

const listShops = async () => Shop.find({}).sort({ createdAt: -1 });

const updateShopStatus = async (shopId, isActive) => {
    const shop = await Shop.findByIdAndUpdate(
        shopId,
        { isActive: Boolean(isActive) },
        { new: true }
    );
    if (!shop) return { error: 'Shop không tồn tại.' };
    return shop;
};

const getRevenue = async () => {
    const orders = await Order.find({ status: 'DELIVERED' });
    const totalRevenue = orders.reduce((acc, order) => acc + order.summary.total, 0);
    return { totalRevenue, totalOrders: orders.length };
};

module.exports = {
    listUsers,
    updateUserRole,
    listProducts,
    updateProductStatus,
    listShops,
    updateShopStatus,
    getRevenue,
};
