const {
    listUsers,
    updateUserRole,
    listProducts,
    updateProductStatus,
    listShops,
    updateShopStatus,
    getRevenue,
} = require('../services/adminService');

const getUsers = async (req, res) => {
    try {
        const data = await listUsers();
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getUsers error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateUserRoleHandler = async (req, res) => {
    try {
        const data = await updateUserRole(req.params.userId, req.body.role);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateUserRole error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getAdminProducts = async (req, res) => {
    try {
        const data = await listProducts();
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getAdminProducts error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateAdminProductStatus = async (req, res) => {
    try {
        const data = await updateProductStatus(req.params.productId, req.body.isActive);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateAdminProductStatus error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getAdminShops = async (req, res) => {
    try {
        const data = await listShops();
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getAdminShops error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateAdminShopStatus = async (req, res) => {
    try {
        const data = await updateShopStatus(req.params.shopId, req.body.isActive);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateAdminShopStatus error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getAdminRevenue = async (req, res) => {
    try {
        const data = await getRevenue();
        return res.status(200).json(data);
    } catch (error) {
        console.error('getAdminRevenue error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    getUsers,
    updateUserRoleHandler,
    getAdminProducts,
    updateAdminProductStatus,
    getAdminShops,
    updateAdminShopStatus,
    getAdminRevenue,
};
