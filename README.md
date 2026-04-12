# 🚗 ParkSaathi - Smart Parking Booking App

ParkSaathi is a premium, full-stack parking management platform that connects house owners with empty parking spaces to drivers looking for secure parking.

## ✨ Features

### For Drivers
- **Interactive Map**: Real-time view of nearby parking spots using Leaflet/OSM.
- **Smart Search**: Filter by location, price, and availability.
- **Easy Booking**: Select time slots and get instant price calculations.
- **Secure Payment**: Integrated payment flow (powered by Stripe simulation).
- **Navigation**: One-tap Google Maps navigation to your booked spot.

### For House Owners
- **Owner Dashboard**: Track total earnings, active bookings, and spot views.
- **Spot Listing**: Register your space with coordinates, photos, and dynamic pricing.
- **Request Management**: Accept or reject incoming booking requests with real-time notifications.
- **Earnings History**: Detailed reports of all past transactions.

### Shared Features
- **Real-time Notifications**: Alerts for booking updates, payments, and reminders.
- **Role Switching**: Instant swap between Driver and Owner profiles.
- **Profile Management**: Update personal info and profile photos with image cropping.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT.
- **Payments**: Stripe (Checkout simulation).
- **Maps**: Leaflet (OpenStreetMap) with Google Maps Directions.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or an Atlas URI)

### Installation

1. **Clone the project**
   ```bash
   git clone <repo-url>
   cd Parksaathi
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in `server/`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/parksaathi
   JWT_SECRET=your_jwt_secret_here
   STRIPE_SECRET_KEY=sk_test_your_key
   ```
   Start server: `npm run dev`

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in `client/`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Start client: `npm run dev`

## 🧪 Demo Access
Don't want to register? Use our quick access credentials:
- **Driver**: `driver@demo.com` / `demo123`
- **Owner**: `owner@demo.com` / `demo123`

## 📁 Project Structure
- `/client`: Frontend React application.
- `/server`: Express API with MongoDB models.
- `/server/models`: Database schemas for User, Spot, Booking, and Notification.

---

Built with ❤️ by Antigravity AI
