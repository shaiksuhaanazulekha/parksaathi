import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
});

// ────────────────────────────────────────────────
//  Token helpers
// ────────────────────────────────────────────────
export function getStoredToken() {
    // 1. Demo session
    const demoRaw = localStorage.getItem('demo_session');
    if (demoRaw) {
        try {
            const s = JSON.parse(demoRaw);
            const role = (s.profile?.role || s.profile?.user_type || 'driver').toLowerCase();
            return `demo-${role}-token`;
        } catch { /* ignore */ }
    }
    // 2. Real JWT from backend login
    return localStorage.getItem('auth_token') || null;
}

export function setStoredToken(token) {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
}

// ────────────────────────────────────────────────
//  Request interceptor — attach token automatically
// ────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (err) => Promise.reject(err));

// ────────────────────────────────────────────────
//  Response interceptor — auto logout on 401
// ────────────────────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('demo_session');
        }
        return Promise.reject(err);
    }
);

// ────────────────────────────────────────────────
//  API Service
// ────────────────────────────────────────────────
const apiService = {
    // ── Auth ──────────────────────────────────────
    getProfile:  ()             => api.get('/auth/me'),
    signup:      (data)         => api.post('/auth/signup', data),
    login:       (email, pass)  => api.post('/auth/login', { email, password: pass }),

    // ── Profile ───────────────────────────────────
    createProfile: (data)           => api.post('/profiles', data),
    updateProfile: (id, updates)    => api.put(`/profiles/${id}`, updates),

    // ── Parking Spots ─────────────────────────────
    getSpots:    (filters = {})     => api.get('/spots',         { params: filters }),
    getSpotById: (id)               => api.get(`/spots/${id}`),
    getOwnerSpots: (ownerId)        => api.get(`/spots/owner/${ownerId}`),
    createSpot:  (data)             => api.post('/spots',        data),
    updateSpot:  (id, data)         => api.put(`/spots/${id}`,   data),
    deleteSpot:  (id)               => api.delete(`/spots/${id}`),

    // ── Bookings ──────────────────────────────────
    createBooking:      (data)           => api.post('/bookings',                data),
    getUserBookings:    (userId)         => api.get(`/bookings/user/${userId}`),
    getOwnerBookings:   (ownerId)        => api.get(`/owner/bookings/${ownerId}`),
    updateBookingStatus:(id, status)     => api.patch(`/bookings/${id}/status`,   { status }),

    // ── Payments ──────────────────────────────────
    createPayment: (data) => api.post('/payments', data),

    // ── Owner Stats / History ─────────────────────
    getOwnerStats:   (ownerId) => api.get(`/owner/stats/${ownerId}`),
    getOwnerHistory: (ownerId) => api.get(`/owner/history/${ownerId}`),

    // ── Notifications ─────────────────────────────
    getNotifications: ()   => api.get('/notifications'),
    markRead:        (id)  => api.patch(`/notifications/${id}/read`, {}),

    // ── Google Drive Upload ───────────────────────
    getDriveAuth:      () => api.get('/upload/drive-auth'),
    uploadDrivePhoto:  (data) => api.post('/upload/drive-photo', data),
    deleteDrivePhoto:  (fileId, data) => api.delete(`/upload/drive-photo/${fileId}`, { data }),
};

export default apiService;
