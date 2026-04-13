const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only JPG, PNG and WEBP allowed'));
    }
});

// @route   POST /api/upload/photo
// @desc    Upload a photo directly
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // Generate URL (In production this would be Replit URL or S3)
        const baseUrl = process.env.VITE_API_URL?.replace('/api', '') || `http://localhost:${process.env.PORT || 5000}`;
        const url = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({
            url,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/upload/photo/:filename
// @desc    Delete a photo
router.delete('/photo/:filename', auth, async (req, res) => {
    try {
        const filepath = path.join('uploads', req.params.filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        res.json({ message: 'File deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
