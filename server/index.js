require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// =============================================================
//  JSON FILE DATABASE  (zero-config, works everywhere)
// =============================================================
const DB_PATH = path.join(__dirname, 'db.json');

const defaultDB = {
    users: {
        'demo-driver-id': {
            id: 'demo-driver-id',
            email: 'driver@demo.com',
            fullName: 'Rahul (Demo Driver)',
            role: 'Driver',
            phone: '9876543210',
            createdAt: new Date().toISOString()
        },
        'demo-owner-id': {
            id: 'demo-owner-id',
            email: 'owner@demo.com',
            fullName: 'Priya (Demo Owner)',
            role: 'Owner',
            phone: '9123456780',
            createdAt: new Date().toISOString()
        }
    },
    spots: {
        'spot-001': {
            id: 'spot-001', ownerId: 'demo-owner-id',
            name: 'Kompally Parking Hub',
            address: 'Kompally Main Road, Hyderabad',
            lat: 17.535, lng: 78.4836,
            pricePerHour: 40, hourly_rate: 40,
            rating: 4.8, is_occupied: false,
            images: [], availability: true, createdAt: new Date().toISOString()
        },
        'spot-002': {
            id: 'spot-002', ownerId: 'demo-owner-id',
            name: 'Jubilee Hills Parking',
            address: 'Road No. 36, Jubilee Hills, Hyderabad',
            lat: 17.4302, lng: 78.4074,
            pricePerHour: 60, hourly_rate: 60,
            rating: 4.5, is_occupied: false,
            images: [], availability: true, createdAt: new Date().toISOString()
        },
        'spot-003': {
            id: 'spot-003', ownerId: 'demo-owner-id',
            name: 'HITEC City Parking',
            address: 'Cyber Towers, HITEC City, Hyderabad',
            lat: 17.4474, lng: 78.3762,
            pricePerHour: 80, hourly_rate: 80,
            rating: 4.9, is_occupied: false,
            images: [], availability: true, createdAt: new Date().toISOString()
        }
    },
    bookings: {},
    payments: {},
    notifications: {}
};

function loadDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const raw = fs.readFileSync(DB_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            // Merge with defaults so new keys always exist
            return {
                users: { ...defaultDB.users, ...parsed.users },
                spots: { ...defaultDB.spots, ...parsed.spots },
                bookings: parsed.bookings || {},
                payments: parsed.payments || {},
                notifications: parsed.notifications || {}
            };
        }
    } catch (e) {
        console.error('DB load error:', e.message);
    }
    return JSON.parse(JSON.stringify(defaultDB));
}

function saveDB(db) {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
    catch (e) { console.error('DB save error:', e.message); }
}

const DB = loadDB();

// Helpers
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

function pushNotification(userId, bookingId, title, message, type) {
    const id = uid();
    DB.notifications[id] = { id, userId, bookingId, title, message, type, is_read: false, createdAt: now() };
    saveDB(DB);
}

// =============================================================
//  AUTH MIDDLEWARE
// =============================================================
const TOKEN_MAP = {
    'demo-driver-token': { uid: 'demo-driver-id', email: 'driver@demo.com', role: 'Driver' },
    'demo-owner-token':  { uid: 'demo-owner-id',  email: 'owner@demo.com',  role: 'Owner'  }
};

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    // Demo token bypass
    if (TOKEN_MAP[token]) {
        req.user = TOKEN_MAP[token];
        return next();
    }

    // JWT verification for real users (simple HS256 via jsonwebtoken if installed)
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'parksaathi_secret_2024');
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: `Access denied. Requires: ${roles.join(' or ')}` });
    next();
};

// =============================================================
//  AUTH ROUTES
// =============================================================
app.get('/api/auth/me', authenticate, (req, res) => {
    const profile = DB.users[req.user.uid];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ user: req.user, profile });
});

