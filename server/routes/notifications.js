const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   GET /api/notifications
router.get('/', auth, async (req, res) => {
    try {
        const n = await Notification.find({ userId: req.user.uid || req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        res.json(n);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
