const mongoose = require('mongoose');

const shopReviewSchema = new mongoose.Schema(
    {
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'shop', required: true },
        userEmail: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

shopReviewSchema.index({ shopId: 1, userEmail: 1 }, { unique: true });

const ShopReview = mongoose.model('shopReview', shopReviewSchema);

module.exports = ShopReview;
