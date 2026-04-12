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
//  MONGOOSE SCHEMAS
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:        { type: String, default: '' },
    password:     { type: String, required: true },
    role:         { type: String, enum: ['Driver', 'Owner'], default: 'Driver' },
    profilePhoto: { type: String, default: '' },
}, { timestamps: true });

const parkingSchema = new mongoose.Schema({
    ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:        { type: String, required: true, trim: true },
    address:     { type: String, required: true },
    lat:         { type: Number, required: true },
    lng:         { type: Number, required: true },
    pricePerHour:{ type: Number, required: true },
    photos:      [{ type: String }],
    rating:      { type: Number, default: 4.5, min: 0, max: 5 },
    isActive:    { type: Boolean, default: true },
    totalSlots:  { type: Number, default: 1 },
    description: { type: String, default: '' },
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
    driverId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spaceId:      { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
    startTime:    { type: Date, required: true },
    endTime:      { type: Date, required: true },
    totalPrice:   { type: Number, required: true },
    status:       { type: String, enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'], default: 'Pending' },
    paymentStatus:{ type: String, enum: ['Unpaid', 'Paid', 'Failed'], default: 'Unpaid' },
}, { timestamps: true });

const notifSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    type:      { type: String, default: 'General' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    isRead:    { type: Boolean, default: false },
}, { timestamps: true });

const User         = mongoose.model('User', userSchema);
const ParkingSpace = mongoose.model('ParkingSpace', parkingSchema);
const Booking      = mongoose.model('Booking', bookingSchema);
const Notification = mongoose.model('Notification', notifSchema);

// ─────────────────────────────────────────────
//  DB CONNECTION (non-blocking)
// ─────────────────────────────────────────────
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('⚠️  MongoDB offline — using demo mode:', err.message));

const dbReady = () => mongoose.connection.readyState === 1;

// ─────────────────────────────────────────────
//  DEMO DATA (always available)
// ─────────────────────────────────────────────
const DEMO_SPOTS = [
    {
        _id: '660000000000000000000101', id: '660000000000000000000101',
        name: 'Kompally Parking Hub', address: 'Kompally Main Road, Hyderabad',
        lat: 17.535, lng: 78.4836, pricePerHour: 40, hourly_rate: 40,
        rating: 4.8, isActive: true, totalSlots: 4,
        photos: ['https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=600&auto=format'],
        description: 'Covered parking with CCTV. Safe and secure 24/7.'
    },
    {
        _id: '660000000000000000000102', id: '660000000000000000000102',
        name: 'Jubilee Hills Spot', address: 'Road No. 36, Jubilee Hills, Hyderabad',
        lat: 17.4302, lng: 78.4074, pricePerHour: 60, hourly_rate: 60,
        rating: 4.5, isActive: true, totalSlots: 2,
        photos: ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format'],
        description: 'Premium residential parking near Film Nagar.'
    },
    {
        _id: '660000000000000000000103', id: '660000000000000000000103',
        name: 'HITEC City Parking', address: 'Cyber Towers, HITEC City, Hyderabad',
        lat: 17.4474, lng: 78.3762, pricePerHour: 80, hourly_rate: 80,
        rating: 4.9, isActive: true, totalSlots: 6,
        photos: ['https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&auto=format'],
        description: 'Professional lot near tech park. Multiple slots available.'
    },
    {
        _id: '660000000000000000000104', id: '660000000000000000000104',
        name: 'Banjara Hills Garage', address: 'Road No. 12, Banjara Hills, Hyderabad',
        lat: 17.4108, lng: 78.4483, pricePerHour: 50, hourly_rate: 50,
        rating: 4.3, isActive: true, totalSlots: 3,
        photos: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&auto=format'],
        description: 'Gated community parking. Ask for entry code at the gate.'
    },
    {
        _id: '660000000000000000000105', id: '660000000000000000000105',
        name: 'Ameerpet Metro Parking', address: 'Ameerpet Metro Station, Hyderabad',
        lat: 17.4374, lng: 78.4487, pricePerHour: 30, hourly_rate: 30,
        rating: 4.2, isActive: true, totalSlots: 8,
        photos: ['https://images.unsplash.com/photo-1512491376-fd63668c3haa?w=600&auto=format'],
        description: 'Budget-friendly option near metro station. Day pass available.'
    },
];

