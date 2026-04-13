const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Demo bypass
    if (token?.startsWith('demo-token-')) {
        req.user = { id: token.replace('demo-token-', ''), role: 'demo' };
        return next();
    }

    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'parksaathi_secret_key_2024');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

exports.owner = (req, res, next) => {
    if (req.user?.role?.toLowerCase() !== 'owner' && req.user?.role !== 'demo') {
        return res.status(403).json({ error: 'Access denied. Owners only.' });
    }
    next();
};
