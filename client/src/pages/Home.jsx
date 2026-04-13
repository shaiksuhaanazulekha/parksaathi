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
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [spots, setSpots] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState(null);
  
  const userCity = localStorage.getItem('user_city') || profile?.location?.city;
  const userArea = localStorage.getItem('user_area') || profile?.location?.area;

  useEffect(() => {
    if (!userCity || !userArea) {
      navigate('/location-picker');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [spotsRes, cityRes] = await Promise.all([
          apiService.getSpots({ city: userCity, area: userArea }),
          apiService.getPricing(userCity, userArea)
        ]);
        
        setSpots(Array.isArray(spotsRes?.data) ? spotsRes.data : []);
        setCityData(cityRes?.data || { avg: 40 });
      } catch (e) { 
        console.error('Home data load failed:', e);
        setSpots([]);
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, [userCity, userArea, navigate]);

  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isSurge = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20) || isWeekend;

  const getBadge = (price) => {
    if (!cityData) return null;
    if (price < cityData.avg) return <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">💰 Below Average</span>;
    if (price === cityData.avg) return <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">✓ Fair Price</span>;
    return <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">⚡ Premium</span>;
  };

  const calculateDisplayPrice = (base) => {
    let p = base;
    if ((hour >= 8 && hour < 10) || (hour >= 17 && hour < 20)) p *= 1.3;
    else if (isWeekend) p *= 1.2;
    return Math.round(p);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 border-b border-gray-100 sticky top-0 z-50 rounded-b-[32px] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/location-picker')} className="flex items-center gap-2 group">
            <div className="bg-park-primary/10 p-2 rounded-xl text-park-primary group-hover:bg-park-primary group-hover:text-white transition-colors">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 leading-none uppercase tracking-widest mb-1.5 flex items-center gap-1">
                Your Location <ChevronRight size={10} />
              </p>
              <h2 className="text-base font-black text-park-dark font-outfit truncate max-w-[150px]">
                {userArea}, {userCity}
              </h2>
            </div>
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="p-3 bg-park-gray rounded-2xl text-park-primary hover:bg-park-primary hover:text-white transition-all shadow-sm"
            >
              {viewMode === 'list' ? <MapIcon size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-park-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search nearby parking..." 
            className="w-full bg-park-gray/50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-park-primary transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-5 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[32px] animate-pulse" />)}
        </div>
      ) : (
        <div className="p-5">
          {viewMode === 'list' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2 px-2">
                <div>
                  <h3 className="text-lg font-black text-park-dark font-outfit">Available Spots</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Area avg: ₹{cityData?.avg}/hr</p>
                </div>
                {isSurge && (
                  <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-tight">Peak Surge Active</span>
                  </div>
                )}
              </div>

              {spots.map((spot) => (
                <motion.div 
                  key={spot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(`/booking/${spot.id}`)}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-50 flex flex-col group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={spot.photos?.[0] || spot.image || 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=400&auto=format'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg border border-white/20">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-park-dark">{spot.rating || 'New'}</span>
                      </div>
                    </div>
                    {isSurge && (
                       <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg border border-orange-400/30">
                          <Zap size={14} fill="white" />
                          <span className="text-[10px] font-black uppercase tracking-tight">Peak +30%</span>
                       </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg font-black text-park-dark font-outfit truncate">{spot.name}</h3>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-park-primary" /> {spot.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-park-primary font-outfit">₹{calculateDisplayPrice(spot.pricing?.basePrice || spot.pricePerHour)}<span className="text-xs text-gray-400 font-bold">/hr</span></p>
                        {getBadge(spot.pricing?.basePrice || spot.pricePerHour)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-park-gray rounded-lg flex items-center justify-center text-park-primary">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Timing</p>
                          <p className="text-[11px] font-black text-park-dark uppercase">9AM — 9PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-park-gray rounded-lg flex items-center justify-center text-park-primary">
                          <Zap size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">CCTV</p>
                          <p className="text-[11px] font-black text-park-dark uppercase">Available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="fixed inset-0 pt-[180px] pb-20 z-0">
               <MapView spots={spots} onSelect={(s) => navigate(`/booking/${s.id}`)} userLocation={{ lat: 17.4483, lng: 78.3915 }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

export default Home;
