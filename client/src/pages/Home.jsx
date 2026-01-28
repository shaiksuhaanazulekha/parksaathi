import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, List, MapPin, Navigation } from 'lucide-react';
import MapView from '../components/MapView';
import { motion, AnimatePresence } from 'framer-motion';
import { MockDB } from '../services/MockDB';


const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpots = async () => {
            setLoading(true);
            const data = await MockDB.getSpots({
                query: searchQuery,
                lat: 17.3850,
                lng: 78.4867
            });
            setSpots(data);
            setLoading(false);
        };
        fetchSpots();
    }, [searchQuery]);

    const handleSpotSelect = (spot) => {
        navigate(`/book/${spot.id}`);
    };


    return (
        <div className="h-screen flex flex-col relative bg-gray-50 overflow-hidden">
            {/* Search Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="max-w-md mx-auto space-y-3">
                    <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
                        <div className="p-2 text-park-primary">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search parking in Hyderabad..."
                            className="flex-1 bg-transparent outline-none text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="p-2 text-gray-400 hover:text-park-primary">
                            <SlidersHorizontal size={22} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${viewMode === 'map' ? 'bg-park-primary text-white' : 'bg-white text-park-dark'
                                }`}
                            onClick={() => setViewMode('map')}
                        >
                            <Navigation size={18} /> Map View
                        </button>
                        <button
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-park-primary text-white' : 'bg-white text-park-dark'
                                }`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} /> List View
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Content */}
            <div className="flex-1 w-full">
                {viewMode === 'map' ? (
                    <MapView onSpotSelect={handleSpotSelect} />
                ) : (
                    <div className="pt-36 px-4 pb-24 overflow-y-auto h-full">
                        <div className="space-y-4">
                            {spots.map((spot) => (
                                <motion.div
                                    key={spot.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleSpotSelect(spot)}
                                    className="card flex gap-4 cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={spot.image_url} alt="parking" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className="font-bold text-park-dark">{spot.name}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1 text-park-primary">
                                                    <MapPin size={12} /> {spot.distance ? `${spot.distance.toFixed(1)} km` : 'Near you'}
                                                </span>
                                                <span>•</span>
                                                <span>{spot.duration || '5 min'}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-park-primary font-bold text-lg">₹{spot.hourly_rate || spot.price}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                                            <button className="bg-park-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold">Details</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                    </div>
                )}
            </div>

            {/* Quick Access Card (Floating at bottom for map mode) */}
            <AnimatePresence>
                {viewMode === 'map' && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="absolute bottom-6 left-4 right-4 z-10"
                    >
                        <div className="card shadow-2xl flex items-center gap-4 bg-white/95 backdrop-blur-sm border-park-primary/10">
                            <div className="w-16 h-16 bg-park-primary/10 rounded-xl flex items-center justify-center">
                                <MapPin className="text-park-primary" size={28} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-park-dark">Current Location</h4>
                                <p className="text-xs text-gray-500">Jubilee Hills, Hyderabad</p>
                            </div>
                            <button className="p-3 bg-park-primary text-white rounded-xl shadow-lg shadow-park-primary/20">
                                <Navigation size={22} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
