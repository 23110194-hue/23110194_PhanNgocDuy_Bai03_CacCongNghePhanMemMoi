const { listFavorites, addFavorite, removeFavorite } = require('../services/favoriteService');

const getFavorites = async (req, res) => {
    try {
        const data = await listFavorites(req.user.email);
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getFavorites error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const addFavoriteHandler = async (req, res) => {
    try {
        const data = await addFavorite(req.user.email, req.params.productId);
        if (data.error) return res.status(400).json({ message: data.error });
        return res.status(200).json(data);
    } catch (error) {
        console.error('addFavorite error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const removeFavoriteHandler = async (req, res) => {
    try {
        const data = await removeFavorite(req.user.email, req.params.productId);
        return res.status(200).json(data);
    } catch (error) {
        console.error('removeFavorite error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    getFavorites,
    addFavoriteHandler,
    removeFavoriteHandler,
};
