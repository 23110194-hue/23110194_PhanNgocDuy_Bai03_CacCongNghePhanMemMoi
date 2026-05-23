const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
    {
        productId: { type: Number, required: true },
        quantity: { type: Number, required: true },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        userEmail: { type: String, required: true, unique: true },
        items: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true }
);

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;
