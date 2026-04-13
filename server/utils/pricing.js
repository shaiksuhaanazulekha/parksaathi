const getSurge = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const hour = parseInt(timeStr.split(':')[0]);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Peak hours: 8-10AM, 5-8PM
    const isPeak = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20);
    
    if (isPeak) return { isSurge: true, multiplier: 1.3, reason: 'Peak Hour Surge' };
    if (isWeekend) return { isSurge: true, multiplier: 1.2, reason: 'Weekend Surge' };
    return { isSurge: false, multiplier: 1.0, reason: '' };
};

module.exports = { getSurge };
