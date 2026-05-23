const Favorite = require('../models/favorite');
const { getDecoratedProductById, getProductById } = require('./productService');

const listFavorites = async (userEmail) => {
    const favorites = await Favorite.find({ userEmail }).sort({ createdAt: -1 });
    const items = await Promise.all(
        favorites.map(async (fav) => getDecoratedProductById(fav.productId))
    );

    return items.filter(Boolean);
};

const addFavorite = async (userEmail, productId) => {
    const product = await getProductById(productId);
    if (!product) {
        return { error: 'Sản phẩm không tồn tại.' };
    }

    await Favorite.findOneAndUpdate(
        { userEmail, productId: Number(productId) },
        { userEmail, productId: Number(productId) },
        { upsert: true, new: true }
    );

    return { success: true };
};

const removeFavorite = async (userEmail, productId) => {
    await Favorite.deleteOne({ userEmail, productId: Number(productId) });
    return { success: true };
};

module.exports = {
    listFavorites,
    addFavorite,
    removeFavorite,
};
