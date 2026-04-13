const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ParkingSpace = require('../models/ParkingSpace');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { getSurge } = require('../utils/pricing');
const kvStore = require('../services/kvStore');

// @route   POST /api/bookings
router.post('/', auth, async (req, res) => {
    try {
        const { spaceId, date, startTime, duration, coupon } = req.body;
        const driverId = req.user.uid || req.user.id;
        
        // Concurrency Check (TEST 3.2, 3.6)
        const lockKey = `slot:lock:${spaceId}:${date}:${startTime}`;
        const existingLock = kvStore.get(lockKey);
        if (existingLock && existingLock !== driverId) {
            return res.status(409).json({ error: 'Slot is currently being booked by someone else' });
        }
        kvStore.set(lockKey, driverId, 30); // 30s TTL lock

        // Check if already booked in DB
        const overlap = await Booking.findOne({ spaceId, date, startTime, status: { $ne: 'cancelled' }});
        if (overlap) {
            kvStore.del(lockKey);
            return res.status(409).json({ error: 'Slot already booked' });
        }

        const space = await ParkingSpace.findById(spaceId).lean();
        if (!space) return res.status(404).json({ error: 'Space not found' });
        if (space.ownerId.toString() === driverId) return res.status(403).json({ error: 'Cannot book own space' });

        const surge = getSurge(date, startTime);
        
        let baseRate = space.pricing.basePrice;
        let subtotal = baseRate * duration * surge.multiplier;
        if (space.amenities.covered) subtotal += (10 * duration);
        
        let platformFee = subtotal * 0.1;
        let totalAmount = subtotal + platformFee;
        
        let discount = 0;
        if (coupon) {
            const cp = await Coupon.findOne({ code: coupon, isActive: true });
            if (!cp) return res.status(400).json({ error: 'Invalid coupon' });
            
            if (cp.conditions?.firstBookingOnly) {
                const past = await Booking.countDocuments({ driverId });
                if (past > 0) return res.status(400).json({ error: 'Already used' });
            }
            if (cp.conditions?.weekendOnly) {
                const d = new Date(date);
                if (d.getDay() !== 0 && d.getDay() !== 6) return res.status(400).json({ error: 'Valid on weekends only' });
            }
            
            discount = cp.type === 'flat' ? cp.value : (totalAmount * (cp.value/100));
            discount = Math.min(discount, cp.maxDiscount);
            totalAmount -= discount;

            cp.usedBy.push(driverId);
            await cp.save();
        }

        const booking = await Booking.create({
            driverId, spaceId, ownerId: space.ownerId,
            date, startTime, duration,
            endTime: `${(parseInt(startTime.split(':')[0]) + duration).toString().padStart(2, '0')}:00`,
            pricing: {
                baseRate, surgeMultiplier: surge.multiplier,
                coveredPremium: space.amenities.covered ? 10 : 0,
                subtotal, platformFee, couponCode: coupon, couponDiscount: discount,
                totalAmount: Math.round(totalAmount)
            },
            status: 'pending' // Pending owner acceptance/payment
        });

        kvStore.del(lockKey);

        const io = req.app.get('io');
        if (io) io.to(space.ownerId.toString()).emit('owner:new_booking_request', booking);

        res.status(201).json({ bookingId: booking._id, totalAmount: Math.round(totalAmount), status: 'pending' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/bookings/driver
router.get('/driver', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ driverId: req.user.uid || req.user.id })
            .populate('spaceId')
            .sort({ createdAt: -1 })
            .lean();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/bookings/owner
router.get('/owner', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ ownerId: req.user.uid || req.user.id })
            .populate('spaceId driverId')
            .sort({ createdAt: -1 })
            .lean();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/bookings/:id/accept
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.uid || req.user.id },
            { status: 'confirmed' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const io = req.app.get('io');
        if (io) io.to(booking.driverId.toString()).emit('driver:booking_confirmed', booking);

        await Notification.create({
            userId: booking.driverId, title: 'Booking Confirmed!', message: 'Your parking slot is confirmed.',
            type: 'Booking', bookingId: booking._id
        });

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/bookings/:id/decline
router.put('/:id/decline', auth, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.uid || req.user.id },
            { status: 'cancelled' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const io = req.app.get('io');
        if (io) io.to(booking.driverId.toString()).emit('driver:booking_declined', booking);

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/bookings/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, driverId: req.user.uid || req.user.id },
            { status: 'cancelled' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const io = req.app.get('io');
        if (io) io.to(booking.ownerId.toString()).emit('owner:booking_cancelled', booking);

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('spaceId').lean();
        if (!booking) return res.status(404).json({ error: 'Not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
