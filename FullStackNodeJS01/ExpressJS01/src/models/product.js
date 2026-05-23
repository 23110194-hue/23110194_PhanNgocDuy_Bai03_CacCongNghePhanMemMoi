const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        author: { type: String, default: '' },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        discountPercent: { type: Number, default: 0 },
        isNew: { type: Boolean, default: false },
        isHot: { type: Boolean, default: false },
        stock: { type: Number, default: 0 },
        sold: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        publishedAt: { type: Date, default: Date.now },
        description: { type: String, default: '' },
        images: { type: [String], default: [] },
        tags: { type: [String], default: [] },
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'shop', default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Product = mongoose.model('product', productSchema);

module.exports = Product;
