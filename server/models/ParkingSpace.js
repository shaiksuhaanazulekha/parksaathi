const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    pricePerHour: { type: Number, required: true },
    photos: [{ type: String }],
    availabilitySchedule: { type: String }, // Can be structured more complexly if needed
    maxVehicles: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParkingSpace', parkingSpaceSchema);
