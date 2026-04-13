import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.authorization = `Bearer ${token}`;
  return config;
});

const apiService = {
  // Auth
  login:  (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  getMe:  () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getBookingById: (id) => api.get(`/bookings/${id}`),

  // Locations
  getCities:    () => api.get('/cities'),
  getAreas:     (city) => api.get(`/cities/${city}/areas`),
  getPricing:   (city, area) => api.get(`/pricing/${city}/${area}`),
  saveLocation: (data) => api.post('/user/location', data),

  // Spaces
  getSpots:     (params) => api.get('/spots', { params }),
  getSpot:      (id) => api.get(`/spaces/${id}`),
  createSpot:   (data) => api.post('/spaces', data),
  getSlots:     (id, date) => api.get(`/spaces/${id}/slots`, { params: { date } }),
  getOwnerSpaces: () => api.get('/spaces/owner'),
  deletePhoto: (filename) => api.delete(`/upload/photo/${filename}`),

  // Pricing Intel
  getRecommendation: (city, area) => api.get('/pricing/recommend', { params: { city, area } }),
  getSurge:          (time) => api.get('/pricing/surge', { params: { time } }),

  // Bookings
  createBooking: (data) => api.post('/bookings', data),
  getDriverBookings: () => api.get('/bookings/driver'),
  getBooking:    (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

export default apiService;
export const getStoredToken = () => localStorage.getItem('auth_token');
export const setStoredToken = (t) => t ? localStorage.setItem('auth_token', t) : localStorage.removeItem('auth_token');
