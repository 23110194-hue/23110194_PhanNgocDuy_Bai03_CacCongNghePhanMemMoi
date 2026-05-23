const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
    {
        userEmail: { type: String, required: true },
        productId: { type: Number, required: true },
    },
    { timestamps: true }
);

favoriteSchema.index({ userEmail: 1, productId: 1 }, { unique: true });

const Favorite = mongoose.model('favorite', favoriteSchema);

module.exports = Favorite;
