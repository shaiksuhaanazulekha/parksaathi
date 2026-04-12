require('dotenv').config();
const mongoose = require('mongoose');
const { City, Coupon } = require('./models/LocationAndDeals');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/parksaathi';

const CITIES_DATA = [
    {
        city: 'Hyderabad',
        areas: [
            { name: 'Banjara Hills', min: 20, max: 60, avg: 35, zone: 'standard' },
            { name: 'Jubilee Hills', min: 20, max: 60, avg: 35, zone: 'standard' },
            { name: 'Hitec City', min: 25, max: 80, avg: 50, zone: 'premium' },
            { name: 'Madhapur', min: 20, max: 60, avg: 40, zone: 'standard' },
            { name: 'Gachibowli', min: 20, max: 70, avg: 45, zone: 'standard' },
            { name: 'Kondapur', min: 15, max: 50, avg: 30, zone: 'standard' },
            { name: 'Begumpet', min: 15, max: 50, avg: 30, zone: 'standard' },
            { name: 'Secunderabad', min: 10, max: 40, avg: 20, zone: 'budget' },
            { name: 'Ameerpet', min: 10, max: 35, avg: 20, zone: 'budget' },
            { name: 'Kukatpally', min: 10, max: 35, avg: 18, zone: 'budget' },
            { name: 'Miyapur', min: 8, max: 25, avg: 15, zone: 'budget' },
            { name: 'LB Nagar', min: 8, max: 25, avg: 15, zone: 'budget' },
            { name: 'Uppal', min: 8, max: 20, avg: 12, zone: 'budget' },
            { name: 'Dilsukhnagar', min: 8, max: 20, avg: 12, zone: 'budget' },
            { name: 'Old City', min: 5, max: 15, avg: 10, zone: 'budget' }
        ]
    },
    {
        city: 'Mumbai',
        areas: [
            { name: 'BKC', min: 60, max: 200, avg: 120, zone: 'premium' },
            { name: 'Nariman Point', min: 60, max: 180, avg: 110, zone: 'premium' },
            { name: 'Lower Parel', min: 50, max: 150, avg: 90, zone: 'premium' },
            { name: 'Bandra West', min: 40, max: 120, avg: 75, zone: 'premium' },
            { name: 'Andheri West', min: 30, max: 100, avg: 60, zone: 'standard' },
            { name: 'Powai', min: 30, max: 80, avg: 50, zone: 'standard' },
            { name: 'Juhu', min: 30, max: 80, avg: 50, zone: 'standard' },
            { name: 'Andheri East', min: 20, max: 60, avg: 35, zone: 'standard' },
            { name: 'Malad', min: 20, max: 50, avg: 30, zone: 'standard' },
            { name: 'Borivali', min: 15, max: 40, avg: 25, zone: 'standard' },
            { name: 'Thane', min: 15, max: 40, avg: 25, zone: 'standard' },
            { name: 'Navi Mumbai', min: 10, max: 30, avg: 18, zone: 'budget' },
            { name: 'Virar', min: 8, max: 20, avg: 12, zone: 'budget' }
        ]
    },
    {
        city: 'Delhi NCR',
        areas: [
            { name: 'Connaught Place', min: 50, max: 150, avg: 90, zone: 'premium' },
            { name: 'Khan Market', min: 50, max: 150, avg: 90, zone: 'premium' },
            { name: 'South Extension', min: 40, max: 120, avg: 70, zone: 'premium' },
            { name: 'Hauz Khas', min: 30, max: 100, avg: 60, zone: 'standard' },
            { name: 'Saket', min: 30, max: 80, avg: 50, zone: 'standard' },
            { name: 'Cyber City Gurg', min: 40, max: 120, avg: 75, zone: 'premium' },
            { name: 'Noida Sec 18', min: 25, max: 70, avg: 45, zone: 'standard' },
            { name: 'Noida Sec 62', min: 20, max: 60, avg: 35, zone: 'standard' },
            { name: 'Dwarka', min: 15, max: 35, avg: 22, zone: 'budget' },
            { name: 'Rohini', min: 10, max: 30, avg: 18, zone: 'budget' }
        ]
    },
    {
        city: 'Bangalore',
        areas: [
            { name: 'MG Road', min: 40, max: 120, avg: 70, zone: 'premium' },
            { name: 'Koramangala', min: 30, max: 100, avg: 60, zone: 'standard' },
            { name: 'Indiranagar', min: 30, max: 100, avg: 60, zone: 'standard' },
            { name: 'Whitefield', min: 25, max: 80, avg: 50, zone: 'premium' },
            { name: 'Electronic City', min: 20, max: 60, avg: 35, zone: 'standard' },
            { name: 'HSR Layout', min: 20, max: 60, avg: 35, zone: 'standard' },
            { name: 'BTM Layout', min: 20, max: 50, avg: 30, zone: 'standard' },
            { name: 'Marathahalli', min: 20, max: 60, avg: 35, zone: 'standard' },
            { name: 'JP Nagar', min: 15, max: 45, avg: 28, zone: 'standard' },
            { name: 'Yelahanka', min: 10, max: 30, avg: 18, zone: 'budget' }
        ]
    },
    {
        city: 'Chennai',
        areas: [
            { name: 'T Nagar', min: 30, max: 80, avg: 50, zone: 'standard' },
            { name: 'Anna Nagar', min: 25, max: 70, avg: 45, zone: 'standard' },
            { name: 'Nungambakkam', min: 30, max: 90, avg: 55, zone: 'standard' },
            { name: 'Adyar', min: 20, max: 60, avg: 38, zone: 'budget' },
            { name: 'OMR', min: 20, max: 60, avg: 38, zone: 'budget' },
            { name: 'Velachery', min: 20, max: 55, avg: 35, zone: 'budget' },
            { name: 'Tambaram', min: 10, max: 25, avg: 15, zone: 'budget' }
        ]
    },
    {
        city: 'Pune',
        areas: [
            { name: 'Koregaon Park', min: 25, max: 80, avg: 50, zone: 'premium' },
            { name: 'Baner', min: 20, max: 60, avg: 38, zone: 'standard' },
            { name: 'Hinjewadi', min: 20, max: 65, avg: 40, zone: 'standard' },
            { name: 'Kothrud', min: 15, max: 45, avg: 28, zone: 'budget' },
            { name: 'Hadapsar', min: 15, max: 40, avg: 25, zone: 'budget' },
            { name: 'Pimpri', min: 10, max: 30, avg: 18, zone: 'budget' }
        ]
    },
    {
        city: 'Kolkata',
        areas: [
            { name: 'Park Street', min: 20, max: 60, avg: 38, zone: 'standard' },
            { name: 'Salt Lake V', min: 20, max: 60, avg: 38, zone: 'standard' },
            { name: 'New Town', min: 15, max: 50, avg: 30, zone: 'budget' },
            { name: 'Ballygunge', min: 15, max: 50, avg: 30, zone: 'budget' },
            { name: 'Howrah', min: 10, max: 30, avg: 18, zone: 'budget' }
        ]
    },
    {
        city: 'Ahmedabad',
        areas: [
            { name: 'SG Highway', min: 20, max: 60, avg: 38, zone: 'premium' },
            { name: 'Prahlad Nagar', min: 20, max: 55, avg: 35, zone: 'standard' },
            { name: 'CG Road', min: 15, max: 50, avg: 30, zone: 'budget' },
            { name: 'Satellite', min: 15, max: 50, avg: 30, zone: 'budget' },
            { name: 'Maninagar', min: 10, max: 30, avg: 18, zone: 'budget' }
        ]
    }
];

const COUPONS_DATA = [
    { code: 'PARK20',    type: 'flat',    value: 20, minBooking: 40,  maxDiscount: 20 },
    { code: 'SAATHI10',  type: 'percent', value: 10, minBooking: 0,   maxDiscount: 50, newOnly: true },
    { code: 'FIRST50',   type: 'flat',    value: 50, minBooking: 100, maxDiscount: 50, newOnly: true },
    { code: 'WEEKEND15', type: 'percent', value: 15, minBooking: 0,   maxDiscount: 100, weekendOnly: true },
    { code: 'MONTHLY25', type: 'percent', value: 25, minBooking: 0,   maxDiscount: 500, monthlyOnly: true }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        await City.deleteMany({});
        await City.insertMany(CITIES_DATA);
        console.log('✅ Cities seeded');

        await Coupon.deleteMany({});
        await Coupon.insertMany(COUPONS_DATA);
        console.log('✅ Coupons seeded');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
