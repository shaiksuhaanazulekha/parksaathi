// Production-Grade Mock Database to ensure ParkSaathi works 100% offline or with server issues
const STORAGE_KEY = 'parksaathi_db';

const INITIAL_DATA = {
    users: [
        { id: 'demo-u1', email: 'driver@demo.com', role: 'driver', name: 'Rahul Driver', wallet: 500 },
        { id: 'demo-u2', email: 'owner@demo.com', role: 'owner', name: 'Priya Owner', wallet: 1000 }
    ],
    spaces: [
        { 
            _id: 's1', 
            name: 'Kompally Parking Hub', 
            area: 'Kompally', 
            city: 'Hyderabad', 
            pricing: { basePrice: 40 },
            cityPricing: { avg: 55 },
            status: 'live',
            ownerId: 'demo-u2',
            lat: 17.535,
            lng: 78.4836,
            photos: [{ url: 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=400' }]
        },
        { 
            _id: 's2', 
            name: 'Jubilee Hills Spot', 
            area: 'Jubilee Hills', 
            city: 'Hyderabad', 
            pricing: { basePrice: 60 },
            cityPricing: { avg: 80 },
            status: 'live',
            ownerId: 'demo-u2',
            lat: 17.4302,
            lng: 78.4074,
            photos: [{ url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400' }]
        }
    ],
    bookings: [
        { _id: 'b1', spaceId: 's1', ownerId: 'demo-u2', driverId: 'demo-u1', date: '2024-04-13', startTime: '14:00', duration: 2, pricing: { totalAmount: 120 }, status: 'confirmed' }
    ],
    notifications: []
};

const getDB = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_DATA;
};

const saveDB = (db) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

export const mockApi = {
    // Auth
    login: (credentials) => {
        const db = getDB();
        const user = db.users.find(u => u.email === credentials.email);
        if (user) return { data: { token: 'mock-jwt-token', profile: user } };
        throw new Error('User not found in MockDB');
    },

    // Spaces
    getSpots: () => ({ data: [...getDB().spaces].reverse() }),
    getSpot: (id) => ({ data: getDB().spaces.find(s => s._id === id) }),
    getOwnerSpaces: () => {
        const db = getDB();
        return { data: [...db.spaces].reverse() };
    },

    createSpot: (data) => {
        const db = getDB();
        const basePrice = data.pricing?.basePrice || data.basePrice || 40;
        const newSpot = {
            _id: 's' + Date.now(),
            ...data,
            lat: data.lat || data.coordinates?.lat || 17.4483,
            lng: data.lng || data.coordinates?.lng || 78.3915,
            pricing: { ...data.pricing, basePrice },
            ownerId: 'demo-u2',
            status: 'live',
            totalBookings: 0,
            cityPricing: { avg: 50 },
            rating: 4.8
        };
        db.spaces.push(newSpot);
        saveDB(db);
        return { data: newSpot };
    },

    // Bookings
    createBooking: (bookingData) => {
        const db = getDB();
        const space = db.spaces.find(s => s._id === bookingData.spaceId);
        const newBooking = {
            _id: 'b' + Date.now(),
            ...bookingData,
            ownerId: space.ownerId,
            driverId: 'demo-u1',
            status: 'pending',
            pricing: { totalAmount: space.pricing.basePrice * bookingData.duration }
        };
        db.bookings.push(newBooking);
        saveDB(db);
        return { data: newBooking };
    },
    
    getOwnerBookings: () => ({ data: [...getDB().bookings].reverse() }),
    getDriverBookings: () => ({ data: [...getDB().bookings].reverse() }),

    acceptBooking: (id) => {
        const db = getDB();
        const b = db.bookings.find(x => x._id === id);
        if (b) b.status = 'confirmed';
        saveDB(db);
        return { data: b };
    },

    declineBooking: (id) => {
        const db = getDB();
        const b = db.bookings.find(x => x._id === id);
        if (b) b.status = 'cancelled';
        saveDB(db);
        return { data: b };
    },

    getNotifications: () => ({ data: getDB().notifications }),
    getRecommendation: () => ({ data: [] }),
    getSlots: (spaceId, date) => {
        const db = getDB();
        const baseSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
        const bookedHours = db.bookings
            .filter(b => b.spaceId === spaceId && b.date === date && b.status !== 'cancelled')
            .map(b => b.startTime);
            
        return { 
            data: { 
                available: baseSlots.filter(s => !bookedHours.includes(s)), 
                booked: bookedHours, 
                surge: ['10:00', '11:00', '17:00', '18:00'] 
            } 
        };
    }
};
