import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';

const AreaPicker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const city = location.state?.city || 'Hyderabad';

  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getAreas(city).then(res => {
      setAreas(res.data);
      setLoading(false);
    });
  }, [city]);

  const handleSelect = async (area) => {
    localStorage.setItem('user_city', city);
    localStorage.setItem('user_area', area.name);
    await apiService.saveLocation({ city, area: area.name });
    navigate('/dashboard');
  };

  const filtered = areas.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const getPill = (zone) => {
    if (zone === 'budget') return <span className="text-[8px] font-black uppercase tracking-[1px] px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">Budget</span>;
    if (zone === 'standard') return <span className="text-[8px] font-black uppercase tracking-[1px] px-2.5 py-1 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">Standard</span>;
    return <span className="text-[8px] font-black uppercase tracking-[1px] px-2.5 py-1 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">Premium</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="pt-10 mb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-park-dark">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-park-dark">Areas in {city}</h1>
          <p className="text-gray-400 font-medium">Select your neighborhood</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search area..." 
          className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 border-none shadow-sm focus:ring-2 focus:ring-park-primary transition-all font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 space-y-3 pb-10">
        {loading ? (
          [1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-3xl animate-pulse" />)
        ) : (
          filtered.map((area, i) => (
            <motion.button
              key={area.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(area)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl group hover:shadow-md transition-all text-left border border-transparent hover:border-park-primary/5"
            >
              <div className="bg-park-gray p-3 rounded-2xl text-park-primary group-hover:bg-park-primary group-hover:text-white transition-colors">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-park-dark">{area.name}</h3>
                  <span className="text-xs font-black text-park-primary">₹{area.min} — ₹{area.max}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-gray-400 font-medium">Avg ₹{area.avg}/hr</p>
                  {getPill(area.zone)}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

export default AreaPicker;
