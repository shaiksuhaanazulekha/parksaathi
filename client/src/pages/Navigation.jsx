import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Navigation as NavIcon, Calendar, Clock, IndianRupee, Phone, CheckCircle2, Loader2, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';

const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

const NavigationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await apiService.getBookingById(id);
                setBooking(data);
            } catch {
                // Demo fallback
                setBooking({
                    id, status: 'Confirmed', paymentStatus: 'Paid',
                    totalPrice: 120, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 7200000).toISOString(),
                    spotName: 'Jubilee Hills Spot', spotAddress: 'Road No. 36, Jubilee Hills, Hyderabad',
                    spotLat: 17.4302, spotLng: 78.4074,
                    ownerName: 'Parking Host',
                });
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-park-primary" size={36} />
        </div>
    );

    if (!booking) return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Booking not found</h2>
            <button onClick={() => navigate('/bookings')} className="button-primary">My Bookings</button>
        </div>
    );

    const spot = booking.parking_spots || booking;
    const lat  = spot.lat || booking.spotLat;
    const lng  = spot.lng || booking.spotLng;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const bookingId = (booking.id || '').slice(-8).toUpperCase() || 'DEMO1234';

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Map hero */}
            <div className="relative h-[45vh] bg-park-primary overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-park-primary/40 to-park-primary/20" />

                <div className="absolute top-12 left-5 right-5 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-park-dark"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <span className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Booking Confirmed
                    </span>
                </div>

                {/* Floating card */}
                <div className="absolute bottom-[-52px] left-5 right-5 z-10">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0 pr-3">
                                <h1 className="text-xl font-bold text-park-dark font-outfit leading-tight">
                                    {spot.name || booking.spotName}
                                </h1>
                                <p className="text-gray-500 text-xs flex items-center gap-1 mt-1 truncate">
                                    <MapPin size={11} className="text-park-primary shrink-0" />
                                    {spot.address || booking.spotAddress}
                                </p>
                            </div>
                            <div className="bg-park-primary/10 p-3 rounded-2xl shrink-0">
                                <NavIcon size={26} className="text-park-primary" />
                            </div>
                        </div>
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-park-primary text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-park-primary/30 w-full"
                        >
                            <NavIcon size={18} /> Start Navigation
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Details */}
            <div className="mt-20 px-5 space-y-5">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="font-bold text-park-dark mb-3">Booking Details</h3>
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                        {[
                            { icon: Calendar, bg: 'bg-blue-50', color: 'text-blue-600',   label: 'Date',       value: fmtDate(booking.startTime || booking.start_time) },
                            { icon: Clock,    bg: 'bg-purple-50', color: 'text-purple-600', label: 'Duration',   value: `${fmt(booking.startTime || booking.start_time)} – ${fmt(booking.endTime || booking.end_time)}` },
                            { icon: IndianRupee, bg: 'bg-green-50', color: 'text-green-600', label: 'Total Paid', value: `₹${booking.totalPrice || booking.total_price}` },
                        ].map(({ icon: Icon, bg, color, label, value }) => (
                            <div key={label} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 ${bg} rounded-xl`}><Icon size={16} className={color} /></div>
                                    <span className="text-sm text-gray-500 font-medium">{label}</span>
                                </div>
                                <span className="text-sm font-bold text-park-dark">{value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="font-bold text-park-dark mb-3">Host Information</h3>
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-park-primary/10 rounded-full flex items-center justify-center font-bold text-park-primary text-lg">
                                {(booking.ownerName || 'H')[0]}
                            </div>
                            <div>
                                <p className="font-bold text-park-dark">{booking.ownerName || 'Parking Host'}</p>
                                <p className="text-xs text-gray-400">Verified Parking Host ✓</p>
                            </div>
                        </div>
                        <a
                            href="tel:+919876543210"
                            className="p-3 bg-park-primary/10 text-park-primary rounded-xl hover:bg-park-primary hover:text-white transition-colors"
                        >
                            <Phone size={20} />
                        </a>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <ShieldCheckIcon /> Important Note
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Arrive at least 5 minutes before your slot. Show this Booking ID at the entrance for smooth entry.
                        </p>
                        <div className="mt-3 bg-white rounded-xl px-4 py-2 border border-blue-100 text-center">
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Booking ID</p>
                            <p className="text-lg font-black text-blue-800 font-mono tracking-widest">{bookingId}</p>
                        </div>
                    </div>
                </motion.div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-4 text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:text-park-primary transition-colors"
                >
                    <Home size={18} /> Back to Dashboard
                </button>
            </div>
        </div>
    );
};

const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
    </svg>
);

export default NavigationPage;
