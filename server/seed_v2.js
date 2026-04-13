require('dotenv').config();
const mongoose = require('mongoose');
const City = require('./models/City');
const ParkingSpace = require('./models/ParkingSpace');
const Booking = require('./models/Booking');
const Coupon = require('./models/Coupon');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/parksaathi';

const coupons = [
    { code: 'PARK20', type: 'flat', value: 20, maxDiscount: 20 },
    { code: 'SAATHI10', type: 'percentage', value: 10, maxDiscount: 50 },
    { code: 'FIRST50', type: 'flat', value: 50, maxDiscount: 50, conditions: { firstBookingOnly: true } },
    { code: 'WEEKEND15', type: 'percentage', value: 15, maxDiscount: 100, conditions: { weekendOnly: true } },
    { code: 'MONTHLY25', type: 'percentage', value: 25, maxDiscount: 500, conditions: { monthlyOnly: true } }
];

const data = [
    {
        name: "Hyderabad", range: "₹5 — ₹80/hr", min: 5, max: 80,
        areas: [
            { name: "Banjara Hills", min: 20, max: 60, avg: 35, zone: "standard" },
            { name: "Jubilee Hills", min: 30, max: 80, avg: 50, zone: "premium" },
            { name: "Gachibowli", min: 10, max: 40, avg: 25, zone: "standard" },
            { name: "Kukatpally", min: 5, max: 25, avg: 15, zone: "budget" }
        ]
    },
    {
        name: "Mumbai", range: "₹8 — ₹200/hr", min: 8, max: 200,
        areas: [
            { name: "South Mumbai", min: 80, max: 200, avg: 140, zone: "premium" },
            { name: "Bandra West", min: 50, max: 150, avg: 90, zone: "premium" },
            { name: "Andheri East", min: 20, max: 60, avg: 40, zone: "standard" },
            { name: "Borivali", min: 8, max: 30, avg: 18, zone: "budget" }
        ]
    },
    {
        name: "Delhi NCR", range: "₹8 — ₹150/hr", min: 8, max: 150,
        areas: [
            { name: "Connaught Place", min: 50, max: 150, avg: 100, zone: "premium" },
            { name: "South Delhi", min: 40, max: 120, avg: 80, zone: "premium" },
            { name: "Noida Sec 62", min: 15, max: 45, avg: 30, zone: "standard" },
            { name: "Rohini", min: 8, max: 25, avg: 15, zone: "budget" }
        ]
    },
    {
        name: "Bangalore", range: "₹8 — ₹120/hr", min: 8, max: 120,
        areas: [
            { name: "Indiranagar", min: 40, max: 120, avg: 75, zone: "premium" },
            { name: "Koramangala", min: 30, max: 90, avg: 60, zone: "premium" },
            { name: "Whitefield", min: 15, max: 50, avg: 30, zone: "standard" },
            { name: "Electronic City", min: 8, max: 20, avg: 12, zone: "budget" }
        ]
    },
    {
        name: "Chennai", range: "₹8 — ₹90/hr", min: 8, max: 90,
        areas: [
            { name: "T. Nagar", min: 30, max: 90, avg: 55, zone: "standard" },
            { name: "Adyar", min: 25, max: 70, avg: 45, zone: "standard" },
            { name: "OMR", min: 15, max: 40, avg: 25, zone: "standard" },
            { name: "Avadi", min: 8, max: 20, avg: 12, zone: "budget" }
        ]
    },
    {
        name: "Pune", range: "₹8 — ₹80/hr", min: 8, max: 80,
        areas: [
            { name: "Koregaon Park", min: 30, max: 80, avg: 50, zone: "premium" },
            { name: "Viman Nagar", min: 20, max: 55, avg: 35, zone: "standard" },
            { name: "Hinjewadi", min: 15, max: 40, avg: 25, zone: "standard" },
            { name: "Warje", min: 8, max: 20, avg: 12, zone: "budget" }
        ]
    },
    {
        name: "Kolkata", range: "₹8 — ₹60/hr", min: 8, max: 60,
        areas: [
            { name: "Park Street", min: 30, max: 60, avg: 45, zone: "standard" },
            { name: "Salt Lake", min: 20, max: 45, avg: 30, zone: "standard" },
            { name: "New Town", min: 15, max: 35, avg: 25, zone: "standard" },
            { name: "Howrah", min: 8, max: 20, avg: 12, zone: "budget" }
        ]
    },
    {
        name: "Ahmedabad", range: "₹8 — ₹60/hr", min: 8, max: 60,
        areas: [
            { name: "CG Road", min: 25, max: 60, avg: 40, zone: "standard" },
            { name: "Satellite", min: 20, max: 50, avg: 35, zone: "standard" },
            { name: "SG Highway", min: 15, max: 40, avg: 25, zone: "standard" },
            { name: "Naroda", min: 8, max: 20, avg: 12, zone: "budget" }
        ]
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🌱 Seeding Pan-India Location Data...');
        
        await City.deleteMany({});
        await City.insertMany(data);
        
        await Coupon.deleteMany({});
        await Coupon.insertMany(coupons);
        
        console.log('✅ 8 Cities, 32 Areas, and 5 Coupons seeded successfully.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
