const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema(
    {
        productId: { type: Number, required: true },
        userEmail: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

productReviewSchema.index({ productId: 1, userEmail: 1 }, { unique: true });

const ProductReview = mongoose.model('productReview', productReviewSchema);

module.exports = ProductReview;
