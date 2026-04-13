import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map as MapIcon, List, Filter, MapPin, Star, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import MapView from '../components/MapView';

const Home = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [viewMode, setViewMode] = useState('map'); // 'list' or 'map'
  const [spots, setSpots] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState(null);
  
  const [userCity] = useState(localStorage.getItem('user_city') || 'Hyderabad');
  const [userArea] = useState(localStorage.getItem('user_area') || 'Banjara Hills');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [spotsRes, cityRes] = await Promise.all([
          apiService.getSpots(),
          apiService.getPricing(userCity, userArea)
        ]);
        
        const newSpots = Array.isArray(spotsRes?.data) ? spotsRes.data : [];
        setSpots([...newSpots]); // Force re-render for sync
        setCityData(cityRes?.data || { avg: 45 });
      } catch (e) { console.error('Home Sync Failed:', e); }
      finally { setLoading(false); }
    };

    loadData();
    const pollId = setInterval(loadData, 2000); // 2s Sync
    return () => clearInterval(pollId);
  }, [userCity, userArea]);

  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isSurge = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20) || isWeekend;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-hidden h-screen relative">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl px-5 pt-12 pb-6 border-b border-gray-100 sticky top-0 z-50 rounded-b-[32px] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-black text-park-dark tracking-tighter">PARK<span className="text-park-primary">SAATHI</span></h1>
          
          <div className="flex items-center gap-2 bg-park-primary/5 px-4 py-2 rounded-2xl border border-park-primary/10">
            <div className="w-2 h-2 bg-park-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-park-primary uppercase tracking-widest leading-none">Live Map</span>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-park-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search location or area..." 
            className="w-full bg-park-gray/50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-park-primary transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="fixed inset-0 pt-[180px] pb-20 z-0">
          <MapView 
            spots={spots} 
            onSelect={(s) => navigate(`/booking/${s._id}`)} 
            userLocation={{ lat: 17.4483, lng: 78.3915 }} 
          />
      </div>

      {/* Floating Price Discovery Bar */}
      <AnimatePresence>
         {spots.length > 0 && (
            <motion.div 
               initial={{ y: 100 }} animate={{ y: 0 }}
               className="fixed bottom-24 left-5 right-5 z-[1000] bg-park-dark rounded-[32px] p-6 text-white shadow-2xl border border-white/10"
            >
               <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-park-primary uppercase tracking-widest mb-1">Live Inventory</p>
                    <h3 className="text-base font-black font-outfit">{spots.length} Spots Active Now</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Starting From</p>
                    <p className="text-xl font-black text-park-primary">₹{Math.min(...spots.map(s => s.pricing?.basePrice || 30))}<span className="text-[10px] text-white/40">/hr</span></p>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

export default Home;
