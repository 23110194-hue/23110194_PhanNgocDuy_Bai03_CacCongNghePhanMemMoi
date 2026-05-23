const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: Number, required: true },
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'shop', default: null },
        slug: { type: String, required: true },
        title: { type: String, required: true },
        image: { type: String, default: '' },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
        discountPercent: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
    },
    { _id: false }
);

const shippingSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        note: { type: String, default: '' },
    },
    { _id: false }
);

const timelineSchema = new mongoose.Schema(
    {
        status: { type: String, required: true },
        at: { type: Date, required: true },
        note: { type: String, default: '' },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true, unique: true },
        userEmail: { type: String, required: true },
        userName: { type: String, default: '' },
        status: {
            type: String,
            enum: ['NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELED'],
            default: 'NEW',
        },
        cancelRequested: { type: Boolean, default: false },
        items: { type: [orderItemSchema], default: [] },
        summary: {
            totalQuantity: { type: Number, default: 0 },
            subtotal: { type: Number, default: 0 },
            shippingFee: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
        paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
        shippingAddress: { type: shippingSchema, required: true },
        timeline: { type: [timelineSchema], default: [] },
        confirmedAt: { type: Date },
        canceledAt: { type: Date },
        deliveredAt: { type: Date },
    },
    { timestamps: true }
);

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
