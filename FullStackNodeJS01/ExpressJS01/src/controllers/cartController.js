const {
    getCartService,
    addToCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService,
} = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        const data = await getCartService(req.user.email);
        return res.status(200).json(data);
    } catch (error) {
        console.error('getCart error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const result = await addToCartService(req.user.email, productId, quantity || 1);
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error('addToCart error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        const result = await updateCartItemService(req.user.email, productId, quantity);
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error('updateCartItem error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await removeCartItemService(req.user.email, productId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('removeCartItem error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const clearCart = async (req, res) => {
    try {
        const result = await clearCartService(req.user.email);
        return res.status(200).json(result);
    } catch (error) {
        console.error('clearCart error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};
