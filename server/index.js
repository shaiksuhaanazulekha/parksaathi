import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.js';
import spaceRoutes from './routes/spaces.js';
import bookingRoutes from './routes/bookings.js';
import uploadRoutes from './routes/upload.js';
import citiesRoutes from './routes/cities.js';
import notifRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import healthRoutes from './routes/health.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Rate Limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: { error: 'Too Many Requests' } });
app.use(limiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make IO globally accessible
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/health', healthRoutes);

// Compatibility Aliases
app.use('/api/spots', spaceRoutes); 
app.use('/api/recommend', citiesRoutes);
app.use('/api/pricing', citiesRoutes);

// DB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('⚠️  MongoDB connection error:', err.message));

app.use(errorHandler);

// Only listen if not in a serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`\n🚗 ParkSaathi API running on http://localhost:${PORT}`);
    });
}

export default app;
