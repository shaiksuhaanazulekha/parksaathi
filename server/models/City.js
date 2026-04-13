const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    range: { type: String, required: true }, // e.g. "₹5 — ₹80/hr"
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    areas: [{
        name: { type: String, required: true },
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        avg: { type: Number, required: true },
        zone: { type: String, enum: ['budget', 'standard', 'premium'], required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);
