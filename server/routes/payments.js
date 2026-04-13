import express from 'express';
import Booking from '../models/Booking.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', auth, async (req, res) => {
    res.json({
        id: 'order_demo_' + Date.now(),
        amount: req.body.amount,
        currency: 'INR'
    });
});

router.post('/verify', auth, async (req, res) => {
    try {
        const { bookingId, razorpay_payment_id } = req.body;
        if (!razorpay_payment_id) return res.status(400).json({ error: 'Payment failed validation' });

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: 'confirmed', paymentStatus: 'paid' },
            { new: true }
        );

        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
