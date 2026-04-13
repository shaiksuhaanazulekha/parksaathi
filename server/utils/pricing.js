const kvStore = require('../services/kvStore');

const getSurge = (dateStr, timeStr) => {
    // Check cache (TEST 2.2)
    const cacheKey = `surge:${dateStr}:${timeStr}`;
    const cached = kvStore.get(cacheKey);
    if (cached) return cached;

    const date = new Date(dateStr);
    const hour = parseInt(timeStr.split(':')[0]);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Peak hours: 8-10AM, 5-8PM
    const isPeak = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20);
    
    let result;
    if (isPeak) result = { isSurge: true, multiplier: 1.3, reason: 'Peak Hour Surge' };
    else if (isWeekend) result = { isSurge: true, multiplier: 1.2, reason: 'Weekend Surge' };
    else result = { isSurge: false, multiplier: 1.0, reason: '' };

    kvStore.set(cacheKey, result, 300); // 5 min TTL
    return result;
};

module.exports = { getSurge };
