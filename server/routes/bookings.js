import express from 'express';
import Booking from '../models/Booking.js';
import ParkingSpace from '../models/ParkingSpace.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { getSurgePricing, applyPricing, applyCoupon } from '../utils/pricing.js';
import * as kvStore from '../services/kvStore.js';

const router = express.Router();

// @route   POST /api/bookings
router.post('/', auth, async (req, res) => {
    try {
        const { spaceId, date, startTime, duration, couponCode } = req.body;
        const driverId = req.user.uid || req.user.id;
        
        // Concurrency Check (TEST 3.2, 3.6)
        const lockKey = `slot:lock:${spaceId}:${date}:${startTime}`;
        const existingLock = await kvStore.get(lockKey);
        if (existingLock && existingLock !== driverId) {
            return res.status(409).json({ error: 'Slot is currently being booked by someone else' });
        }
        await kvStore.set(lockKey, driverId, 30); // 30s TTL lock

        // Check if already booked in DB
        const overlap = await Booking.findOne({ spaceId, date, startTime, status: { $ne: 'cancelled' }});
        if (overlap) {
            await kvStore.del(lockKey);
            return res.status(409).json({ error: 'Slot already booked' });
        }

        const space = await ParkingSpace.findById(spaceId).lean();
        if (!space) return res.status(404).json({ error: 'Space not found' });
        if (space.ownerId.toString() === driverId) return res.status(403).json({ error: 'Cannot book own space' });

        const surgeData = await getSurgePricing();
        const pricing = applyPricing(space.pricing.basePrice, surgeData, space.amenities);
        
        let finalAmount = pricing.total;
        let discountInfo = { valid: false };

        if (couponCode) {
            const isFirst = (await Booking.countDocuments({ driverId })) === 0;
            const d = new Date(date);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            const isMonthly = duration >= 720; // 30 days * 24 hours approx

            discountInfo = applyCoupon(pricing.total, couponCode, isFirst, isWeekend, isMonthly);
            if (discountInfo.valid) {
                 finalAmount = discountInfo.finalTotal;
            }
        }

        const booking = await Booking.create({
            driverId, spaceId, ownerId: space.ownerId,
            date, startTime, duration,
            endTime: `${(parseInt(startTime.split(':')[0]) + duration).toString().padStart(2, '0')}:00`,
            pricing: {
                baseRate: pricing.basePrice,
                surgeMultiplier: pricing.surgeMultiplier,
                coveredPremium: pricing.coveredPremium,
                subtotal: pricing.subtotal,
                platformFee: pricing.platformFee,
                couponCode: discountInfo.valid ? couponCode : null,
                couponDiscount: discountInfo.valid ? discountInfo.discount : 0,
                totalAmount: Math.round(finalAmount)
            },
            status: 'pending' 
        });

        await kvStore.del(lockKey);

        const io = req.app.get('io');
        if (io) io.to(space.ownerId.toString()).emit('owner:new_booking_request', booking);

        res.status(201).json({ 
            bookingId: booking._id, 
            totalAmount: Math.round(finalAmount), 
            status: 'pending',
            coupon: discountInfo.valid ? { code: couponCode, discount: discountInfo.discount, message: discountInfo.message } : null
        });
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

export default router;