app.post('/api/auth/signup', (req, res) => {
    const { email, password, fullName, role, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = Object.values(DB.users).find(u => u.email === email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const bcrypt = (() => { try { return require('bcryptjs'); } catch { return null; } })();
    const hash = bcrypt ? bcrypt.hashSync(password, 10) : password;

    const id = uid();
    const user = { id, email, fullName: fullName || email, role: role || 'Driver', phone: phone || '', passwordHash: hash, createdAt: now() };
    DB.users[id] = user;
    saveDB(DB);

    let token;
    try {
        token = require('jsonwebtoken').sign({ uid: id, email, role: user.role }, process.env.JWT_SECRET || 'parksaathi_secret_2024', { expiresIn: '30d' });
    } catch { token = `demo-${role?.toLowerCase() || 'driver'}-token`; }

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ token, profile: safeUser });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = Object.values(DB.users).find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const bcrypt = (() => { try { return require('bcryptjs'); } catch { return null; } })();
    const valid = bcrypt ? bcrypt.compareSync(password, user.passwordHash) : (user.passwordHash === password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    let token;
    try {
        token = require('jsonwebtoken').sign({ uid: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'parksaathi_secret_2024', { expiresIn: '30d' });
    } catch { token = `demo-${user.role?.toLowerCase()}-token`; }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, profile: safeUser });
});

// =============================================================
//  PROFILE ROUTES
// =============================================================
app.post('/api/profiles', authenticate, (req, res) => {
    const { id, email, fullName, role, phone } = req.body;
    const targetId = id || req.user.uid;
    const existing = DB.users[targetId] || {};
    DB.users[targetId] = { ...existing, id: targetId, email: email || existing.email, fullName: fullName || existing.fullName, role: role || existing.role, phone: phone || existing.phone, updatedAt: now() };
    saveDB(DB);
    res.status(201).json(DB.users[targetId]);
});

app.put('/api/profiles/:id', authenticate, (req, res) => {
    if (req.user.uid !== req.params.id) return res.status(403).json({ error: 'Unauthorized' });
    const existing = DB.users[req.params.id];
    if (!existing) return res.status(404).json({ error: 'User not found' });
    const { passwordHash: _, ...updates } = req.body;
    DB.users[req.params.id] = { ...existing, ...updates, id: req.params.id, updatedAt: now() };
    saveDB(DB);
    res.json(DB.users[req.params.id]);
});

// =============================================================
//  NOTIFICATIONS
// =============================================================
app.get('/api/notifications', authenticate, (req, res) => {
    const notifs = Object.values(DB.notifications)
        .filter(n => n.userId === req.user.uid)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifs);
});

app.patch('/api/notifications/:id/read', authenticate, (req, res) => {
    const n = DB.notifications[req.params.id];
    if (!n || n.userId !== req.user.uid) return res.status(404).json({ error: 'Not found' });
    n.is_read = true;
    saveDB(DB);
    res.json(n);
});

// =============================================================
//  PARKING SPOTS
// =============================================================
app.get('/api/spots', (req, res) => {
    const { query, lat, lng } = req.query;
    let spots = Object.values(DB.spots).filter(s => s.availability !== false);

    if (query) {
        const q = query.toLowerCase();
        spots = spots.filter(s => s.name?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q));
    }

    // Calculate distance if coords provided
    if (lat && lng) {
        const R = 6371;
        spots = spots.map(s => {
            const dLat = (s.lat - parseFloat(lat)) * Math.PI / 180;
            const dLng = (s.lng - parseFloat(lng)) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(parseFloat(lat) * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return { ...s, distance: parseFloat(dist.toFixed(2)) };
        }).sort((a, b) => a.distance - b.distance);
    }

    // Mark occupied spots based on active bookings
    const activeBookings = Object.values(DB.bookings).filter(b => b.status === 'Confirmed' && b.endTime > now());
    const occupiedSpotIds = new Set(activeBookings.map(b => b.spaceId));
    spots = spots.map(s => ({ ...s, is_occupied: occupiedSpotIds.has(s.id) }));

    res.json(spots);
});

app.get('/api/spots/owner/:ownerId', authenticate, (req, res) => {
    const spots = Object.values(DB.spots).filter(s => s.ownerId === req.params.ownerId);
    res.json(spots);
});

app.get('/api/spots/:id', (req, res) => {
    const spot = DB.spots[req.params.id];
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    res.json(spot);
});

