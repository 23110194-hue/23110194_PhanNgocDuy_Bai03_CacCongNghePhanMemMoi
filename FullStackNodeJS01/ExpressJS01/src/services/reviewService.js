const Order = require('../models/order');
const ProductReview = require('../models/productReview');
const OrderReview = require('../models/orderReview');
const ShopReview = require('../models/shopReview');

const ensureRating = (rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5;

const createProductReview = async (userEmail, productId, rating, comment) => {
    if (!ensureRating(rating)) {
        return { error: 'Đánh giá phải từ 1 đến 5.' };
    }

    const delivered = await Order.findOne({
        userEmail,
        status: 'DELIVERED',
        'items.productId': Number(productId),
    });

    if (!delivered) {
        return { error: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và giao thành công.' };
    }

    const review = await ProductReview.findOneAndUpdate(
        { userEmail, productId: Number(productId) },
        { rating, comment: comment || '', isVisible: true },
        { new: true, upsert: true }
    );

    return review;
};

const createOrderReview = async (userEmail, orderId, rating, comment) => {
    if (!ensureRating(rating)) {
        return { error: 'Đánh giá phải từ 1 đến 5.' };
    }

    const order = await Order.findOne({ _id: orderId, userEmail, status: 'DELIVERED' });
    if (!order) {
        return { error: 'Bạn chỉ có thể đánh giá đơn hàng đã giao thành công.' };
    }

    const review = await OrderReview.findOneAndUpdate(
        { userEmail, orderId },
        { rating, comment: comment || '', isVisible: true },
        { new: true, upsert: true }
    );

    return review;
};

const createShopReview = async (userEmail, shopId, rating, comment) => {
    if (!ensureRating(rating)) {
        return { error: 'Đánh giá phải từ 1 đến 5.' };
    }

    const order = await Order.findOne({
        userEmail,
        status: 'DELIVERED',
        'items.shopId': shopId,
    });

    if (!order) {
        return { error: 'Bạn chỉ có thể đánh giá shop đã mua.' };
    }

    const review = await ShopReview.findOneAndUpdate(
        { userEmail, shopId },
        { rating, comment: comment || '', isVisible: true },
        { new: true, upsert: true }
    );

    return review;
};

const listProductReviews = async (productId) => {
    return ProductReview.find({ productId: Number(productId), isVisible: true }).sort({ createdAt: -1 });
};

const listOrderReview = async (orderId) => {
    return OrderReview.findOne({ orderId, isVisible: true });
};

const listShopReviews = async (shopId) => {
    return ShopReview.find({ shopId, isVisible: true }).sort({ createdAt: -1 });
};

const listReviewsForShopProducts = async (productIds) => {
    return ProductReview.find({ productId: { $in: productIds } }).sort({ createdAt: -1 });
};

const updateReviewVisibility = async (reviewId, isVisible) => {
    const review = await ProductReview.findByIdAndUpdate(
        reviewId,
        { isVisible: Boolean(isVisible) },
        { new: true }
    );
    if (!review) {
        return { error: 'Không tìm thấy đánh giá.' };
    }
    return review;
};

module.exports = {
    createProductReview,
    createOrderReview,
    createShopReview,
    listProductReviews,
    listOrderReview,
    listShopReviews,
    listReviewsForShopProducts,
    updateReviewVisibility,
};
