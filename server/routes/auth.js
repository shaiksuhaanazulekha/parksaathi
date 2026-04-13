const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'parksaathi_jwt_secret_2024';

const toProfile = (user) => ({
    ...user,
    id: user._id?.toString() || user.id,
    user_type: (user.role || 'driver').toLowerCase(),
});

// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Demo mode check would happen here if we wanted it
        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashed, role });
        const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET);
        res.json({ token, profile: toProfile(user.toObject()) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Demo bypass
        if (email === 'driver@demo.com' && password === 'demo123') {
            return res.json({ token: 'demo-driver-token', profile: { id: 'demo-driver-001', name: 'Demo Driver', role: 'Driver', user_type: 'driver' } });
        }
        if (email === 'owner@demo.com' && password === 'demo123') {
            return res.json({ token: 'demo-owner-token', profile: { id: 'demo-owner-001', name: 'Demo Owner', role: 'Owner', user_type: 'owner' } });
        }
        
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET);
        res.json({ token, profile: toProfile(user.toObject()) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        if (req.user.id?.startsWith('demo-')) {
            return res.json({ profile: { id: req.user.id, name: 'Demo User', role: req.user.role === 'demo' ? 'Driver' : req.user.role, user_type: 'driver' } });
        }
        const user = await User.findById(req.user.uid).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ profile: toProfile(user) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
