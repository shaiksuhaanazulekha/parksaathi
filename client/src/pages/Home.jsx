import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Navigation, List, Map, Star, Loader2 } from 'lucide-react';
import MapView from '../components/MapView';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=400&auto=format';

const Home = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [searchQuery, setSearchQuery]   = useState('');
    const [viewMode, setViewMode]         = useState('map');
    const [showFilters, setShowFilters]   = useState(false);
    const [priceRange, setPriceRange]     = useState(500);
    const [spots, setSpots]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [coords, setCoords]             = useState({ lat: 17.4483, lng: 78.3915 });

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {}
        );
    }, []);

    const fetchSpots = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await apiService.getSpots({ query: searchQuery, lat: coords.lat, lng: coords.lng });
            const filtered = (data || []).filter(s => (s.pricePerHour || s.hourly_rate || 0) <= priceRange);
            setSpots(filtered);
        } catch {
            setSpots([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, coords, priceRange]);

    useEffect(() => {
        const timer = setTimeout(fetchSpots, 300);
        return () => clearTimeout(timer);
    }, [fetchSpots]);

    const handleSpotSelect = (spot) => navigate(`/book/${spot.id || spot._id}`);

    return (
        <div className="h-screen flex flex-col relative overflow-hidden bg-gray-50">
            {/* Header overlay */}
            <div className="absolute top-0 left-0 right-0 z-[500] p-4 pointer-events-none">
                <div className="max-w-lg mx-auto space-y-3 pointer-events-auto">
                    {/* Search bar */}
                    <div className="flex items-center gap-2 bg-white/96 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/60">
                        <div className="p-2 border-r border-gray-100 shrink-0">
                            <img src="/logo.png" alt="logo" className="w-6 h-6 object-contain" />
                        </div>
                        <Search size={18} className="text-park-primary shrink-0 ml-1" />
                        <input
                            type="text"
                            placeholder="Search parking in Hyderabad..."
                            className="flex-1 bg-transparent outline-none text-sm font-semibold text-park-dark placeholder:text-gray-400 min-w-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            className={`p-2 rounded-xl transition-all shrink-0 ${showFilters ? 'bg-park-primary text-white' : 'text-gray-400 hover:text-park-primary'}`}
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>

                    {/* Filters panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, y: -10 }}
                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                exit={{ height: 0, opacity: 0, y: -10 }}
                                className="bg-white/96 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 overflow-hidden"
                            >
                                <div className="p-5 space-y-5">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-park-dark">Filters</h3>
                                        <button
                                            onClick={() => { setPriceRange(500); setShowFilters(false); }}
                                            className="text-xs font-bold text-park-primary"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Price</label>
                                            <span className="text-xs font-bold text-park-primary">₹{priceRange}/hr</span>
                                        </div>
                                        <input
                                            type="range" min="20" max="500" step="10"
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                            className="w-full accent-park-primary h-2"
                                        />
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-gray-400">₹20</span>
                                            <span className="text-[10px] text-gray-400">₹500</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="w-full py-3 bg-park-primary text-white text-sm font-bold rounded-xl"
                                    >
                                        Apply Filters ({spots.length} results)
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Map / List toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                                viewMode === 'map' ? 'bg-park-primary text-white shadow-park-primary/30' : 'bg-white/90 backdrop-blur-sm text-park-dark'
                            }`}
                        >
                            <Map size={15} /> Map
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                                viewMode === 'list' ? 'bg-park-primary text-white shadow-park-primary/30' : 'bg-white/90 backdrop-blur-sm text-park-dark'
                            }`}
                        >
                            <List size={15} /> List
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 w-full relative">
                {viewMode === 'map' ? (
                    <div className="absolute inset-0">
                        <MapView onSpotSelect={handleSpotSelect} />
                    </div>
                ) : (
                    <div className="h-full pt-44 px-4 pb-24 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-park-primary" size={32} />
                            </div>
                        ) : spots.length > 0 ? (
                            <div className="max-w-lg mx-auto space-y-4">
                                {spots.map((spot, i) => (
                                    <motion.div
                                        key={spot.id || spot._id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => handleSpotSelect(spot)}
                                        className="bg-white rounded-3xl shadow-sm border border-gray-100 flex gap-4 p-4 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
                                    >
                                        <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                                            <img
                                                src={spot.photos?.[0] || FALLBACK_IMG}
                                                alt={spot.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = FALLBACK_IMG; }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-park-dark text-sm leading-tight truncate">{spot.name}</h3>
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600 shrink-0">
                                                        Available
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-1 truncate">
                                                    <MapPin size={10} className="text-park-primary shrink-0" />
                                                    {spot.address}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                                                    <span className="text-[11px] font-bold text-gray-600">{spot.rating || '4.5'}</span>
                                                    {spot.distance && (
                                                        <span className="text-[10px] text-gray-400 ml-1">• {spot.distance.toFixed(1)} km</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-park-primary font-black text-lg leading-none">
                                                    ₹{spot.pricePerHour || spot.hourly_rate}
                                                    <span className="text-[10px] text-gray-400 font-bold ml-0.5">/hr</span>
                                                </span>
                                                <button className="bg-park-dark text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                                                    Book
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="bg-gray-100 p-8 rounded-full mb-4">
                                    <Search size={40} className="text-gray-300" />
                                </div>
                                <p className="font-bold text-park-dark">No spots found</p>
                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                                <button onClick={() => { setSearchQuery(''); setPriceRange(500); }} className="mt-4 text-park-primary text-sm font-bold">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating spot card (map mode) */}
            <AnimatePresence>
                {viewMode === 'map' && spots.length > 0 && (
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                        onClick={() => handleSpotSelect(spots[0])}
                        className="absolute bottom-24 left-4 right-4 z-[400] cursor-pointer max-w-lg mx-auto"
                    >
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 flex items-center gap-4 px-5 py-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                                <img
                                    src={spots[0].photos?.[0] || FALLBACK_IMG}
                                    alt={spots[0].name}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.src = FALLBACK_IMG; }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-park-dark text-sm truncate">{spots[0].name}</h4>
                                <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{spots[0].address}</p>
                                <p className="text-park-primary font-black text-sm mt-0.5">
                                    ₹{spots[0].pricePerHour || spots[0].hourly_rate}/hr
                                </p>
                            </div>
                            <button className="bg-park-primary text-white p-3.5 rounded-2xl shadow-lg shadow-park-primary/30 shrink-0">
                                <Navigation size={20} fill="currentColor" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
