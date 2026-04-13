import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const LocationPicker = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    apiService.getCities().then(res => {
      setCities(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = cities.filter(c => (c.name || c.city || '').toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (city) => {
    setSelected(city);
    setTimeout(() => {
      navigate('/area-picker', { state: { city: city.name || city.city } });
    }, 600);
  };

  const getEmoji = (name) => {
    const emojis = {
        'Hyderabad': '🏙️', 'Mumbai': '🌆', 'Delhi NCR': '🏛️', 'Bangalore': '🌿',
        'Chennai': '🌊', 'Pune': '🏰', 'Kolkata': '🌸', 'Ahmedabad': '💎'
    };
    return emojis[name] || '📍';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="pt-10 mb-8">
        <h1 className="text-3xl font-black text-park-dark mb-2">Select Your City</h1>
        <p className="text-gray-400 font-medium font-outfit uppercase tracking-widest text-[10px]">Find parking in your neighborhood</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search city..." 
          className="w-full bg-white rounded-3xl py-5 pl-12 pr-4 border-none shadow-sm focus:ring-2 focus:ring-park-primary transition-all font-bold text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-[40px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-10">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? filtered.map((c) => {
              const cityName = c.name || c.city;
              const isSelected = selected?.name === cityName || selected?.city === cityName;
              return (
                <motion.button
                  key={cityName}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(c)}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-[40px] transition-all duration-300 border-2 ${
                    isSelected ? 'bg-park-primary text-white border-park-primary shadow-xl shadow-park-primary/30' : 'bg-white border-transparent hover:border-park-primary/30'
                  }`}
                >
                  <div className="text-3xl mb-3">
                    {getEmoji(cityName)}
                  </div>
                  <h3 className={`font-black uppercase tracking-tight text-sm ${isSelected ? 'text-white' : 'text-park-dark'}`}>{cityName}</h3>
                  <p className={`text-[9px] font-black mt-1 uppercase ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                    {c.range || `₹${c.min} — ₹${c.max}/hr`}
                  </p>
                  
                  {isSelected && (
                    <motion.div 
                      key="selected"
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute top-4 right-4 bg-white text-park-primary p-1 rounded-full"
                    >
                      <Check size={10} strokeWidth={4} />
                    </motion.div>
                  )}
                </motion.button>
              );
            }) : (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="col-span-2 py-20 flex flex-col items-center gap-4 text-center"
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                        <MapPin size={32} />
                    </div>
                    <div>
                        <p className="font-black text-park-dark uppercase tracking-tight">No Cities Found</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Try another search term</p>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
