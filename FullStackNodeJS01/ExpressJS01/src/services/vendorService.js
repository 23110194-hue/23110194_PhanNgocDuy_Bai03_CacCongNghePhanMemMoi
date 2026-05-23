const Product = require('../models/product');
const Order = require('../models/order');
const ProductReview = require('../models/productReview');
const Favorite = require('../models/favorite');
const { getNextProductId, getProductById } = require('./productService');
const { getShopByOwner } = require('./shopService');
const { updateOrderStatusService } = require('./orderService');

const slugify = (value) => {
    return value
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

const buildUniqueSlug = async (title) => {
    const base = slugify(title) || `product-${Date.now()}`;
    let slug = base;
    let counter = 1;
    while (await Product.exists({ slug })) {
        slug = `${base}-${counter}`;
        counter += 1;
    }
    return slug;
};

const listVendorProducts = async (ownerId) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };
    const products = await Product.find({ shopId: shop._id }).sort({ createdAt: -1 });
    return { shop, products };
};

const createVendorProduct = async (ownerId, payload) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    if (!payload?.title || !payload?.category || !payload?.price) {
        return { error: 'Vui lòng nhập đầy đủ thông tin sản phẩm.' };
    }

    const nextId = await getNextProductId();
    const slug = await buildUniqueSlug(payload.title);

    const product = await Product.create({
        id: nextId,
        slug,
        title: payload.title,
        author: payload.author || '',
        category: payload.category,
        price: Number(payload.price),
        discountPercent: Number(payload.discountPercent || 0),
        isNew: Boolean(payload.isNew),
        isHot: Boolean(payload.isHot),
        stock: Number(payload.stock || 0),
        sold: 0,
        views: 0,
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
        description: payload.description || '',
        images: Array.isArray(payload.images) ? payload.images : (payload.images ? payload.images.split(',').map((img) => img.trim()) : []),
        tags: Array.isArray(payload.tags) ? payload.tags : (payload.tags ? payload.tags.split(',').map((tag) => tag.trim()) : []),
        shopId: shop._id,
        isActive: true,
    });

    return product;
};

const updateVendorProduct = async (ownerId, productId, payload) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const product = await Product.findOne({ id: Number(productId), shopId: shop._id });
    if (!product) return { error: 'Sản phẩm không tồn tại.' };

    if (payload?.title && payload.title !== product.title) {
        product.title = payload.title;
        product.slug = await buildUniqueSlug(payload.title);
    }

    product.author = payload?.author ?? product.author;
    product.category = payload?.category ?? product.category;
    if (payload?.price !== undefined) product.price = Number(payload.price);
    if (payload?.discountPercent !== undefined) product.discountPercent = Number(payload.discountPercent);
    if (payload?.stock !== undefined) product.stock = Number(payload.stock);
    product.isNew = payload?.isNew ?? product.isNew;
    product.isHot = payload?.isHot ?? product.isHot;
    product.description = payload?.description ?? product.description;
    if (payload?.images) {
        product.images = Array.isArray(payload.images) ? payload.images : payload.images.split(',').map((img) => img.trim());
    }
    if (payload?.tags) {
        product.tags = Array.isArray(payload.tags) ? payload.tags : payload.tags.split(',').map((tag) => tag.trim());
    }
    if (payload?.isActive !== undefined) product.isActive = Boolean(payload.isActive);

    await product.save();
    return product;
};

const removeVendorProduct = async (ownerId, productId) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const product = await Product.findOneAndUpdate(
        { id: Number(productId), shopId: shop._id },
        { isActive: false },
        { new: true }
    );

    if (!product) return { error: 'Sản phẩm không tồn tại.' };
    return product;
};

const listVendorOrders = async (ownerId) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const orders = await Order.find({ 'items.shopId': shop._id }).sort({ createdAt: -1 });
    const items = orders.map((order) => {
        const shopItems = order.items.filter((item) => String(item.shopId) === String(shop._id));
        const subtotal = shopItems.reduce((acc, item) => acc + item.lineTotal, 0);
        return {
            ...order.toObject(),
            items: shopItems,
            shopSummary: {
                totalQuantity: shopItems.reduce((acc, item) => acc + item.quantity, 0),
                subtotal,
            },
        };
    });

    return { shop, orders: items };
};

const updateVendorOrderStatus = async (ownerId, orderId, status, note) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const order = await Order.findById(orderId);
    if (!order) return { error: 'Đơn hàng không tồn tại.' };

    const hasItem = order.items.some((item) => String(item.shopId) === String(shop._id));
    if (!hasItem) return { error: 'Bạn không có quyền cập nhật đơn hàng này.' };

    return updateOrderStatusService(orderId, status, note);
};

const getVendorRevenue = async (ownerId) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const orders = await Order.find({ status: 'DELIVERED', 'items.shopId': shop._id });
    const revenue = orders.reduce((acc, order) => {
        const sum = order.items
            .filter((item) => String(item.shopId) === String(shop._id))
            .reduce((total, item) => total + item.lineTotal, 0);
        return acc + sum;
    }, 0);

    return { shop, revenue, totalOrders: orders.length };
};

const listVendorReviews = async (ownerId) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const products = await Product.find({ shopId: shop._id }).select('id title');
    const productIds = products.map((item) => item.id);

    const reviews = await ProductReview.find({ productId: { $in: productIds } }).sort({ createdAt: -1 });
    return { shop, reviews, products };
};

const listVendorFavorites = async (ownerId) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const products = await Product.find({ shopId: shop._id }).select('id title');
    const productIds = products.map((item) => item.id);

    const favorites = await Favorite.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]);

    return { shop, favorites, products };
};

const getVendorProductDetail = async (ownerId, productId) => {
    const shop = await getShopByOwner(ownerId);
    if (!shop) return { error: 'Shop chưa đăng ký.' };

    const product = await getProductById(productId);
    if (!product || String(product.shopId) !== String(shop._id)) {
        return { error: 'Sản phẩm không tồn tại.' };
    }
    return product;
};

module.exports = {
    listVendorProducts,
    createVendorProduct,
    updateVendorProduct,
    removeVendorProduct,
    listVendorOrders,
    updateVendorOrderStatus,
    getVendorRevenue,
    listVendorReviews,
    listVendorFavorites,
    getVendorProductDetail,
};
