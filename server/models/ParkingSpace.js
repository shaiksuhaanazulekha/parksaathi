import mongoose from 'mongoose';

const parkingSchema = new mongoose.Schema({
    ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:        { type: String, required: true },
    description: String,
    address:     { type: String, required: true },
    city:        { type: String, required: true },
    area:        { type: String, required: true },
    type:        { type: String, enum: ['driveway', 'society', 'commercial', 'open'], default: 'driveway' },
    vehicles:    [{ type: String, enum: ['car', 'bike'] }],
    capacity:    { type: Number, default: 1 },
    photos:      [{
        url:      String,
        filename: String,
        size:     Number
    }],
    amenities: {
        covered:       { type: Boolean, default: false },
        cctv:          { type: Boolean, default: false },
        available24x7: { type: Boolean, default: true },
        lighting:      { type: Boolean, default: true },
        washArea:      { type: Boolean, default: false }
    },
    pricing: {
        basePrice:          { type: Number, required: true }, // Hourly
        peakPricingEnabled: { type: Boolean, default: true }
    },
    cityPricing: {
        min: Number,
        max: Number,
        avg: Number,
        zone: String
    },
    availability: {
        days:      [{ type: String }],
        startTime: { type: String, default: '00:00' },
        endTime:   { type: String, default: '23:59' }
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    status: { type: String, enum: ['live', 'paused', 'deleted'], default: 'live' },
    rating: { type: Number, default: 4.5 },
    blockedSlots: [{
        date:      String,
        startTime: String,
        endTime:   String,
        reason:    String
    }]
}, { 
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export default mongoose.model('ParkingSpace', parkingSchema);
