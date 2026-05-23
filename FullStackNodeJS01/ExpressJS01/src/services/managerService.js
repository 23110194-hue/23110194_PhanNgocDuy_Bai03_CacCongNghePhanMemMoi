const Shop = require('../models/shop');
const Product = require('../models/product');

const listVendors = async () => Shop.find({}).sort({ createdAt: -1 });

const updateVendorStatus = async (shopId, isActive) => {
    const shop = await Shop.findByIdAndUpdate(
        shopId,
        { isActive: Boolean(isActive) },
        { new: true }
    );
    if (!shop) return { error: 'Shop không tồn tại.' };
    return shop;
};

const listVendorProducts = async () => Product.find({}).sort({ createdAt: -1 });

const updateProductStatus = async (productId, isActive) => {
    const product = await Product.findOneAndUpdate(
        { id: Number(productId) },
        { isActive: Boolean(isActive) },
        { new: true }
    );
    if (!product) return { error: 'Sản phẩm không tồn tại.' };
    return product;
};

module.exports = {
    listVendors,
    updateVendorStatus,
    listVendorProducts,
    updateProductStatus,
};
