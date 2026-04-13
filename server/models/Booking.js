const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spaceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
    ownerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date:     { type: String, required: true },
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
    duration:  { type: Number, required: true },
    pricing: {
        baseRate:        Number,
        surgeMultiplier: Number,
        coveredPremium:  Number,
        subtotal:        Number,
        platformFee:     Number,
        couponCode:      String,
        couponDiscount:  Number,
        totalAmount:     { type: Number, required: true }
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
