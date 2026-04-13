import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['Driver', 'Owner'], default: 'Driver' },
    phone:    { type: String },
    location: {
        city: String,
        area: String
    },
    profilePhoto: {
        url: { type: String, default: '' },
        filename: String
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
