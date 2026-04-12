const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type:        { type: String, enum: ['driveway', 'society', 'commercial', 'open'], default: 'driveway' },
    vehicles:    [{ type: String, enum: ['car', 'bike'] }],
    address:     { type: String, required: true },
    city:        { type: String, required: true },
    area:        { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    photos: [{ 
        driveId: String, 
        url: String 
    }],
    amenities: {
        covered: { type: Boolean, default: false },
        cctv:    { type: Boolean, default: false },
        available24x7: { type: Boolean, default: true },
        lighting: { type: Boolean, default: false },
        washArea: { type: Boolean, default: false }
    },
    capacity: { type: Number, default: 1 },
    availability: {
        days:      [{ type: String }], // ["Mon", "Tue"...]
        startTime: { type: String, default: '00:00' },
        endTime:   { type: String, default: '23:59' }
    },
    pricing: {
        basePrice:          { type: Number, required: true },
        peakPricingEnabled: { type: Boolean, default: true },
        peakMultiplier:     { type: Number, default: 1.3 },
        peakHours:          [{ type: String }], // ["08:00-10:00", "17:00-20:00"]
        weeklyDiscount:     { type: Number, default: 0.15 },
        monthlyDiscount:    { type: Number, default: 0.25 }
    },
    cityPricing: {
        min: Number, max: Number, avg: Number, zone: String
    },
    rating:        { type: Number, default: 0 },
    reviewCount:   { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    status:        { type: String, enum: ['live', 'paused', 'draft'], default: 'live' },
    blockedSlots: [{
        date: String, // YYYY-MM-DD
        startTime: String,
        endTime:   String,
        reason:    String
    }]
}, { timestamps: true });

module.exports = mongoose.model('ParkingSpace', parkingSchema);
