const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

// @route   POST /api/payments/create-order
router.post('/create-order', auth, async (req, res) => {
    // Simulated Razorpay order creation
    res.json({
        id: 'order_demo_' + Date.now(),
        amount: req.body.amount,
        currency: 'INR'
    });
});

// @route   POST /api/payments/verify
router.post('/verify', auth, async (req, res) => {
    try {
        const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        
        // Simulated Signature verification
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

module.exports = router;
