const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spaceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
    ownerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date:      { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
    duration:  { type: Number, required: true },
    pricing: {
        baseRate:       { type: Number, required: true },
        surgeMultiplier: { type: Number, default: 1.0 },
        coveredPremium:  { type: Number, default: 0 },
        subtotal:        { type: Number, required: true },
        platformFee:     { type: Number, required: true },
        couponCode:      String,
        couponDiscount: { type: Number, default: 0 },
        walletUsed:     { type: Number, default: 0 },
        totalAmount:    { type: Number, required: true }
    },
    paymentMethod:    { type: String, enum: ['upi', 'card', 'wallet'], default: 'upi' },
    paymentId:        String,
    razorpayOrderId:  String,
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    cancellation: {
        reason:      String,
        refundAmount: Number,
        cancelledAt: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
