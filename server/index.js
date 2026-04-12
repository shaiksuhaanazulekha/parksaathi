require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'parksaathi_jwt_secret_2024';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/parksaathi';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─────────────────────────────────────────────
//  MODELS
// ─────────────────────────────────────────────
const User = require('./models/User');
const ParkingSpace = require('./models/ParkingSpace');
const Booking = require('./models/Booking');
const Notification = require('./models/Notification');
const { City, Coupon } = require('./models/LocationAndDeals');

// ─────────────────────────────────────────────
//  DB CONNECTION
// ─────────────────────────────────────────────
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('⚠️  MongoDB offline — using demo mode:', err.message));

const dbReady = () => mongoose.connection.readyState === 1;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const getSurge = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const hour = parseInt(timeStr.split(':')[0]);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Peak hours: 8-10AM, 5-8PM
    const isPeak = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20);
    
    if (isPeak) return { isSurge: true, multiplier: 1.3, reason: 'Peak Hour Surge' };
    if (isWeekend) return { isSurge: true, multiplier: 1.2, reason: 'Weekend Surge' };
    return { isSurge: false, multiplier: 1.0, reason: '' };
};

const toProfile = (user) => ({
    ...user,
    id: user._id?.toString() || user.id,
    user_type: (user.role || 'driver').toLowerCase(),
});

const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
    const token = header.split(' ')[1];
    
    if (token === 'demo-driver-token') { req.user = { uid: 'demo-driver-001', role: 'Driver' }; return next(); }
    if (token === 'demo-owner-token')  { req.user = { uid: 'demo-owner-001',  role: 'Owner'  }; return next(); }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
    next();
};

const pushNotif = async (userId, title, message, type = 'General', bookingId = null) => {
    if (!dbReady()) return;
    try { await Notification.create({ userId, title, message, type, bookingId }); } catch (e) { /* silent */ }
};

