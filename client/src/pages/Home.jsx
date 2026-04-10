import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, List, MapPin, Navigation } from 'lucide-react';
import MapView from '../components/MapView';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';


const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const [spots, setSpots] = useState([]);
    const [coords, setCoords] = useState({ lat: 17.3850, lng: 78.4867 }); // Default to Hyd
    const navigate = useNavigate();

    useEffect(() => {
        const getGeoLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setCoords({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                    }
                );
            }
        };
        getGeoLocation();
    }, []);

    useEffect(() => {
        const fetchSpots = async () => {
            try {
                const { data } = await apiService.getSpots({
                    query: searchQuery,
                    lat: coords.lat,
                    lng: coords.lng
                });
                setSpots(data);
            } catch (error) {
                console.error("Failed to fetch spots", error);
            }
        };
        fetchSpots();
    }, [searchQuery, coords]);

    const handleSpotSelect = (spot) => {
        navigate(`/book/${spot.id}`);
    };


    return (
        <div className="h-screen flex flex-col relative bg-gray-50 overflow-hidden">
            {/* Search Header - Sticky-like but absolute for map overlay */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                <div className="max-w-md mx-auto space-y-3 pointer-events-auto">
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-park-primary/5">
                        <div className="p-2 flex items-center pr-1 border-r border-gray-100">
                             <img src="/logo.png" alt="logo" className="w-6 h-6 object-contain" />
                        </div>
                        <div className="p-1 pl-2 text-park-primary">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search parking in Hyderabad..."
                            className="flex-1 bg-transparent outline-none text-sm font-semibold text-park-dark placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="p-2 text-gray-400 hover:text-park-primary transition-colors">
                            <SlidersHorizontal size={22} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'map' ? 'bg-park-primary text-white scale-105' : 'bg-white/90 backdrop-blur-sm text-park-dark'
                                }`}
                            onClick={() => setViewMode('map')}
                        >
                            <Navigation size={16} /> Map
                        </button>
                        <button
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-park-primary text-white scale-105' : 'bg-white/90 backdrop-blur-sm text-park-dark'
                                }`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} /> List
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full relative">
                {viewMode === 'map' ? (
                    <div className="absolute inset-0">
                        <MapView onSpotSelect={handleSpotSelect} />
                    </div>
                ) : (
                    <div className="h-full pt-40 px-4 pb-24 overflow-y-auto scrollbar-hide">
                        <div className="max-w-md mx-auto space-y-4">
                            {spots.length > 0 ? (
                                spots.map((spot) => (
                                    <motion.div
                                        key={spot.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => handleSpotSelect(spot)}
                                        className="card flex gap-4 cursor-pointer active:scale-[0.98] border-park-primary/5"
                                    >
                                        <div className="w-24 h-24 bg-park-gray rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                            <img 
                                                src={spot.photo_urls?.[0] || spot.image_url} 
                                                alt="parking" 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between flex-1 py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-park-dark leading-tight">{spot.name}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${spot.is_occupied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        {spot.is_occupied ? 'Busy' : 'Available'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-tighter">
                                                    <span className="flex items-center gap-1 text-park-primary bg-park-primary/5 px-2 py-0.5 rounded-md">
                                                        <MapPin size={10} /> {spot.distance ? `${spot.distance.toFixed(1)} km` : 'Near you'}
                                                    </span>
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded-md">{spot.duration || '5 min'}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-park-primary font-black text-xl leading-none">₹{spot.hourly_rate || spot.price}<span className="text-[10px] text-gray-400 font-bold uppercase ml-1">/hr</span></span>
                                                <button
                                                    disabled={spot.is_occupied}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md ${spot.is_occupied ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-park-dark text-white'}`}
                                                >
                                                    {spot.is_occupied ? 'Occupied' : 'Details'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="bg-park-gray p-6 rounded-full mb-4">
                                        <Search size={40} className="text-gray-300" />
                                    </div>
                                    <p className="font-bold text-park-dark">No spots found</p>
                                    <p className="text-sm text-gray-400">Try adjusting your search</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Access Card (Floating at bottom for map mode) */}
            <AnimatePresence>
                {viewMode === 'map' && (
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        className="absolute bottom-24 left-4 right-4 z-[1000]"
                    >
                        <div className="card shadow-2xl flex items-center gap-4 bg-white/95 backdrop-blur-lg border-park-primary/10 py-5">
                            <div className="w-14 h-14 bg-park-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                <MapPin className="text-park-primary" size={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-park-dark uppercase tracking-tight text-sm">Jubilee Hills</h4>
                                <p className="text-[11px] text-gray-500 font-bold truncate">Hyderabad, Telangana</p>
                            </div>
                            <button className="p-4 bg-park-primary text-white rounded-2xl shadow-xl shadow-park-primary/30 active:scale-90 transition-transform">
                                <Navigation size={22} fill="currentColor" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
