// --- 10,000+ Dynamic Global Spots Generator ---
const MAJOR_CITIES = [
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
];

const generateDiverseSpots = () => {
    const list = [];
    let idCounter = 100;

    // Add original core spots first for consistency
    list.push({ id: '1', name: 'Jubilee Hills P1', address: 'Plot 24, Road 36, Jubilee Hills', hourly_rate: 60, lat: 17.4483, lng: 78.3915, image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400', rating: 4.8, owner_id: 'o1', tags: ['luxury'] });

    MAJOR_CITIES.forEach(city => {
        // Generate ~700 spots per major city cluster = 10,500+ spots
        for (let i = 0; i < 700; i++) {
            const latOffset = (Math.random() - 0.5) * 0.2; // ~20km spread
            const lngOffset = (Math.random() - 0.5) * 0.2;
            list.push({
                id: `gen-${idCounter++}`,
                name: `${city.name} Smart Spot #${i + 1}`,
                address: `Sector ${Math.floor(Math.random() * 100)}, ${city.name}`,
                hourly_rate: 20 + Math.floor(Math.random() * 80),
                lat: city.lat + latOffset,
                lng: city.lng + lngOffset,
                image_url: `https://images.unsplash.com/photo-${1500000000000 + (i % 500)}?w=400`,
                rating: (4 + Math.random() * 1).toFixed(1),
                owner_id: `o-gen-${Math.floor(i / 10)}`,
                tags: ['instant', i % 5 === 0 ? 'ev-charging' : 'standard', i % 2 === 0 ? 'covered' : 'open']
            });
        }
    });
    return list;
};

const STORAGE_KEY_SPOTS = 'parksaathi_spots';
const STORAGE_KEY_BOOKINGS = 'parksaathi_bookings';
const DEFAULT_SPOTS = generateDiverseSpots();

// Vector Search Simulation Helper
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const MockDB = {
    getSpots: async (filters = {}) => {
        let spots = JSON.parse(localStorage.getItem(STORAGE_KEY_SPOTS));

        // If local storage is empty or simulated "first run", use defaults
        // Also if the count is low (from previous session), reload defaults to get 10k
        if (!spots || spots.length < 100) {
            spots = DEFAULT_SPOTS;
            localStorage.setItem(STORAGE_KEY_SPOTS, JSON.stringify(spots));
        }

        if (filters.lat && filters.lng) {
            spots = spots.map(spot => ({
                ...spot,
                distance: calculateDistance(filters.lat, filters.lng, spot.lat, spot.lng)
            })).sort((a, b) => a.distance - b.distance);
        }
        if (filters.query) {
            const q = filters.query.toLowerCase();
            spots = spots.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.address.toLowerCase().includes(q) ||
                s.tags.some(t => t.includes(q))
            );
        }
        return spots.slice(0, 300); // Return top 300 nearest for performance
    },

    getSpotById: async (id) => {
        const spots = JSON.parse(localStorage.getItem(STORAGE_KEY_SPOTS)) || DEFAULT_SPOTS;
        return spots.find(s => s.id === id);
    },

    addSpot: async (spotData) => {
        const spots = JSON.parse(localStorage.getItem(STORAGE_KEY_SPOTS)) || DEFAULT_SPOTS;
        const newSpot = { ...spotData, id: Date.now().toString(), rating: '5.0' };
        spots.push(newSpot);
        localStorage.setItem(STORAGE_KEY_SPOTS, JSON.stringify(spots));
        return newSpot;
    },

    getBookings: async (userId) => {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKINGS)) || [];
        // We avoid fetching all 10k spots here to prevent perf issues, just map simple details if needed
        // or just use what's stored in booking
        return all.filter(b => b.driver_id === userId);
    },

    createBooking: async (booking) => {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKINGS)) || [];
        const newBooking = { ...booking, id: 'BK' + Date.now(), status: 'Active', created_at: new Date() };
        all.push(newBooking);
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(all));
        return newBooking;
    },

    getOwnerStats: async () => {
        const allBookings = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKINGS)) || [];
        // Mock stats for demo
        return {
            totalEarnings: allBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
            activeBookings: allBookings.filter(b => b.status === 'Active').length,
            spotViews: Math.floor(Math.random() * 5000) + 500
        };
    }
};