// ─────────────────────────────────────────────
//  LOCATION ROUTES
// ─────────────────────────────────────────────
app.get('/api/cities', async (req, res) => {
    try {
        if (!dbReady()) return res.json([{ city: 'Hyderabad', areas: [{ name: 'Banjara Hills', min: 20, max: 60, avg: 35 }] }]);
        const cities = await City.find({}).lean();
        res.json(cities);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/cities/:city/areas', async (req, res) => {
    try {
        if (!dbReady()) return res.json([{ name: 'Banjara Hills', min: 20, max: 60, avg: 35, zone: 'standard' }]);
        const cityData = await City.findOne({ city: req.params.city }).lean();
        res.json(cityData ? cityData.areas : []);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pricing/:city/:area', async (req, res) => {
    try {
        if (!dbReady()) return res.json({ min: 20, max: 60, avg: 35, zone: 'standard' });
        const cityData = await City.findOne({ city: req.params.city }).lean();
        const area = cityData?.areas.find(a => a.name === req.params.area);
        res.json(area || { min: 20, max: 60, avg: 35, zone: 'standard' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/user/location', authenticate, async (req, res) => {
    try {
        if (!dbReady()) return res.json({ success: true });
        const { city, area } = req.body;
        await User.findByIdAndUpdate(req.user.uid, { "location.city": city, "location.area": area });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────
//  PRICING INTELLIGENCE
// ─────────────────────────────────────────────
app.get('/api/pricing/recommend', async (req, res) => {
    const { city, area } = req.query;
    if (!dbReady()) return res.json({ recommended: 35, min: 20, max: 60, avg: 35, earningsDaily: 126, earningsMonthly: 3780 });
    
    const cityData = await City.findOne({ city }).lean();
    const areaData = cityData?.areas.find(a => a.name === area) || { min: 20, max: 60, avg: 35 };
    
    // Earnings estimate: 4 hours/day, 10% commission
    const daily = (areaData.avg * 4) * 0.9;
    const monthly = daily * 30;
    
    res.json({
        recommended: areaData.avg,
        min: areaData.min,
        max: areaData.max,
        avg: areaData.avg,
        earningsDaily: Math.round(daily),
        earningsMonthly: Math.round(monthly)
    });
});

app.get('/api/pricing/surge', (req, res) => {
    const { time } = req.query;
    const date = time ? new Date(time) : new Date();
    const timeStr = date.toTimeString().split(' ')[0];
    res.json(getSurge(date.toISOString(), timeStr));
});

// ─────────────────────────────────────────────
//  SPACES & SLOTS
// ─────────────────────────────────────────────
app.get('/api/spaces/:id/slots', async (req, res) => {
    const { date } = req.query;
    const { id } = req.params;
    
    if (!dbReady()) {
        const slots = [];
        for (let i = 8; i < 22; i++) slots.push(`${i.toString().padStart(2, '0')}:00`);
        return res.json({
            available: slots,
            booked: ['13:00', '14:00'],
            surge: ['08:00', '09:00', '17:00', '18:00', '19:00']
        });
    }

    try {
        const space = await ParkingSpace.findById(id).lean();
        const bookings = await Booking.find({ spaceId: id, date, status: { $ne: 'cancelled' } }).lean();
        const bookedHours = bookings.map(b => b.startTime);

        const available = [];
        const surge = [];
        
        // Simple slot generation for demo/MVP
        for (let i = 0; i < 24; i++) {
            const time = `${i.toString().padStart(2, '0')}:00`;
            if (!bookedHours.includes(time)) {
                available.push(time);
                if (getSurge(date, time).isSurge) surge.push(time);
            }
        }
        
        res.json({ available, booked: bookedHours, surge });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/spaces', authenticate, authorize('Owner'), async (req, res) => {
    try {
        if (!dbReady()) return res.status(201).json({ spaceId: 'demo-' + Date.now(), status: 'live' });
        
        const cityData = await City.findOne({ city: req.body.city }).lean();
        const areaData = cityData?.areas.find(a => a.name === req.body.area);

        const space = await ParkingSpace.create({
            ...req.body,
            ownerId: req.user.uid,
            cityPricing: areaData ? { min: areaData.min, max: areaData.max, avg: areaData.avg, zone: areaData.zone } : null
        });
        res.status(201).json({ spaceId: space._id, status: 'live' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/spaces/:id', async (req, res) => {
    try {
        if (!dbReady()) return res.json({ name: 'Demo Space', pricing: { basePrice: 30 }, area: 'Banjara Hills', city: 'Hyderabad', cityPricing: { avg: 35 } });
        const space = await ParkingSpace.findById(req.params.id).lean();
        res.json(space);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/spots', async (req, res) => {
    try {
        const { city, area } = req.query;
        let query = { status: 'live' };
        if (city) query.city = city;
        if (area) query.area = area;
        
        if (!dbReady()) return res.json([{ id: '1', name: 'Demo Hub', area: 'Banjara Hills', pricing: { basePrice: 30 }, cityPricing: { avg: 35 } }]);
        const spaces = await ParkingSpace.find(query).lean();
        res.json(spaces);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────
//  BOOKINGS
// ─────────────────────────────────────────────
app.post('/api/bookings', authenticate, authorize('Driver'), async (req, res) => {
    try {
        const { spaceId, date, startTime, duration, paymentMethod, coupon } = req.body;
        
        if (!dbReady()) return res.status(201).json({ bookingId: 'PS-' + Date.now(), totalAmount: 57, status: 'confirmed' });

        const space = await ParkingSpace.findById(spaceId).lean();
        const surge = getSurge(date, startTime);
        
        let baseRate = space.pricing.basePrice;
        let subtotal = baseRate * duration * surge.multiplier;
        if (space.amenities.covered) subtotal += (10 * duration);
        
        let platformFee = subtotal * 0.1;
        let totalAmount = subtotal + platformFee;
        
        let discount = 0;
        if (coupon) {
            const cp = await Coupon.findOne({ code: coupon }).lean();
            if (cp) {
                discount = cp.type === 'flat' ? cp.value : (totalAmount * (cp.value/100));
                discount = Math.min(discount, cp.maxDiscount);
                totalAmount -= discount;
            }
        }

        const booking = await Booking.create({
            driverId: req.user.uid, spaceId, ownerId: space.ownerId,
            date, startTime, duration,
            endTime: `${(parseInt(startTime.split(':')[0]) + duration).toString().padStart(2, '0')}:00`,
            pricing: {
                baseRate, surgeMultiplier: surge.multiplier,
                coveredPremium: space.amenities.covered ? 10 : 0,
                subtotal, platformFee, couponCode: coupon, couponDiscount: discount,
                totalAmount: Math.round(totalAmount)
            },
            status: 'confirmed' // Assuming payment is aut-handled or razorpay logic here
        });

        await pushNotif(space.ownerId, '🚗 New Booking!', `Someone booked for ${date} at ${startTime}.`, 'Booking', booking._id);

        res.status(201).json({ bookingId: booking._id, totalAmount: Math.round(totalAmount), status: 'confirmed' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bookings/driver', authenticate, async (req, res) => {
    try {
        if (!dbReady()) return res.json([]);
        const bookings = await Booking.find({ driverId: req.user.uid }).populate('spaceId').sort({ createdAt: -1 }).lean();
        res.json(bookings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bookings/:id', authenticate, async (req, res) => {
    try {
        if (!dbReady()) return res.json({ bookingId: req.params.id, status: 'confirmed' });
        const booking = await Booking.findById(req.params.id).populate('spaceId').lean();
        res.json(booking);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────
//  AUTH (Preserved logic)
// ─────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!dbReady()) return res.json({ token: 'demo-token', profile: { name, role } });
        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashed, role });
        const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET);
        res.json({ token, profile: toProfile(user.toObject()) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === 'driver@demo.com') return res.json({ token: 'demo-driver-token', profile: { name: 'Demo Driver', role: 'Driver' } });
        if (email === 'owner@demo.com')  return res.json({ token: 'demo-owner-token', profile: { name: 'Demo Owner', role: 'Owner' } });
        
        if (!dbReady()) return res.status(503).json({ error: 'DB Offline' });
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid creds' });
        const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET);
        res.json({ token, profile: toProfile(user.toObject()) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    if (req.user.uid.startsWith('demo-')) return res.json({ profile: { name: 'Demo User', role: req.user.role } });
    const user = await User.findById(req.user.uid).lean();
    res.json({ profile: toProfile(user) });
});

app.get('/api/notifications', authenticate, async (req, res) => {
    if (!dbReady()) return res.json([]);
    const n = await Notification.find({ userId: req.user.uid }).sort({ createdAt: -1 }).lean();
    res.json(n);
});

app.listen(PORT, () => console.log(`\n🚗 ParkSaathi API running on http://localhost:${PORT}`));