app.post('/api/spots', authenticate, authorize(['Owner']), (req, res) => {
    const { name, address, lat, lng, pricePerHour, hourly_rate, images, availability } = req.body;
    const price = pricePerHour || hourly_rate || 0;
    const id = uid();
    const spot = {
        id, ownerId: req.user.uid,
        name, address,
        lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0,
        pricePerHour: parseFloat(price), hourly_rate: parseFloat(price),
        images: images || [],
        availability: availability !== false,
        rating: 0, reviews: 0,
        createdAt: now()
    };
    DB.spots[id] = spot;
    saveDB(DB);
    res.status(201).json(spot);
});

app.put('/api/spots/:id', authenticate, (req, res) => {
    const spot = DB.spots[req.params.id];
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    if (spot.ownerId !== req.user.uid) return res.status(403).json({ error: 'Unauthorized' });
    DB.spots[req.params.id] = { ...spot, ...req.body, id: req.params.id, ownerId: spot.ownerId, updatedAt: now() };
    saveDB(DB);
    res.json(DB.spots[req.params.id]);
});

app.delete('/api/spots/:id', authenticate, (req, res) => {
    const spot = DB.spots[req.params.id];
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    if (spot.ownerId !== req.user.uid) return res.status(403).json({ error: 'Unauthorized' });
    delete DB.spots[req.params.id];
    saveDB(DB);
    res.json({ message: 'Spot deleted' });
});

// =============================================================
//  BOOKINGS
// =============================================================
app.post('/api/bookings', authenticate, authorize(['Driver']), (req, res) => {
    const { spot_id, spotId, driver_id, driverId, start_time, startTime, end_time, endTime, total_price, totalPrice } = req.body;
    const spaceId  = spotId   || spot_id;
    const driverUid = driverId || driver_id || req.user.uid;
    const sTime    = startTime || start_time;
    const eTime    = endTime   || end_time;
    const price    = parseFloat(totalPrice || total_price || 0);

    if (req.user.uid !== driverUid) return res.status(403).json({ error: 'Unauthorized' });

    const spot = DB.spots[spaceId];
    if (!spot) return res.status(404).json({ error: 'Parking spot not found' });

    // Conflict check
    const conflict = Object.values(DB.bookings).some(b =>
        b.spaceId === spaceId && b.status === 'Confirmed' &&
        b.startTime < eTime && b.endTime > sTime
    );
    if (conflict) return res.status(409).json({ error: 'This spot is already booked for the selected time.' });

    const id = uid();
    const booking = {
        id, spaceId, driverId: driverUid,
        startTime: sTime, endTime: eTime,
        totalPrice: price,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        // Denormalized for easy display
        spotName: spot.name,
        spotAddress: spot.address,
        spotLat: spot.lat,
        spotLng: spot.lng,
        ownerName: DB.users[spot.ownerId]?.fullName || 'Owner',
        driverName: DB.users[driverUid]?.fullName || 'Driver',
        createdAt: now()
    };
    DB.bookings[id] = booking;
    saveDB(DB);

    // Notifications
    pushNotification(driverUid, id, 'Booking Requested', `Your request for ${spot.name} has been sent to the owner.`, 'Booking');
    pushNotification(spot.ownerId, id, 'New Booking Request', `${booking.driverName} wants to book ${spot.name}.`, 'Booking');

    res.status(201).json({ ...booking, spot_id: spaceId, start_time: sTime, end_time: eTime, total_price: price });
});

