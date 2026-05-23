const {
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
} = require('../services/vendorService');
const { updateReviewVisibility } = require('../services/reviewService');

const getVendorProducts = async (req, res) => {
    try {
        const data = await listVendorProducts(req.user.id);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('getVendorProducts error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getVendorProduct = async (req, res) => {
    try {
        const data = await getVendorProductDetail(req.user.id, req.params.productId);
        if (data.error) return res.status(404).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('getVendorProduct error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const createVendorProductHandler = async (req, res) => {
    try {
        const data = await createVendorProduct(req.user.id, req.body);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('createVendorProduct error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateVendorProductHandler = async (req, res) => {
    try {
        const data = await updateVendorProduct(req.user.id, req.params.productId, req.body);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateVendorProduct error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const removeVendorProductHandler = async (req, res) => {
    try {
        const data = await removeVendorProduct(req.user.id, req.params.productId);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('removeVendorProduct error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getVendorOrders = async (req, res) => {
    try {
        const data = await listVendorOrders(req.user.id);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('getVendorOrders error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateVendorOrderStatusHandler = async (req, res) => {
    try {
        const { status, note } = req.body;
        const data = await updateVendorOrderStatus(req.user.id, req.params.orderId, status, note);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateVendorOrderStatus error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getVendorRevenueHandler = async (req, res) => {
    try {
        const data = await getVendorRevenue(req.user.id);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('getVendorRevenue error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getVendorReviews = async (req, res) => {
    try {
        const data = await listVendorReviews(req.user.id);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('getVendorReviews error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateVendorReviewVisibility = async (req, res) => {
    try {
        const data = await updateReviewVisibility(req.params.reviewId, req.body.isVisible);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateVendorReviewVisibility error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getVendorFavorites = async (req, res) => {
    try {
        const data = await listVendorFavorites(req.user.id);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('getVendorFavorites error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
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
};
