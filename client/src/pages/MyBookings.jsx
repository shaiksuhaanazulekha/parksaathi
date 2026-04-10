import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Calendar, Clock, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const STATUS_STYLES = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-500',
    Completed: 'bg-blue-100 text-blue-700',
};

const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const MyBookings = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const { data } = await apiService.getUserBookings(profile.id);
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.id]);

    const handleGetDirections = (b) => {
        const lat = b.spotLat || b.parking_spots?.lat || 17.4483;
        const lng = b.spotLng || b.parking_spots?.lng || 78.3915;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-park-dark font-outfit">My Bookings</h1>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">{bookings.length} total</span>
                    <button onClick={fetchBookings} className="bg-park-primary/10 p-2 rounded-xl hover:bg-park-primary/20 transition-colors">
                        <RefreshCw className="text-park-primary" size={18} />
                    </button>
                    <div className="bg-park-primary/10 p-2 rounded-xl">
                        <Calendar className="text-park-primary" size={20} />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-4 pb-28">
                <AnimatePresence>
                    {loading ? (
                        <div className="flex flex-col gap-4 pt-4">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"/>
                                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"/>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"/>
                                </div>
                            ))}
                        </div>
                    ) : bookings.length > 0 ? (
                        bookings.map((b, i) => {
                            const spotName    = b.spotName    || b.parking_spots?.name    || 'Parking Spot';
                            const spotAddress = b.spotAddress || b.parking_spots?.address || '—';
                            const amount      = b.totalPrice  || b.total_price            || 0;
                            const status      = b.status      || 'Pending';
                            const isPaid      = b.paymentStatus === 'Paid' || b.payment_status === 'Paid';

                            return (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {/* Status bar */}
                                    <div className={`h-1.5 w-full ${status === 'Confirmed' ? 'bg-green-400' : status === 'Pending' ? 'bg-yellow-400' : status === 'Cancelled' ? 'bg-red-400' : 'bg-blue-400'}`} />

                                    <div className="p-5">
                                        {/* Top row */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {status}
                                                </span>
                                                <h3 className="text-lg font-bold text-park-dark mt-1.5 truncate">{spotName}</h3>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin size={11}/> {spotAddress}
                                                </p>
                                            </div>
                                            <div className="text-right ml-3 shrink-0">
                                                <p className="font-bold text-park-primary text-xl">₹{amount}</p>
                                                <p className={`text-[10px] font-bold mt-0.5 ${isPaid ? 'text-green-500' : 'text-orange-400'}`}>
                                                    {isPaid ? '✓ Paid' : 'Unpaid'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Time row */}
                                        <div className="flex items-center gap-4 py-3 border-y border-dashed border-gray-100 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                <Clock size={13} className="text-park-primary"/>
                                                {fmt(b.startTime || b.start_time)} → {fmt(b.endTime || b.end_time)}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold ml-auto">
                                                <Calendar size={11}/>
                                                {fmtDate(b.createdAt || b.created_at)}
                                            </div>
                                        </div>

                                        {/* Booking ID */}
                                        <p className="text-[10px] text-gray-300 font-mono mb-4">ID: {b.id}</p>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            {status === 'Confirmed' && !isPaid ? (
                                                <button
                                                    onClick={() => navigate('/payment', { state: { amount, bookingData: { id: b.id, name: spotName } } })}
                                                    className="flex-1 bg-park-primary text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-park-primary/20 hover:bg-park-primary/90 transition-colors"
                                                >
                                                    Pay Now
                                                </button>
                                            ) : status === 'Confirmed' && isPaid ? (
                                                <button
                                                    onClick={() => handleGetDirections(b)}
                                                    className="flex-1 button-primary py-3 text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Navigation size={15}/> Get Directions
                                                </button>
                                            ) : null}

                                            <button
                                                onClick={() => handleGetDirections(b)}
                                                className="px-4 py-3 bg-park-gray rounded-2xl text-park-primary font-bold text-xs border border-park-primary/10 flex items-center gap-1.5 hover:bg-park-primary/5 transition-colors"
                                            >
                                                <Navigation size={14}/> Map
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-park-gray p-8 rounded-full mb-6">
                                <Calendar size={48} className="text-gray-300"/>
                            </div>
                            <h3 className="font-bold text-park-dark text-xl mb-2">No Bookings Yet</h3>
                            <p className="text-gray-400 text-sm mb-6">Find a spot and make your first booking!</p>
                            <button onClick={() => navigate('/dashboard')} className="button-primary px-8 py-3">
                                Find Parking
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom tip */}
            <div className="px-4 pb-24">
                <div className="bg-park-dark rounded-3xl p-5 text-white flex items-center gap-4 shadow-xl relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 bg-park-primary w-20 h-20 rounded-full opacity-20 blur-xl"/>
                    <div className="bg-white/10 p-3 rounded-2xl shrink-0">
                        <CheckCircle2 className="text-white" size={24}/>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Quick Tip</h4>
                        <p className="text-xs text-white/60 mt-0.5">Show your Booking ID at the entrance for smooth entry.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