const DEMO_DRIVER  = { id: 'demo-driver-001', _id: 'demo-driver-001', name: 'Rahul (Demo Driver)', email: 'driver@demo.com', role: 'Driver', user_type: 'driver', phone: '9876543210', profilePhoto: '' };
const DEMO_OWNER   = { id: 'demo-owner-001',  _id: 'demo-owner-001',  name: 'Priya (Demo Owner)',  email: 'owner@demo.com',  role: 'Owner',  user_type: 'owner',  phone: '9123456780', profilePhoto: '' };

const DEMO_BOOKINGS = [
    {
        id: 'demo-booking-001', _id: 'demo-booking-001',
        driverId: 'demo-driver-001', spaceId: '660000000000000000000102',
        startTime: new Date(Date.now() + 2 * 3600000).toISOString(),
        endTime:   new Date(Date.now() + 4 * 3600000).toISOString(),
        totalPrice: 120, status: 'Confirmed', paymentStatus: 'Paid',
        spotName: 'Jubilee Hills Spot', spotAddress: 'Road No. 36, Jubilee Hills',
        spotLat: 17.4302, spotLng: 78.4074,
        parking_spots: DEMO_SPOTS[1],
        createdAt: new Date().toISOString(),
    }
];

// ─────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────
const toProfile = (user) => ({
    ...user,
    id: user._id?.toString() || user.id,
    user_type: (user.role || 'driver').toLowerCase(),
});

