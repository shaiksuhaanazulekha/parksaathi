import express from 'express';
import mongoose from 'mongoose';
import * as kvStore from '../services/kvStore.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: "ok",
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        replitDB: kvStore.checkHealth(),
        objectStorage: "connected",
        vectorStore: "connected",
        uptime: Math.floor(process.uptime())
    });
});

export default router;
