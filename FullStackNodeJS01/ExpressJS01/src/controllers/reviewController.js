const {
    createProductReview,
    createOrderReview,
    createShopReview,
    listProductReviews,
    listOrderReview,
    listShopReviews,
} = require('../services/reviewService');

const createProductReviewHandler = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const data = await createProductReview(req.user.email, productId, Number(rating), comment);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('createProductReview error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const createOrderReviewHandler = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const data = await createOrderReview(req.user.email, orderId, Number(rating), comment);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('createOrderReview error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const createShopReviewHandler = async (req, res) => {
    try {
        const { shopId, rating, comment } = req.body;
        const data = await createShopReview(req.user.email, shopId, Number(rating), comment);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('createShopReview error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const data = await listProductReviews(req.params.productId);
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getProductReviews error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getOrderReview = async (req, res) => {
    try {
        const data = await listOrderReview(req.params.orderId);
        return res.status(200).json(data || null);
    } catch (error) {
        console.error('getOrderReview error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getShopReviews = async (req, res) => {
    try {
        const data = await listShopReviews(req.params.shopId);
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getShopReviews error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    createProductReviewHandler,
    createOrderReviewHandler,
    createShopReviewHandler,
    getProductReviews,
    getOrderReview,
    getShopReviews,
};
