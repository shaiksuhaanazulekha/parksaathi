import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Search, Filter, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';

const AllSpaces = () => {
    const navigate = useNavigate();
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        apiService.getOwnerSpaces().then(res => {
            setSpaces(res.data);
            setLoading(false);
        });
    }, []);

    const filtered = spaces.filter(s => 
        s.name?.toLowerCase().includes(search.toLowerCase()) || 
        s.area?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="bg-white px-5 pt-12 pb-6 border-b border-gray-100 sticky top-0 z-50 rounded-b-[32px] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-100 rounded-xl"><ChevronLeft size={22} /></button>
                    <h1 className="text-xl font-black text-park-dark font-outfit">All My Listings</h1>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search your spots..." 
                        className="w-full bg-park-gray/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="p-5 space-y-4">
                {loading ? (
                    [1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-[32px] animate-pulse" />)
                ) : filtered.map((space) => (
                    <motion.div 
                        key={space._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex gap-4"
                    >
                        <img src={space.photos?.[0]?.url || 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=200&auto=format'} className="w-24 h-24 rounded-2xl object-cover" />
                        <div className="flex-1 py-1">
                            <h3 className="font-black text-park-dark truncate">{space.name}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1 mb-2">
                                <MapPin size={10} className="text-park-primary" /> {space.area}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-lg font-black text-park-primary font-outfit">₹{space.pricing?.basePrice || 30}<span className="text-[10px] text-gray-400">/hr</span></span>
                                <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${space.status === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {space.status}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AllSpaces;
