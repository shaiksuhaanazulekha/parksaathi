require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/parksaathi';

// Socket.io Setup
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        if (userId) socket.join(userId);
    });
});

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.set('trust proxy', 1);

// Rate Limiting (TEST 7)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: { error: 'Too Many Requests' } });
app.use(limiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make IO globally accessible
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth');
const spaceRoutes = require('./routes/spaces');
const bookingRoutes = require('./routes/bookings');
const uploadRoutes = require('./routes/upload');
const citiesRoutes = require('./routes/cities');
const notifRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/health', healthRoutes);

// Compatibility Aliases (for old frontend calls)
app.use('/api/spots', spaceRoutes); 
app.use('/api/pricing', citiesRoutes);

// DB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('⚠️  MongoDB connection error:', err.message));

// Error Handler
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`\n🚗 ParkSaathi API running on http://localhost:${PORT}`);
    console.log(`🖼️  Static uploads served at http://localhost:${PORT}/uploads`);
});
