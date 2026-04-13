import axios from 'axios';
import { mockApi } from './MockDB';

const isProd = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || (isProd ? '/api' : 'http://localhost:5000/api');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.authorization = `Bearer ${token}`;
  return config;
});

// Helper to handle failover to MockDB
const handleCall = async (cb, mockCb) => {
    try {
        // Try real API first
        const res = await cb();
        return res;
    } catch (err) {
        // Failover to MockDB if server is down or error occurs
        console.warn('Backend unavailable, using MockDB fallback...');
        if (mockCb) return mockCb();
        throw err;
    }
};

const apiService = {
  // Auth
  login:  (data) => handleCall(() => api.post('/auth/login', data), () => mockApi.login(data)),
  signup: (data) => handleCall(() => api.post('/auth/signup', data), () => mockApi.login(data)),
  getMe:  ()      => handleCall(() => api.get('/auth/me'),          () => mockApi.getSpots()), // MockMe placeholder

  // Locations
  getCities:    () => handleCall(() => api.get('/cities'), () => ({ data: ['Hyderabad', 'Bangalore'] })),
  
  // Spaces
  getSpots:     (params) => handleCall(() => api.get('/spots', { params }),     () => mockApi.getSpots()),
  getSpot:      (id)     => handleCall(() => api.get(`/spaces/${id}`),          () => mockApi.getSpot(id)),
  createSpot:   (data)   => handleCall(() => api.post('/spaces', data),         () => mockApi.createSpot(data)),
  getSlots:     (id, d)  => handleCall(() => api.get(`/spaces/${id}/slots`, { params: { date: d } }), () => mockApi.getSlots()),
  getOwnerSpaces: ()     => handleCall(() => api.get('/spaces/owner'),          () => mockApi.getOwnerSpaces()),

  // Bookings
  createBooking: (data) => handleCall(() => api.post('/bookings', data),      () => mockApi.createBooking(data)),
  getDriverBookings: () => handleCall(() => api.get('/bookings/driver'),      () => mockApi.getDriverBookings()),
  getOwnerBookings:  () => handleCall(() => api.get('/bookings/owner'),       () => mockApi.getOwnerBookings()),
  acceptBooking: (id)   => handleCall(() => api.put(`/bookings/${id}/accept`), () => mockApi.acceptBooking(id)),
  declineBooking: (id)  => handleCall(() => api.put(`/bookings/${id}/decline`),() => mockApi.declineBooking(id)),
  
  getBooking: (id) => handleCall(() => api.get(`/bookings/${id}`), () => ({ data: {} })),

  // Others
  getNotifications: () => handleCall(() => api.get('/notifications'), () => mockApi.getNotifications()),
  getPricing: (city, area) => handleCall(() => api.get('/pricing', { params: { city, area } }), () => ({ data: { avg: 45 } })),
  getRecommendation: () => Promise.resolve({ data: [] }),
};

export default apiService;
export const getStoredToken = () => localStorage.getItem('auth_token');
export const setStoredToken = (t) => t ? localStorage.setItem('auth_token', t) : localStorage.removeItem('auth_token');
