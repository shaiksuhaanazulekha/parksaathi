const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    city: { type: String, required: true, unique: true },
    areas: [{
        name: { type: String, required: true },
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        avg: { type: Number, required: true },
        zone: { type: String, enum: ['budget', 'standard', 'premium'], default: 'standard' },
        coordinates: { lat: Number, lng: Number }
    }]
});

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['flat', 'percent'], default: 'flat' },
    value: { type: Number, required: true },
    minBooking: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 50 },
    newOnly: { type: Boolean, default: false },
    weekendOnly: { type: Boolean, default: false },
    monthlyOnly: { type: Boolean, default: false }
});

module.exports = {
    City: mongoose.model('City', citySchema),
    Coupon: mongoose.model('Coupon', couponSchema)
};
