const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['flat', 'percentage'], required: true },
    value: { type: Number, required: true },
    maxDiscount: { type: Number, required: true },
    conditions: {
        firstBookingOnly: { type: Boolean, default: false },
        weekendOnly: { type: Boolean, default: false },
        monthlyOnly: { type: Boolean, default: false }
    },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