app.get('/api/bookings/user/:userId', authenticate, (req, res) => {
    if (req.user.uid !== req.params.userId) return res.status(403).json({ error: 'Unauthorized' });
    const bookings = Object.values(DB.bookings)
        .filter(b => b.driverId === req.params.userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(b => ({
            ...b,
            spot_id: b.spaceId,
            parking_spots: DB.spots[b.spaceId] || null
        }));
    res.json(bookings);
});

app.get('/api/owner/bookings/:ownerId', authenticate, (req, res) => {
    if (req.user.uid !== req.params.ownerId) return res.status(403).json({ error: 'Unauthorized' });
    const ownerSpotIds = new Set(Object.values(DB.spots).filter(s => s.ownerId === req.params.ownerId).map(s => s.id));
    const bookings = Object.values(DB.bookings)
        .filter(b => ownerSpotIds.has(b.spaceId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(b => ({
            ...b,
            spot_id: b.spaceId,
            parking_spots: DB.spots[b.spaceId] || null,
            profiles: DB.users[b.driverId] ? { fullName: DB.users[b.driverId].fullName, email: DB.users[b.driverId].email, phone: DB.users[b.driverId].phone } : null
        }));
    res.json(bookings);
});

app.patch('/api/bookings/:id/status', authenticate, (req, res) => {
    const booking = DB.bookings[req.params.id];
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const spot = DB.spots[booking.spaceId];
    const isOwner = spot && spot.ownerId === req.user.uid;
    const isDriver = booking.driverId === req.user.uid;
    if (!isOwner && !isDriver) return res.status(403).json({ error: 'Unauthorized' });

    const { status } = req.body;
    booking.status = status;
    booking.updatedAt = now();
    saveDB(DB);

    if (status === 'Confirmed') {
        pushNotification(booking.driverId, booking.id, '✅ Booking Approved!', `Your booking for ${booking.spotName} has been approved!`, 'Booking');
    } else if (status === 'Cancelled') {
        pushNotification(booking.driverId, booking.id, '❌ Booking Rejected', `Your booking for ${booking.spotName} was not accepted.`, 'Booking');
    } else if (status === 'Completed') {
        pushNotification(booking.driverId, booking.id, '🏁 Parking Completed', `Hope you had a great experience at ${booking.spotName}!`, 'Reminder');
        if (spot) pushNotification(spot.ownerId, booking.id, '💰 Earning Recorded', `₹${booking.totalPrice} earned from ${booking.spotName}.`, 'Payment');
    }

    res.json({ ...booking, spot_id: booking.spaceId });
});

// =============================================================
//  PAYMENTS
// =============================================================
app.post('/api/payments', authenticate, (req, res) => {
    const { booking_id, bookingId, amount, mode, transaction_id, status: paymentStatus } = req.body;
    const bId = bookingId || booking_id;
    const booking = DB.bookings[bId];
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (paymentStatus === 'Failed') {
        booking.status = 'Cancelled';
        booking.paymentStatus = 'Failed';
        saveDB(DB);
        pushNotification(booking.driverId, bId, '❗ Payment Failed', `Booking for ${booking.spotName} was cancelled.`, 'Payment');
        return res.json({ message: 'Booking cancelled due to payment failure' });
    }

    const payId = uid();
    DB.payments[payId] = {
        id: payId, bookingId: bId,
        amount: parseFloat(amount), mode,
        transactionId: transaction_id || payId,
        status: 'Success', createdAt: now()
    };

    booking.status = 'Confirmed';
    booking.paymentStatus = 'Paid';
    booking.paymentId = payId;
    saveDB(DB);

    const spot = DB.spots[booking.spaceId];
    pushNotification(booking.driverId, bId, '💚 Payment Successful!', `Booking confirmed for ${booking.spotName}. Enjoy your ride!`, 'Payment');
    if (spot) pushNotification(spot.ownerId, bId, '💵 Payment Received', `You received ₹${amount} for ${booking.spotName}.`, 'Payment');

    res.status(201).json(DB.payments[payId]);
});

// =============================================================
//  OWNER STATS & EARNINGS
// =============================================================
app.get('/api/owner/stats/:ownerId', authenticate, (req, res) => {
    if (req.user.uid !== req.params.ownerId) return res.status(403).json({ error: 'Unauthorized' });
    const ownerSpotIds = new Set(Object.values(DB.spots).filter(s => s.ownerId === req.params.ownerId).map(s => s.id));
    const ownerBookings = Object.values(DB.bookings).filter(b => ownerSpotIds.has(b.spaceId));

    const totalEarnings = ownerBookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const activeBookings = ownerBookings.filter(b => b.status === 'Confirmed').length;
    const totalSpaces = ownerSpotIds.size;
    const pendingRequests = ownerBookings.filter(b => b.status === 'Pending').length;

    res.json({ totalEarnings, activeBookings, totalSpaces, pendingRequests, spotViews: Math.floor(Math.random() * 500) + totalEarnings });
});

app.get('/api/owner/history/:ownerId', authenticate, (req, res) => {
    if (req.user.uid !== req.params.ownerId) return res.status(403).json({ error: 'Unauthorized' });
    const ownerSpotIds = new Set(Object.values(DB.spots).filter(s => s.ownerId === req.params.ownerId).map(s => s.id));
    const history = Object.values(DB.bookings)
        .filter(b => ownerSpotIds.has(b.spaceId) && (b.status === 'Confirmed' || b.status === 'Completed'))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(b => ({
            ...b,
            driverName: DB.users[b.driverId]?.fullName || b.driverName,
            spotName: DB.spots[b.spaceId]?.name || b.spotName
        }));
    res.json(history);
});

// =============================================================
//  GOOGLE DRIVE INTEGRATION
// =============================================================
const driveService = require('./driveService');

app.get('/api/upload/drive-auth', (req, res) => {
    res.json({ url: driveService.getAuthUrl() });
});

app.get('/api/upload/drive-callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await driveService.getToken(code);
        // In a real app, you'd store these tokens in the user's session or DB.
        // For this demo, we'll just set them on the service.
        driveService.setCredentials(tokens);
        res.send('Authenticated! You can close this window.');
    } catch (error) {
        res.status(500).send('Authentication failed: ' + error.message);
    }
});

app.post('/api/upload/drive-photo', authenticate, async (req, res) => {
    const { fileBase64, fileName, mimeType, uploadType, entityId } = req.body;

    if (!fileBase64 || !fileName || !mimeType) {
        return res.status(400).json({ error: 'Missing required file data' });
    }

    const folderId = uploadType === 'profile' 
        ? process.env.GOOGLE_DRIVE_PROFILE_FOLDER_ID 
        : process.env.GOOGLE_DRIVE_PARKING_FOLDER_ID;

    try {
        const driveData = await driveService.uploadFile(fileBase64, fileName, mimeType, folderId);
        const { driveFileId, viewUrl, thumbnailUrl } = driveData;

        // Update DB
        if (uploadType === 'profile') {
            const user = DB.users[req.user.uid];
            if (user) {
                user.profile_photo_drive_id = driveFileId;
                user.profile_photo_url = viewUrl;
                saveDB(DB);
            }
        } else if (uploadType === 'parking-space' && entityId) {
            const spot = DB.spots[entityId];
            if (spot) {
                if (!spot.drive_file_ids) spot.drive_file_ids = [];
                if (!spot.photo_urls) spot.photo_urls = [];
                
                spot.drive_file_ids.push(driveFileId);
                spot.photo_urls.push(viewUrl);
                // Also update the main image_url if it's the first one
                if (!spot.image_url || spot.image_url.includes('unsplash')) {
                    spot.image_url = viewUrl;
                }
                saveDB(DB);
            }
        }

        res.status(201).json({ driveFileId, viewUrl, thumbnailUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/upload/drive-photo/:fileId', authenticate, async (req, res) => {
    const { fileId } = req.params;
    const { entityId, uploadType } = req.body;

    try {
        await driveService.deleteFile(fileId);

        // Update DB
        if (uploadType === 'profile') {
            const user = DB.users[req.user.uid];
            if (user && user.profile_photo_drive_id === fileId) {
                delete user.profile_photo_drive_id;
                delete user.profile_photo_url;
                saveDB(DB);
            }
        } else if (uploadType === 'parking-space' && entityId) {
            const spot = DB.spots[entityId];
            if (spot) {
                spot.drive_file_ids = (spot.drive_file_ids || []).filter(id => id !== fileId);
                spot.photo_urls = (spot.photo_urls || []).filter(url => !url.includes(fileId));
                saveDB(DB);
            }
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// =============================================================
//  HEALTH CHECK
// =============================================================
app.get('/', (req, res) => res.json({
    status: 'online',
    service: 'ParkSaathi API',
    version: '2.0.0',
    endpoints: ['/api/auth/me', '/api/spots', '/api/bookings', '/api/payments', '/api/notifications'],
    db: { users: Object.keys(DB.users).length, spots: Object.keys(DB.spots).length, bookings: Object.keys(DB.bookings).length }
}));

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`\n🚗 ParkSaathi API running on port ${PORT}`);
    console.log(`📦 Database: ${Object.keys(DB.users).length} users, ${Object.keys(DB.spots).length} spots, ${Object.keys(DB.bookings).length} bookings`);
    console.log(`🌐 Health: http://localhost:${PORT}/\n`);
});

