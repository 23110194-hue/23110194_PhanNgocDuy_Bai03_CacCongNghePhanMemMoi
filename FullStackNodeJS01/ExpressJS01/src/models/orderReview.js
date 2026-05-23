const mongoose = require('mongoose');

const orderReviewSchema = new mongoose.Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
        userEmail: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

orderReviewSchema.index({ orderId: 1, userEmail: 1 }, { unique: true });

const OrderReview = mongoose.model('orderReview', orderReviewSchema);

module.exports = OrderReview;
