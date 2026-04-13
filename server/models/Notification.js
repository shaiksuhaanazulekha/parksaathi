const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    type:      { type: String, enum: ['Booking', 'Payment', 'Review', 'General'], default: 'General' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    isRead:    { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
