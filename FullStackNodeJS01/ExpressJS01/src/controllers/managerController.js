const {
    listVendors,
    updateVendorStatus,
    listVendorProducts,
    updateProductStatus,
} = require('../services/managerService');

const getVendors = async (req, res) => {
    try {
        const data = await listVendors();
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getVendors error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateVendorStatusHandler = async (req, res) => {
    try {
        const data = await updateVendorStatus(req.params.shopId, req.body.isActive);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateVendorStatus error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getManagerProducts = async (req, res) => {
    try {
        const data = await listVendorProducts();
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getManagerProducts error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateManagerProductStatus = async (req, res) => {
    try {
        const data = await updateProductStatus(req.params.productId, req.body.isActive);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateManagerProductStatus error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    getVendors,
    updateVendorStatusHandler,
    getManagerProducts,
    updateManagerProductStatus,
};
