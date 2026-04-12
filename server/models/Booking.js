const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Failed'], default: 'Unpaid' },
    stripePaymentId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
