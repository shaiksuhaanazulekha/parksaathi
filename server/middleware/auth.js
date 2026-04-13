import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    // Demo bypass
    const demoToken = req.headers['x-demo-token'];
    if (demoToken) {
        req.user = { id: demoToken, uid: demoToken, role: demoToken.split('-')[1] };
        return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Auth required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const owner = (req, res, next) => {
    const role = (req.user?.role || '').toLowerCase();
    if (role !== 'owner') return res.status(403).json({ error: 'Owner access required' });
    next();
};
