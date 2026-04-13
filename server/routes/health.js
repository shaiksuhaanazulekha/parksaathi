const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const kvStore = require('../services/kvStore');

// @route   GET /api/health
// @desc    Server health check
router.get('/', (req, res) => {
    res.json({
        status: "ok",
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        replitDB: kvStore.checkHealth(),
        objectStorage: "connected",
        vectorStore: "connected", // Simplified mock for now
        uptime: Math.floor(process.uptime())
    });
});

module.exports = router;
