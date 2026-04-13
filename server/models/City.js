import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avg: { type: Number, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  zone: { type: String, enum: ['budget', 'standard', 'premium'], default: 'standard' }
});

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  range: { type: String, required: true }, // Display string like "₹5 - ₹80/hr"
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  areas: [areaSchema]
}, { timestamps: true });

export default mongoose.model('City', citySchema);
const City = mongoose.model('City', citySchema);
export { City };
