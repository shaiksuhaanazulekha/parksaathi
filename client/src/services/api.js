import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 8000,
});

// ─── Token Helpers ────────────────────────────────────────────
export const getStoredToken = () => {
    try {
        const demo = localStorage.getItem('demo_session');
        if (demo) {
            const s = JSON.parse(demo);
            const role = (s.profile?.role || s.profile?.user_type || 'driver').toLowerCase();
            return `demo-${role}-token`;
        }
    } catch { /* ignore */ }
    return localStorage.getItem('auth_token') || null;
};

export const setStoredToken = (token) => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
};

// ─── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (err) => Promise.reject(err));

// ─── Response Interceptor ─────────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('demo_session');
        }
        const message = err.response?.data?.error || err.message || 'Network error';
        return Promise.reject(new Error(message));
    }
);

// ─── API Service ──────────────────────────────────────────────
const apiService = {
    // Auth
    login:       (email, password) => api.post('/auth/login',  { email, password }),
    signup:      (data)            => api.post('/auth/signup', data),
    getProfile:  ()                => api.get('/auth/me'),
    updateProfile: (id, data)      => api.put(`/profiles/${id}`, data),

    // Spots
    getSpots:    (params = {})     => api.get('/spots', { params }),
    getSpotById: (id)              => api.get(`/spots/${id}`),
    getOwnerSpots: (ownerId)       => api.get(`/spots/owner/${ownerId}`),
    createSpot:  (data)            => api.post('/spots', data),
    updateSpot:  (id, data)        => api.put(`/spots/${id}`, data),
    deleteSpot:  (id)              => api.delete(`/spots/${id}`),

    // Bookings
    createBooking:       (data)         => api.post('/bookings', data),
    getUserBookings:     (userId)       => api.get(`/bookings/user/${userId}`),
    getBookingById:      (id)           => api.get(`/bookings/${id}`),
    getOwnerBookings:    (ownerId)      => api.get(`/owner/bookings/${ownerId}`),
    updateBookingStatus: (id, status)   => api.patch(`/bookings/${id}/status`, { status }),

    // Payments
    processPayment: (data) => api.post('/payments', data),

    // Owner
    getOwnerStats:   (ownerId) => api.get(`/owner/stats/${ownerId}`),
    getOwnerHistory: (ownerId) => api.get(`/owner/history/${ownerId}`),

    // Notifications
    getNotifications:       ()   => api.get('/notifications'),
    markNotificationRead:   (id) => api.patch(`/notifications/${id}/read`, {}),
};

export default apiService;
