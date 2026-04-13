import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const user = await User.create({ name, email, password, role });
        const token = jwt.sign({ id: user._id, uid: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Demo Bypass
        if (email === 'driver@demo.com' && password === 'demo123') {
            return res.json({ token: 'demo-driver', user: { name: 'Demo Driver', role: 'Driver' } });
        }
        if (email === 'owner@demo.com' && password === 'demo123') {
            return res.json({ token: 'demo-owner', user: { name: 'Demo Owner', role: 'Owner' } });
        }

        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, uid: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        if (req.user.id.startsWith('demo-')) {
            return res.json({ name: req.user.id.includes('driver') ? 'Demo Driver' : 'Demo Owner', role: req.user.role });
        }
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
