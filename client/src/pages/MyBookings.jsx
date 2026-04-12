import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation, Calendar, Clock, MapPin, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const STATUS_STYLES = {
    Pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-400' },
    Confirmed: { bg: 'bg-green-100',  text: 'text-green-700',  bar: 'bg-green-400'  },
    Rejected:  { bg: 'bg-red-100',    text: 'text-red-600',    bar: 'bg-red-400'    },
    Cancelled: { bg: 'bg-red-100',    text: 'text-red-500',    bar: 'bg-red-400'    },
    Completed: { bg: 'bg-blue-100',   text: 'text-blue-600',   bar: 'bg-blue-400'   },
};

const DEMO_BOOKINGS = [
    {
        id: 'demo-booking-001',
        status: 'Confirmed', paymentStatus: 'Paid',
        totalPrice: 120,
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime:   new Date(Date.now() + 7200000).toISOString(),
        spotName: 'Jubilee Hills Spot', spotAddress: 'Road No. 36, Jubilee Hills',
        spotLat: 17.4302, spotLng: 78.4074,
        createdAt: new Date().toISOString(),
    }
];

const fmt     = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const MyBookings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading]   = useState(true);

    const fetch = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const { data } = await apiService.getUserBookings(profile.id);
            setBookings(data?.length ? data : DEMO_BOOKINGS);
        } catch {
            setBookings(DEMO_BOOKINGS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, [profile?.id]);

    const openDirections = (b) => {
        const lat = b.spotLat || b.parking_spots?.lat || 17.4483;
        const lng = b.spotLng || b.parking_spots?.lng || 78.3915;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Header */}
            <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-park-dark font-outfit">My Bookings</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{bookings.length} total reservations</p>
                </div>
                <button onClick={fetch} className="p-2.5 bg-park-primary/10 text-park-primary rounded-xl hover:bg-park-primary hover:text-white transition-colors">
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <AnimatePresence>
                {location.state?.message && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="m-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} /> {location.state.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="space-y-4 pt-2">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-5 animate-pulse">
                                <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
                                <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : bookings.length > 0 ? (
                    <AnimatePresence>
                        {bookings.map((b, i) => {
                            const st      = STATUS_STYLES[b.status] || STATUS_STYLES.Pending;
                            const isPaid  = b.paymentStatus === 'Paid';
                            const amount  = b.totalPrice || b.total_price || 0;
                            const spotName = b.spotName || b.parking_spots?.name || 'Parking Spot';
                            const spotAddr = b.spotAddress || b.parking_spots?.address || '';

                            return (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                                >
                                    <div className={`h-1.5 ${st.bar}`} />
                                    <div className="p-5">
                                        {/* Top */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                                                    {b.status}
                                                </span>
                                                <h3 className="text-base font-bold text-park-dark mt-1.5 truncate">{spotName}</h3>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                                    <MapPin size={10} className="text-park-primary shrink-0" /> {spotAddr}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-black text-park-primary text-xl">₹{amount}</p>
                                                <p className={`text-[9px] font-bold mt-0.5 ${isPaid ? 'text-green-500' : 'text-orange-400'}`}>
                                                    {isPaid ? '✓ Paid' : 'Unpaid'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Time row */}
                                        <div className="flex items-center gap-4 py-3 border-y border-dashed border-gray-100 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                                                <Clock size={13} className="text-park-primary" />
                                                {fmt(b.startTime || b.start_time)} → {fmt(b.endTime || b.end_time)}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 ml-auto">
                                                <Calendar size={11} />
                                                {fmtDate(b.createdAt || b.created_at)}
                                            </div>
                                        </div>

                                        {/* ID */}
                                        <p className="text-[10px] text-gray-300 font-mono mb-4 truncate">ID: {b.id}</p>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {b.status === 'Confirmed' && !isPaid && (
                                                <button
                                                    onClick={() => navigate('/payment', { state: { booking: b } })}
                                                    className="flex-1 bg-park-primary text-white py-3 rounded-2xl font-bold text-sm"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {b.status === 'Confirmed' && isPaid && (
                                                <button
                                                    onClick={() => navigate(`/navigation/${b.id}`)}
                                                    className="flex-1 button-primary py-3 text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Navigation size={16} /> Navigate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openDirections(b)}
                                                className="px-4 py-3 bg-park-gray rounded-2xl text-park-primary font-bold text-xs flex items-center gap-1.5 border border-park-primary/10"
                                            >
                                                <Navigation size={13} /> Map
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="bg-gray-100 p-8 rounded-full mb-6">
                            <Calendar size={44} className="text-gray-300" />
                        </div>
                        <h3 className="font-bold text-park-dark text-xl mb-2">No Bookings Yet</h3>
                        <p className="text-gray-400 text-sm mb-6">Find a spot and make your first booking!</p>
                        <button onClick={() => navigate('/dashboard')} className="button-primary px-10">
                            Find Parking
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Tip */}
            {bookings.length > 0 && (
                <div className="px-5 pb-4">
                    <div className="bg-park-dark rounded-3xl p-5 text-white flex items-center gap-4 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 bg-park-primary w-20 h-20 rounded-full opacity-20 blur-xl" />
                        <CheckCircle2 size={28} className="text-white shrink-0" />
                        <p className="text-xs text-white/70 leading-relaxed">
                            <span className="font-bold text-white">Quick Tip:</span> Show your Booking ID at the entrance for smooth entry.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
