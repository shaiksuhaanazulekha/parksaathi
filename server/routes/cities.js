const express = require('express');
const router = express.Router();
const City = require('../models/City');

// GET /api/cities
router.get('/', async (req, res) => {
    try {
        const cities = await City.find({}).select('name range min max');
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cities/:name/areas
router.get('/:name/areas', async (req, res) => {
    try {
        const city = await City.findOne({ name: req.params.name });
        if (!city) return res.status(404).json({ error: 'City not found' });
        res.json(city.areas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/pricing/:city/:area
router.get('/pricing/:city/:area', async (req, res) => {
    try {
        const city = await City.findOne({ name: req.params.city });
        if (!city) return res.status(404).json({ error: 'City not found' });
        
        const area = city.areas.find(a => a.name === req.params.area);
        if (!area) return res.status(404).json({ error: 'Area not found' });
        
        res.json(area);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
