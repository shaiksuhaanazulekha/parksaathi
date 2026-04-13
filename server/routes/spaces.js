import express from 'express';
import ParkingSpace from '../models/ParkingSpace.js';
import Booking from '../models/Booking.js';
import City from '../models/City.js';
import { auth, owner } from '../middleware/auth.js';

const router = express.Router();

// GET /api/spaces
router.get('/', async (req, res) => {
    try {
        const { city, area } = req.query;
        const query = { status: 'live' };
        if (city) query.city = city;
        if (area) query.area = area;

        const spaces = await ParkingSpace.find(query).lean();
        res.json(spaces);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/spaces/:id
router.get('/:id', async (req, res) => {
    try {
        const space = await ParkingSpace.findById(req.params.id).lean();
        if (!space) return res.status(404).json({ error: 'Space not found' });
        
        // Get booked slots for the next 7 days
        const bookings = await Booking.find({ 
            spaceId: req.params.id, 
            status: { $ne: 'cancelled' } 
        }).select('date startTime duration status').lean();

        res.json({ ...space, bookedSlots: bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/spaces
router.post('/', auth, owner, async (req, res) => {
    try {
        const cityData = await City.findOne({ name: req.body.city }).lean();
        const areaData = cityData?.areas.find(a => a.name === req.body.area);

        const space = await ParkingSpace.create({
            ...req.body,
            ownerId: req.user.uid || req.user.id,
            cityPricing: areaData ? { min: areaData.min, max: areaData.max, avg: areaData.avg, zone: areaData.zone } : null
        });
        res.status(201).json({ spaceId: space._id, status: 'live' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/spaces/search
router.get('/search', async (req, res) => {
    try {
        const { q, lat, lng } = req.query;
        const query = { status: 'live' };
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }
        const spaces = await ParkingSpace.find(query).lean();
        res.json(spaces);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/spaces/:id/block-slot
router.post('/:id/block-slot', auth, owner, async (req, res) => {
    try {
        const { date, startTime, endTime, reason } = req.body;
        const space = await ParkingSpace.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.uid || req.user.id },
            { $push: { blockedSlots: { date, startTime, endTime, reason } } },
            { new: true }
        );
        if (!space) return res.status(404).json({ error: 'Space not found' });
        res.json({ success: true, space });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/spaces/:id/block-slot
router.delete('/:id/block-slot', auth, owner, async (req, res) => {
    try {
        const { date, startTime } = req.body;
        const space = await ParkingSpace.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.uid || req.user.id },
            { $pull: { blockedSlots: { date, startTime } } },
            { new: true }
        );
        if (!space) return res.status(404).json({ error: 'Space not found' });
        res.json({ success: true, space });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/spaces/:id/status
router.put('/:id/status', auth, owner, async (req, res) => {
    try {
        const { status } = req.body;
        const space = await ParkingSpace.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.uid || req.user.id },
            { status },
            { new: true }
        );
        if (!space) return res.status(404).json({ error: 'Space not found' });
        res.json({ success: true, space });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/spaces/:id
router.delete('/:id', auth, owner, async (req, res) => {
    try {
        const activeBookings = await Booking.countDocuments({ 
            spaceId: req.params.id, 
            status: { $in: ['pending', 'confirmed'] } 
        });
        
        if (activeBookings > 0) {
            return res.status(400).json({ error: 'Cannot delete space with active bookings' });
        }
        
        await ParkingSpace.findOneAndDelete({ _id: req.params.id, ownerId: req.user.uid || req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
