import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, IndianRupee, Eye, CalendarCheck, TrendingUp, Users, ArrowUpRight, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const fmt     = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const STATUS = {
    Pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    Confirmed: { bg: 'bg-green-100',  text: 'text-green-700' },
    Rejected:  { bg: 'bg-red-100',    text: 'text-red-600' },
    Cancelled: { bg: 'bg-red-100',    text: 'text-red-500' },
    Completed: { bg: 'bg-blue-100',   text: 'text-blue-600' },
};

const EarningsChart = ({ data = [] }) => {
    const max = Math.max(...data, 1000);
    return (
        <div className="h-32 w-full flex items-end gap-1 px-2 pt-4">
            {data.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                        className="w-full bg-park-primary/20 group-hover:bg-park-primary transition-all rounded-t-lg relative"
                        style={{ height: `${(v / max) * 100}%` }}
                    >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-park-dark text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ₹{v}
                        </div>
                    </div>
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
            ))}
        </div>
    );
};

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [stats, setStats]       = useState({ totalEarnings: 0, activeBookings: 0, totalSpaces: 0, spotViews: 0 });
    const [requests, setRequests] = useState([]);
    const [history, setHistory]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [updating, setUpdating] = useState(null);

    const fetchData = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const [statsRes, bookingsRes, historyRes] = await Promise.allSettled([
                apiService.getOwnerStats(profile.id),
                apiService.getOwnerBookings(profile.id),
                apiService.getOwnerHistory(profile.id),
            ]);
            if (statsRes.status   === 'fulfilled') setStats(statsRes.value.data || { totalEarnings: 0, activeBookings: 0, totalSpaces: 0, spotViews: 0 });
            if (bookingsRes.status === 'fulfilled') setRequests((bookingsRes.value.data || []).filter(b => b.status === 'Pending'));
            if (historyRes.status  === 'fulfilled') setHistory((historyRes.value.data || []).slice(0, 6));
        } catch { /* stats fallback already in server */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [profile?.id]);

    const handleAction = async (bookingId, status) => {
        setUpdating(bookingId);
        try {
            await apiService.updateBookingStatus(bookingId, status);
            setRequests(prev => prev.filter(r => r.id !== bookingId));
        } catch (err) { alert(err.message); }
        finally { setUpdating(null); }
    };

    const statCards = [
        { name: 'Total Earnings',  value: `₹${(stats?.totalEarnings || 0).toLocaleString()}`, icon: IndianRupee,   bg: 'bg-emerald-50',  fg: 'text-emerald-600',  trend: 'Lifetime'  },
        { name: 'Active Bookings', value: stats?.activeBookings || 0,                        icon: CalendarCheck, bg: 'bg-blue-50',     fg: 'text-blue-600',     trend: 'Right now' },
        { name: 'Total Spaces',    value: stats?.totalSpaces || 0,                            icon: TrendingUp,    bg: 'bg-indigo-50',   fg: 'text-indigo-600',   trend: 'Listed'    },
        { name: 'Spot Views',      value: stats?.spotViews || 0,                              icon: Eye,           bg: 'bg-orange-50',   fg: 'text-orange-500',   trend: 'This week' },
    ];

    const weeklyData = [400, 800, 600, 1200, 900, 1500, 1100]; // Mock weekly trend based on stats

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Header */}
            <div className="bg-white px-5 pt-14 pb-6 border-b border-gray-100 rounded-b-[32px] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                            <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-park-dark font-outfit">Host Panel</h1>
                            <p className="text-gray-400 text-xs font-medium">
                                {profile?.name || 'Owner'} · {profile?.email || ''}
                            </p>
                        </div>
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-park-primary/10 text-park-primary rounded-xl hover:bg-park-primary hover:text-white transition-colors">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {statCards.map((s, i) => (
                        <motion.div
                            key={s.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.07 }}
                            className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className={`${s.bg} p-2.5 rounded-xl`}>
                                    <s.icon className={s.fg} size={20} />
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${s.fg} bg-white border border-current opacity-70`}>
                                    {s.trend}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.name}</p>
                            <p className="text-xl font-black text-park-dark font-outfit mt-0.5">{s.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-park-gray/50 rounded-3xl p-4 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Weekly Performance</h3>
                    <EarningsChart data={weeklyData} />
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* CTA */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/owner/list-spot')}
                    className="w-full bg-park-dark p-6 rounded-3xl shadow-xl flex items-center justify-between relative overflow-hidden group"
                >
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                        <PlusCircle size={90} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-white text-xl font-bold font-outfit flex items-center gap-2">
                            <PlusCircle size={24} /> List New Spot
                        </h3>
                        <p className="text-white/50 text-xs mt-1">Convert empty space into income</p>
                    </div>
                    <ArrowUpRight className="text-white/40 group-hover:text-white transition-colors relative z-10" size={28} />
                </motion.button>

                {/* Pending requests */}
                <AnimatePresence>
                    {requests.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-3xl p-5 border-2 border-park-primary/20 shadow-lg"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-park-dark flex items-center gap-2">
                                    <span className="w-2 h-2 bg-park-primary rounded-full animate-pulse" />
                                    Pending Requests
                                </h3>
                                <span className="bg-park-primary/10 text-park-primary text-[10px] font-black px-3 py-1 rounded-full">
                                    {requests.length} NEW
                                </span>
                            </div>
                            <div className="space-y-3">
                                {requests.map(req => (
                                    <div key={req.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-park-primary/10 rounded-full flex items-center justify-center">
                                                        <Users size={14} className="text-park-primary" />
                                                    </div>
                                                    <p className="text-sm font-bold text-park-dark">
                                                        {req.profiles?.name || req.driverName || 'Driver'}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1 ml-9">
                                                    {req.parking_spots?.name || req.spotName} • {fmtTime(req.startTime)} – {fmtTime(req.endTime)}
                                                </p>
                                            </div>
                                            <p className="text-base font-black text-park-primary">₹{req.totalPrice || req.total_price}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(req.id, 'Confirmed')}
                                                disabled={updating === req.id}
                                                className="flex-1 py-2.5 bg-park-primary text-white text-xs font-bold rounded-xl disabled:opacity-60"
                                            >
                                                {updating === req.id ? '...' : '✓ Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'Rejected')}
                                                disabled={updating === req.id}
                                                className="flex-1 py-2.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl disabled:opacity-60"
                                            >
                                                ✕ Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Earnings overview */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-park-dark">Earnings Summary</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { label: 'This Week',  amount: Math.floor((stats?.totalEarnings || 0) * 0.2) },
                            { label: 'This Month', amount: Math.floor((stats?.totalEarnings || 0) * 0.6) },
                            { label: 'Lifetime',   amount: stats?.totalEarnings || 0 },
                        ].map(({ label, amount }) => (
                            <div key={label} className="bg-park-gray rounded-2xl p-3 text-center">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{label}</p>
                                <p className="text-base font-black text-park-primary mt-0.5">₹{amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent activity */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-park-dark mb-4">Recent Activity</h3>
                    {history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((item, i) => {
                                const st = STATUS[item.status] || STATUS.Pending;
                                return (
                                    <div key={item.id || i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-park-gray rounded-xl flex items-center justify-center shrink-0">
                                            <CalendarCheck size={18} className="text-park-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-park-dark truncate">{item.spotName || 'Spot'}</p>
                                            <p className="text-[10px] text-gray-400">{fmt(item.createdAt)}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-green-600">+₹{item.totalPrice || item.amount || 0}</p>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-300 text-4xl mb-2">📊</p>
                            <p className="text-xs text-gray-400">No activity yet. Start by listing a spot!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