const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
    const token = header.split(' ')[1];

    if (token === 'demo-driver-token') { req.user = { uid: DEMO_DRIVER.id, email: DEMO_DRIVER.email, role: 'Driver' }; return next(); }
    if (token === 'demo-owner-token')  { req.user = { uid: DEMO_OWNER.id,  email: DEMO_OWNER.email,  role: 'Owner'  }; return next(); }

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
//  AUTH ROUTES
// ─────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, fullName, full_name, email, password, role, user_type, phone } = req.body;
        const finalName = (name || fullName || full_name || '').trim();
        const finalRole = (role || user_type || 'Driver').charAt(0).toUpperCase() + (role || user_type || 'driver').slice(1).toLowerCase();

        if (!finalName || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
        if (!['Driver', 'Owner'].includes(finalRole)) return res.status(400).json({ error: 'Invalid role' });

        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable. Use demo mode.' });

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ name: finalName, email: email.toLowerCase(), password: hashed, role: finalRole, phone: phone || '' });

        const token = jwt.sign({ uid: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        const profile = toProfile({ ...user.toObject(), _id: user._id.toString() });
        delete profile.password;

        res.status(201).json({ token, profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        // Demo bypass
        if (email === 'driver@demo.com' && password === 'demo123') {
            return res.json({ token: 'demo-driver-token', profile: DEMO_DRIVER });
        }
        if (email === 'owner@demo.com' && password === 'demo123') {
            return res.json({ token: 'demo-owner-token', profile: DEMO_OWNER });
        }

        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable. Use demo credentials.' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ uid: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        const profile = toProfile({ ...user.toObject(), _id: user._id.toString() });
        delete profile.password;

        res.json({ token, profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        if (req.user.uid === DEMO_DRIVER.id) return res.json({ profile: DEMO_DRIVER });
        if (req.user.uid === DEMO_OWNER.id)  return res.json({ profile: DEMO_OWNER });

        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' });

        const user = await User.findById(req.user.uid).select('-password').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ profile: toProfile({ ...user, _id: user._id.toString() }) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/profiles/:id', authenticate, async (req, res) => {
    try {
        if (req.user.uid === DEMO_DRIVER.id || req.user.uid === DEMO_OWNER.id) {
            return res.json({ profile: req.user.uid === DEMO_DRIVER.id ? DEMO_DRIVER : DEMO_OWNER });
        }
        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' });

        const { password, ...updates } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ profile: toProfile({ ...user, _id: user._id.toString() }) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
//  PARKING SPOTS
// ─────────────────────────────────────────────
const mapSpot = (s) => {
    const obj = s.toObject ? s.toObject() : { ...s };
    const id = (obj._id || obj.id || '').toString();
    const rate = obj.pricePerHour || obj.hourly_rate || 0;
    return {
        ...obj, id, _id: id,
        pricePerHour: rate, hourly_rate: rate,
        photos: obj.photos || []
    };
};

const addDistance = (spot, lat, lng) => {
    if (!lat || !lng || !spot.lat || !spot.lng) return spot;
    const dist = Math.sqrt(Math.pow(spot.lat - parseFloat(lat), 2) + Math.pow(spot.lng - parseFloat(lng), 2)) * 111;
    return { ...spot, distance: parseFloat(dist.toFixed(1)) };
};

app.get('/api/spots', async (req, res) => {
    try {
        const { query, lat, lng } = req.query;
        let spots = [];

        if (dbReady()) {
            const filter = { isActive: true };
            if (query) filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { address: { $regex: query, $options: 'i' } }
            ];
            const dbSpots = await ParkingSpace.find(filter).lean();
            spots = dbSpots.map(mapSpot);
        }

        if (spots.length === 0) {
            spots = DEMO_SPOTS.map(s => ({ ...s }));
            if (query) {
                const q = query.toLowerCase();
                spots = spots.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
            }
        }

        spots = spots.map(s => addDistance(s, lat, lng));
        if (lat && lng) spots.sort((a, b) => (a.distance || 999) - (b.distance || 999));

        res.json(spots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/spots/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check demo spots first
        const demo = DEMO_SPOTS.find(s => s.id === id || s._id === id);
        if (demo) return res.json({ ...demo });

        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' });

        const spot = await ParkingSpace.findById(id).lean();
        if (!spot) return res.status(404).json({ error: 'Spot not found' });

        res.json(mapSpot(spot));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/spots', authenticate, authorize('Owner'), async (req, res) => {
    try {
        const { name, address, lat, lng, pricePerHour, hourly_rate, photos, description, totalSlots } = req.body;
        const rate = parseFloat(pricePerHour || hourly_rate);

        // Demo mode bypass
        if (!dbReady() || req.user.uid === DEMO_OWNER.id) {
            const fakeSpot = {
                id: `demo-spot-${Date.now()}`,
                ownerId: req.user.uid,
                name, address, lat, lng, pricePerHour: rate,
                photos: photos || [], description, totalSlots,
                rating: 4.5, reviews: 0
            };
            DEMO_SPOTS.unshift(fakeSpot); // Add to local demo array
            return res.status(201).json(fakeSpot);
        }

        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' });
        if (!name || !address || !lat || !lng || !rate) {
            return res.status(400).json({ error: 'name, address, lat, lng, and price are required' });
        }

        const spot = await ParkingSpace.create({
            ownerId: req.user.uid,
            name: name.trim(), address: address.trim(),
            lat: parseFloat(lat), lng: parseFloat(lng),
            pricePerHour: rate,
            photos: photos || [],
            description: description || '',
            totalSlots: totalSlots || 1,
        });

        res.status(201).json(mapSpot(spot));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/spots/owner/:ownerId', authenticate, async (req, res) => {
    try {
        if (!dbReady()) return res.json([]);
        const spots = await ParkingSpace.find({ ownerId: req.params.ownerId }).lean();
        res.json(spots.map(mapSpot));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
//  BOOKINGS
// ─────────────────────────────────────────────
const mapBooking = (b, spot = null, driver = null) => {
    const obj = b.toObject ? b.toObject() : { ...b };
    const id = (obj._id || obj.id || '').toString();
    const s = spot || obj.spaceId || {};
    const d = driver || obj.driverId || {};

    return {
        ...obj, id, _id: id,
        spotName:    s.name    || obj.spotName    || '',
        spotAddress: s.address || obj.spotAddress || '',
        spotLat:     s.lat     || obj.spotLat,
        spotLng:     s.lng     || obj.spotLng,
        parking_spots: s._id ? mapSpot(s) : (s.id ? s : null),
        profiles: d._id ? { id: d._id.toString(), name: d.name, email: d.email, phone: d.phone } : (d.id ? d : null),
    };
};

app.post('/api/bookings', authenticate, authorize('Driver'), async (req, res) => {
    try {
        const { spot_id, start_time, end_time, total_price } = req.body;
        if (!spot_id || !start_time || !end_time || !total_price) {
            return res.status(400).json({ error: 'spot_id, start_time, end_time and total_price required' });
        }

        // Demo mode — return fake booking
        if (!dbReady() || req.user.uid === DEMO_DRIVER.id) {
            const demoSpot = DEMO_SPOTS.find(s => s.id === spot_id || s._id === spot_id) || DEMO_SPOTS[0];
            const fakeBooking = {
                id: `demo-book-${Date.now()}`, _id: `demo-book-${Date.now()}`,
                driverId: DEMO_DRIVER.id, spaceId: spot_id,
                startTime: start_time, endTime: end_time, totalPrice: total_price,
                status: 'Pending', paymentStatus: 'Unpaid',
                spotName: demoSpot.name, spotAddress: demoSpot.address,
                spotLat: demoSpot.lat, spotLng: demoSpot.lng,
                parking_spots: demoSpot,
                createdAt: new Date().toISOString(),
            };
            return res.status(201).json(fakeBooking);
        }

        const spot = await ParkingSpace.findById(spot_id).lean();
        if (!spot) return res.status(404).json({ error: 'Parking spot not found' });

        // Ruthless price validation
        const sTime = new Date(start_time);
        const eTime = new Date(end_time);
        let hours = (eTime - sTime) / (1000 * 60 * 60);
        if (hours <= 0) hours += 24; // Handle overnight
        const expectedPrice = Math.round(hours * spot.pricePerHour);
        
        if (Math.abs(expectedPrice - total_price) > 5) { // 5 rupee margin for rounding
            console.log(`Security Alert: Price manipulation detected. Expected ${expectedPrice}, got ${total_price}`);
            return res.status(400).json({ error: 'Invalid total price calculated. Price must match spot rate.' });
        }

        const booking = await Booking.create({
            driverId: req.user.uid,
            spaceId: spot_id,
            startTime: sTime,
            endTime: eTime,
            totalPrice: parseFloat(total_price),
        });

        await pushNotif(req.user.uid, '📋 Booking Submitted', `Waiting for ${spot.name} owner approval.`, 'Booking', booking._id);
        await pushNotif(spot.ownerId, '🚗 New Booking Request', `Someone wants to book ${spot.name}.`, 'Booking', booking._id);

        res.status(201).json(mapBooking(booking, spot));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bookings/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        if (userId === DEMO_DRIVER.id || !dbReady()) return res.json(DEMO_BOOKINGS);

        const bookings = await Booking.find({ driverId: userId })
            .populate('spaceId').sort({ createdAt: -1 }).lean();

        res.json(bookings.map(b => mapBooking(b, b.spaceId)));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bookings/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        if (id.startsWith('demo-')) {
            const found = DEMO_BOOKINGS.find(b => b.id === id);
            return found ? res.json(found) : res.status(404).json({ error: 'Booking not found' });
        }

        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' });

        const booking = await Booking.findById(id).populate('spaceId').populate('driverId', 'name email phone').lean();
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Security check: Only driver or owner of the spot can see details
        const isDriver = booking.driverId._id?.toString() === req.user.uid;
        const isOwner  = booking.spaceId?.ownerId?.toString() === req.user.uid;

        if (!isDriver && !isOwner && req.user.uid !== DEMO_DRIVER.id && req.user.uid !== DEMO_OWNER.id) {
            return res.status(403).json({ error: 'Unauthorized access to this booking' });
        }

        res.json(mapBooking(booking, booking.spaceId, booking.driverId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/bookings/:id/status', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        if (id.startsWith('demo-')) return res.json({ id, status });
        if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' });

        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true }).populate('spaceId').lean();
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (status === 'Confirmed') {
            await pushNotif(booking.driverId, '✅ Booking Approved!', `Proceed to pay for ${booking.spaceId?.name}.`, 'Booking', booking._id);
        } else if (['Rejected', 'Cancelled'].includes(status)) {
            await pushNotif(booking.driverId, '❌ Booking Declined', `Your request for ${booking.spaceId?.name} was declined.`, 'Booking', booking._id);
        }

        res.json(mapBooking(booking, booking.spaceId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/owner/bookings/:ownerId', authenticate, authorize('Owner'), async (req, res) => {
    try {
        if (!dbReady()) return res.json([]);

        const spots = await ParkingSpace.find({ ownerId: req.params.ownerId }).lean();
        const spotIds = spots.map(s => s._id);

        const bookings = await Booking.find({ spaceId: { $in: spotIds } })
            .populate('driverId', 'name email phone')
            .populate('spaceId').sort({ createdAt: -1 }).lean();

        res.json(bookings.map(b => mapBooking(b, b.spaceId, b.driverId)));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
//  PAYMENTS
// ─────────────────────────────────────────────
app.post('/api/payments', authenticate, async (req, res) => {
    try {
        const { booking_id, amount, status, cardNumber } = req.body;

        // Rutheless testing logic for specific cards
        if (cardNumber === '4000 0000 0000 0002') {
            return res.status(402).json({ error: 'Payment failed: Your card was declined. Please use a different payment method.' });
        }

        if (!booking_id || (status !== 'Success' && !cardNumber)) {
            return res.status(400).json({ error: 'booking_id and payment details are required' });
        }

        if (booking_id.startsWith('demo-') || !dbReady()) {
            return res.json({ success: true, message: 'Demo payment processed successfully' });
        }

        const bookingToPay = await Booking.findById(booking_id).lean();
        if (!bookingToPay) return res.status(404).json({ error: 'Booking not found' });
        
        if (!booking_id.startsWith('demo-') && bookingToPay.status !== 'Confirmed') {
            return res.status(400).json({ error: 'Cannot pay for a booking that is not yet approved by the owner.' });
        }

        const booking = await Booking.findByIdAndUpdate(
            booking_id,
            { paymentStatus: 'Paid', status: 'Confirmed' }, // status is already Confirmed, but redundant safety
            { new: true }
        ).populate('spaceId').lean();

        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        await pushNotif(booking.driverId,         '💚 Payment Confirmed!',   `Your spot at ${booking.spaceId?.name} is reserved.`,       'Payment', booking._id);
        await pushNotif(booking.spaceId?.ownerId, '💵 Payment Received',     `₹${amount} received for ${booking.spaceId?.name}.`,         'Payment', booking._id);

        res.json({ success: true, booking: mapBooking(booking, booking.spaceId) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
//  OWNER STATS
// ─────────────────────────────────────────────
app.get('/api/owner/stats/:ownerId', authenticate, authorize('Owner'), async (req, res) => {
    try {
        if (!dbReady() || req.params.ownerId === DEMO_OWNER.id) {
            return res.json({ totalEarnings: 4820, activeBookings: 3, totalSpaces: 2, spotViews: 148 });
        }

        const spots = await ParkingSpace.find({ ownerId: req.params.ownerId }).lean();
        const spotIds = spots.map(s => s._id);

        const [paidBookings, activeBookings] = await Promise.all([
            Booking.find({ spaceId: { $in: spotIds }, paymentStatus: 'Paid' }).lean(),
            Booking.countDocuments({ spaceId: { $in: spotIds }, status: 'Confirmed' }),
        ]);

        const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        res.json({
            totalEarnings,
            activeBookings,
            totalSpaces: spots.length,
            spotViews: Math.floor(Math.random() * 100) + 50,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/owner/history/:ownerId', authenticate, authorize('Owner'), async (req, res) => {
    try {
        if (!dbReady() || req.params.ownerId === DEMO_OWNER.id) return res.json([]);

        const spots = await ParkingSpace.find({ ownerId: req.params.ownerId }).lean();
        const spotIds = spots.map(s => s._id);

        const bookings = await Booking.find({
            spaceId: { $in: spotIds },
            status: { $in: ['Confirmed', 'Completed', 'Cancelled'] }
        }).populate('spaceId', 'name').sort({ createdAt: -1 }).lean();

        res.json(bookings.map(b => ({
            ...mapBooking(b, b.spaceId),
            amount: b.totalPrice,
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────
app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        if (!dbReady()) return res.json([]);
        const notifs = await Notification.find({ userId: req.user.uid }).sort({ createdAt: -1 }).limit(50).lean();
        res.json(notifs.map(n => ({ ...n, id: n._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/notifications/:id/read', authenticate, async (req, res) => {
    try {
        if (!dbReady()) return res.json({ success: true });
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
//  HEALTH
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', db: dbReady() ? 'connected' : 'offline (demo mode)', time: new Date() });
});

app.get('/', (req, res) => res.json({ service: 'ParkSaathi API v2', status: 'running' }));

app.listen(PORT, () => console.log(`\n🚗 ParkSaathi API running on http://localhost:${PORT}`));
