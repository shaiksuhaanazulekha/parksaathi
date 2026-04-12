import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Calendar, IndianRupee, MapPin, Eye, Star, TrendingUp, Settings, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, Clock, Zap, Shield, Loader2, LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [stats, setStats] = useState({ totalEarnings: 0, activeBookings: 0, totalSpaces: 0, spotViews: 0 });
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, spacesRes] = await Promise.all([
          apiService.getRecommendation(profile?.location?.city || 'Hyderabad', profile?.location?.area || 'Banjara Hills'), // Mock stats logic
          apiService.getOwnerSpaces()
        ]);
        setStats({ totalEarnings: 4850, activeBookings: 3, totalSpaces: spacesRes.data.length, spotViews: 142 });
        setSpaces(spacesRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [profile]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-8 border-b border-gray-100 rounded-b-[40px] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-park-dark font-outfit uppercase">Host Panel</h1>
            <p className="text-[10px] font-black text-park-primary uppercase tracking-widest leading-none mt-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-park-primary rounded-full animate-pulse" /> Live in {profile?.location?.area || 'Banjara Hills'}
            </p>
          </div>
          <button onClick={() => navigate('/owner/list-spot')} className="p-3 bg-park-primary text-white rounded-2xl shadow-lg shadow-park-primary/20 hover:scale-105 transition-transform">
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-park-dark p-5 rounded-[32px] text-white">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Earnings</p>
              <div className="flex items-end gap-1">
                 <h2 className="text-2xl font-black font-outfit">₹{stats.totalEarnings}</h2>
                 <span className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center"><ArrowUpRight size={10} /> 12%</span>
              </div>
           </div>
           <div className="bg-white border-2 border-gray-50 p-5 rounded-[32px]">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Bookings</p>
              <div className="flex items-end gap-1">
                 <h2 className="text-2xl font-black font-outfit text-park-dark">{stats.activeBookings}</h2>
                 <span className="text-[10px] text-emerald-500 font-bold mb-1 uppercase">Today</span>
              </div>
           </div>
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* Spaces List */}
        <section>
          <div className="flex justify-between items-end mb-6 px-2">
             <div>
                <h3 className="text-lg font-black text-park-dark font-outfit">My Spaces</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manage your listings</p>
             </div>
             <Link to="/dashboard" className="text-[10px] font-black text-park-primary uppercase border-b-2 border-park-primary pb-0.5">View All</Link>
          </div>

          <div className="space-y-6">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-44 bg-gray-100 rounded-[32px] animate-pulse" />)
            ) : spaces.length === 0 ? (
              <div className="bg-white rounded-[40px] p-10 text-center border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <MapPin size={32} />
                  </div>
                  <h4 className="font-black text-park-dark font-outfit mb-1">No Spaces Yet</h4>
                  <p className="text-xs text-gray-400 font-bold mb-6">List your parking spot and start earning</p>
                  <button onClick={() => navigate('/owner/list-spot')} className="px-8 py-4 bg-park-primary text-white rounded-2xl font-black uppercase text-xs">Add First Space</button>
              </div>
            ) : spaces.map(space => (
              <motion.div key={space._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 group">
                  <div className="flex p-4 gap-4">
                      <div className="relative w-28 h-28 flex-shrink-0">
                          <img src={space.photos?.[0]?.url || 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=200&auto=format'} className="w-full h-full object-cover rounded-2xl shadow-sm" />
                          <div className={`absolute -top-2 -left-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase shadow-lg border-2 border-white ${
                            space.status === 'live' ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                          }`}>{space.status}</div>
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                          <h4 className="text-base font-black text-park-dark truncate mb-0.5">{space.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1 mb-3">
                             <MapPin size={10} className="text-park-primary" /> {space.area}
                          </p>
                          <div className="flex items-center gap-3">
                             <div className="flex flex-col">
                                <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest leading-none mb-1">Price</span>
                                <span className="text-sm font-black text-park-primary">₹{space.pricing?.basePrice}/hr</span>
                             </div>
                             <div className="w-px h-6 bg-gray-100" />
                             <div className="flex flex-col">
                                <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest leading-none mb-1">Bookings</span>
                                <span className="text-sm font-black text-park-dark">{space.totalBookings || 0} Total</span>
                             </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-gray-50/50 p-4 flex gap-2">
                     <button onClick={() => navigate(`/owner/manage-slots/${space._id}`)} className="flex-1 bg-white border border-gray-100 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-park-dark flex items-center justify-center gap-2 hover:bg-park-dark hover:text-white transition-all shadow-sm">
                        <Clock size={14} /> Manage Slots
                     </button>
                     <button className="p-3 bg-white border border-gray-100 rounded-2xl text-park-primary hover:bg-park-primary hover:text-white transition-all shadow-sm">
                        <Settings size={18} />
                     </button>
                  </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Intelligence Card */}
        <section className="bg-gradient-to-br from-park-primary to-park-secondary rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-park-primary/30">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
             <h3 className="text-lg font-black font-outfit mb-2 flex items-center gap-2">
                <TrendingUp size={20} /> Smart Recommendation
             </h3>
             <p className="text-xs text-white/70 font-bold mb-6">Parking demand in <span className="text-white">{profile?.location?.area || 'Banjara Hills'}</span> is up 24% this week. Increase your slots for better visibility.</p>
             <button className="bg-white text-park-primary px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Optimise Listing</button>
        </section>
      </div>
    </div>
  );
};

export default OwnerDashboard;
