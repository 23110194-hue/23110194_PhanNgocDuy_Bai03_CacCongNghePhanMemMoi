const Cart = require('../models/cart');
const { getDecoratedProductById, getProductById } = require('./productService');

const buildCartItem = async (cartItem) => {
    const decorated = await getDecoratedProductById(cartItem.productId);
    if (!decorated) {
        return {
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            isAvailable: false,
        };
    }

    const quantity = cartItem.quantity;
    const lineTotal = decorated.finalPrice * quantity;

    return {
        productId: decorated.id,
        slug: decorated.slug,
        title: decorated.title,
        image: decorated.images?.[0] || '',
        price: decorated.price,
        finalPrice: decorated.finalPrice,
        discountPercent: decorated.discountPercent || 0,
        quantity,
        stock: decorated.stock,
        lineTotal,
        hasDiscount: decorated.hasDiscount,
        isAvailable: true,
    };
};

const buildCartResponse = async (cart) => {
    const items = await Promise.all((cart?.items || []).map(buildCartItem));

    const summary = items.reduce(
        (acc, item) => {
            if (item.isAvailable) {
                acc.totalQuantity += item.quantity;
                acc.subtotal += item.lineTotal;
            }
            return acc;
        },
        { totalQuantity: 0, subtotal: 0 }
    );

    return {
        items,
        summary: {
            ...summary,
            shippingFee: 0,
            total: summary.subtotal,
        },
    };
};

const getOrCreateCart = async (userEmail) => {
    let cart = await Cart.findOne({ userEmail });
    if (!cart) {
        cart = await Cart.create({ userEmail, items: [] });
    }
    return cart;
};

const getCartService = async (userEmail) => {
    const cart = await getOrCreateCart(userEmail);
    return buildCartResponse(cart);
};

const addToCartService = async (userEmail, productId, quantity) => {
    const product = await getProductById(productId);
    if (!product) {
        return { error: 'Sản phẩm không tồn tại.' };
    }

    const normalizedQty = parseInt(Number(quantity), 10);
    if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
        return { error: 'Số lượng không hợp lệ.' };
    }

    const cart = await getOrCreateCart(userEmail);
    const existing = cart.items.find((item) => Number(item.productId) === Number(productId));

    const nextQuantity = (existing?.quantity || 0) + normalizedQty;
    if (nextQuantity > product.stock) {
        return { error: 'Số lượng vượt quá tồn kho.' };
    }

    if (existing) {
        existing.quantity = nextQuantity;
    } else {
        cart.items.push({ productId: Number(productId), quantity: normalizedQty });
    }

    await cart.save();
    return buildCartResponse(cart);
};

const updateCartItemService = async (userEmail, productId, quantity) => {
    const product = await getProductById(productId);
    if (!product) {
        return { error: 'Sản phẩm không tồn tại.' };
    }

    const normalizedQty = parseInt(Number(quantity), 10);
    if (!Number.isFinite(normalizedQty)) {
        return { error: 'Số lượng không hợp lệ.' };
    }

    const cart = await getOrCreateCart(userEmail);
    const existing = cart.items.find((item) => Number(item.productId) === Number(productId));
    if (!existing) {
        return { error: 'Sản phẩm chưa có trong giỏ hàng.' };
    }

    if (normalizedQty <= 0) {
        cart.items = cart.items.filter((item) => Number(item.productId) !== Number(productId));
    } else {
        if (normalizedQty > product.stock) {
            return { error: 'Số lượng vượt quá tồn kho.' };
        }
        existing.quantity = normalizedQty;
    }

    await cart.save();
    return buildCartResponse(cart);
};

const removeCartItemService = async (userEmail, productId) => {
    const cart = await getOrCreateCart(userEmail);
    cart.items = cart.items.filter((item) => Number(item.productId) !== Number(productId));
    await cart.save();
    return buildCartResponse(cart);
};

const clearCartService = async (userEmail) => {
    const cart = await getOrCreateCart(userEmail);
    cart.items = [];
    await cart.save();
    return buildCartResponse(cart);
};

module.exports = {
    getCartService,
    addToCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService,
};
