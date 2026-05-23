const { createShopForOwner, getShopByOwner, updateShopByOwner } = require('../services/shopService');

const registerShop = async (req, res) => {
    try {
        const data = await createShopForOwner(req.user.id, req.user.email, req.body);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('registerShop error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getMyShop = async (req, res) => {
    try {
        const data = await getShopByOwner(req.user.id);
        if (!data) return res.status(404).json({ message: 'Shop chưa đăng ký.' });
        return res.status(200).json(data);
    } catch (error) {
        console.error('getMyShop error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateMyShop = async (req, res) => {
    try {
        const data = await updateShopByOwner(req.user.id, req.body);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateMyShop error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    registerShop,
    getMyShop,
    updateMyShop,
};
