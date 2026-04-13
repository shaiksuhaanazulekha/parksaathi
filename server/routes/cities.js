import express from 'express';
import City from '../models/City.js';
import { getSurgePricing } from '../utils/pricing.js';

const router = express.Router();

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
        const city = await City.findOne({ name: req.params.name }).lean();
        if (!city) return res.status(404).json({ error: 'City not found' });
        res.json(city.areas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/pricing/:city/:area
router.get('/:city/:area', async (req, res) => {
    try {
        const city = await City.findOne({ name: req.params.city }).lean();
        const area = city?.areas.find(a => a.name === req.params.area);
        if (!area) return res.status(404).json({ error: 'Area not found' });
        res.json(area);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/recommend
router.get('/', async (req, res) => {
    try {
        const { city: cityName, area: areaName } = req.query;
        const city = await City.findOne({ name: cityName }).lean();
        const area = city?.areas.find(a => a.name === areaName);
        res.json(area || { avg: 40, min: 20, max: 80, demand: 'High' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cities/pricing/surge (TEST 2.2, 7.0)
router.get('/pricing/surge', async (req, res) => {
  try {
    const surge = await getSurgePricing();
    res.json({
      success: true,
      data: surge,
      cached: surge.fromCache,
      message: surge.fromCache
        ? 'Returned from 5-min cache'
        : 'Fresh calculation'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Surge pricing unavailable',
      fallback: { isSurge: false, multiplier: 1.0 }
    });
  }
});

export default router;
