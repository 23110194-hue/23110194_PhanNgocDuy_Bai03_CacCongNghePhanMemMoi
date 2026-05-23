const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
        ownerEmail: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, default: '' },
        address: { type: String, default: '' },
        phone: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        walletBalance: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Shop = mongoose.model('shop', shopSchema);

module.exports = Shop;
