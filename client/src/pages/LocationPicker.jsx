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

  const filtered = cities.filter(c => c.city.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (city) => {
    setSelected(city);
    setTimeout(() => {
      navigate('/area-picker', { state: { city: city.city } });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="pt-10 mb-8">
        <h1 className="text-3xl font-black text-park-dark mb-2">Select Your City</h1>
        <p className="text-gray-400 font-medium">Find parking in your neighborhood</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search city..." 
          className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 border-none shadow-sm focus:ring-2 focus:ring-park-primary transition-all font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((c) => {
              const isSelected = selected?.city === c.city;
              return (
                <motion.button
                  key={c.city}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(c)}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-[32px] transition-all duration-300 shadow-sm border-2 ${
                    isSelected ? 'bg-park-primary/5 border-park-primary' : 'bg-white border-transparent hover:border-park-primary/30'
                  }`}
                >
                  <div className="text-3xl mb-3">
                    {c.city === 'Hyderabad' && '🏙️'}
                    {c.city === 'Mumbai' && '🌆'}
                    {c.city === 'Delhi NCR' && '🏛️'}
                    {c.city === 'Bangalore' && '🌿'}
                    {c.city === 'Chennai' && '🌊'}
                    {c.city === 'Pune' && '🏰'}
                    {c.city === 'Kolkata' && '🌸'}
                    {c.city === 'Ahmedabad' && '💎'}
                    {!['Hyderabad','Mumbai','Delhi NCR','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'].includes(c.city) && '📍'}
                  </div>
                  <h3 className={`font-bold text-center ${isSelected ? 'text-park-primary' : 'text-park-dark'}`}>{c.city}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">
                    ₹{Math.min(...c.areas.map(a => a.min))} — ₹{Math.max(...c.areas.map(a => a.max))}/hr
                  </p>
                  
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute top-3 right-3 bg-park-primary text-white p-1 rounded-full"
                    >
                      <Check size={12} strokeWidth={4} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
