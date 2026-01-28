import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, IndianRupee, Eye, CalendarCheck, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MockDB } from '../services/MockDB';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [dbStats, setDbStats] = useState({ totalEarnings: 0, activeBookings: 0, spotViews: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            if (profile?.id) {
                const stats = await MockDB.getOwnerStats(profile.id);
                setDbStats(stats);
            }
        };
        fetchStats();
    }, [profile]);

    const stats = [
        { name: 'Total Earnings', value: `₹${dbStats.totalEarnings}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50', trend: '+12%' },
        { name: 'Active Bookings', value: dbStats.activeBookings.toString(), icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Today' },
        { name: 'Total Views', value: dbStats.spotViews.toString(), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5%' },
    ];

    const earningsHistory = [
        { period: 'This Week', amount: Math.floor(dbStats.totalEarnings * 0.2), bookings: Math.floor(dbStats.activeBookings * 0.5) },
        { period: 'This Month', amount: Math.floor(dbStats.totalEarnings * 0.7), bookings: Math.floor(dbStats.activeBookings * 2) },
        { period: 'Lifetime', amount: dbStats.totalEarnings, bookings: dbStats.activeBookings + 5 },
    ];


    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white px-6 pt-16 pb-8 border-b border-gray-100 rounded-b-[40px] shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-park-dark font-outfit">Host Panel</h1>
                        <p className="text-gray-400 text-sm font-medium">Manage your parking business</p>
                    </div>
                    <div className="bg-park-primary/10 p-3 rounded-2xl">
                        <TrendingUp size={24} className="text-park-primary" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`${stat.bg} p-4 rounded-2xl`}>
                                    <stat.icon className={stat.color} size={28} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.name}</p>
                                    <p className="text-2xl font-bold text-park-dark font-outfit">{stat.value}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stat.color} bg-white border border-current opacity-80`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                        onClick={() => navigate('/owner/list-spot')}
                        className="w-full bg-park-dark p-8 rounded-[32px] shadow-2xl flex items-center justify-between relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                            <PlusCircle size={100} className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white text-2xl font-bold font-outfit mb-2 flex items-center gap-2">
                                <PlusCircle size={28} /> List New Spot
                            </h3>
                            <p className="text-white/60 text-sm">Convert your empty space into income</p>
                        </div>
                        <ArrowUpRight className="text-white/40 group-hover:text-white transition-colors" size={32} />
                    </button>
                </motion.div>

                <div>
                    <h2 className="text-xl font-bold text-park-dark font-outfit mb-4 ml-2">Earnings Overview</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {earningsHistory.map((item) => (
                            <div key={item.period} className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">{item.period}</p>
                                <p className="text-lg font-bold text-park-primary font-outfit">₹{item.amount}</p>
                                <p className="text-[10px] text-gray-300 font-bold">{item.bookings} bookings</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-park-dark">Recent Activity</h3>
                        <button className="text-xs font-bold text-park-primary">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-park-gray rounded-xl flex items-center justify-center text-park-primary transition-colors group-hover:bg-park-primary group-hover:text-white">
                                    <Users size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-park-dark">Booking Confirmed</p>
                                    <p className="text-xs text-gray-400 font-medium">Ashok Villa • 2 hours ago</p>
                                </div>
                                <p className="text-sm font-bold text-green-600">+₹150</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
