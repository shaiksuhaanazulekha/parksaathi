import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Calendar, Clock, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MockDB } from '../services/MockDB';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (profile?.id) {
                const data = await MockDB.getBookings(profile.id);
                setBookings(data);
            }
            setLoading(false);
        };
        fetchBookings();
    }, [profile]);

    const staticBookings = [
        {
            id: 'legacy-1',
            spot: { name: 'Ashok Vihar', address: 'Plot 24, Ashok Vihar, Phase 1, Hyd' },
            time: '10:30-13:30',
            date: 'Dec 28, 2025',
            amount: 150,
            status: 'Active',
            distance: '0.9 mi',
            duration: '3 min'
        }
    ];

    const displayBookings = bookings.length > 0 ? bookings : staticBookings;

    const handleGetDirections = (booking) => {
        const destLat = booking.spot?.lat || (booking.id === 'legacy-1' ? 17.4483 : 17.4435);
        const destLng = booking.spot?.lng || (booking.id === 'legacy-1' ? 78.3915 : 78.3812);

        // Open Google Maps Directions
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
        window.open(url, '_blank');
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-park-dark font-outfit">My Bookings</h1>
                <div className="bg-park-primary/10 p-2 rounded-xl">
                    <Calendar className="text-park-primary" size={20} />
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                {displayBookings.map((booking, index) => (
                    <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="card bg-white overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${booking.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {booking.status}
                                </span>
                                <h3 className="text-xl font-bold text-park-dark mt-2">{booking.spot?.name || booking.name}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin size={12} /> {booking.spot?.address || booking.address}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-park-primary text-lg">₹{booking.amount || booking.price}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{booking.date || 'Today'}</p>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-gray-100 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Clock size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time Slot</p>
                                    <p className="text-xs font-bold text-park-dark">{booking.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Navigation size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Travel Info</p>
                                    <p className="text-xs font-bold text-park-dark">{booking.distance} • {booking.duration}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleGetDirections(booking)}
                                className="flex-1 button-primary text-sm flex items-center justify-center gap-2 py-3"
                            >
                                <Navigation size={16} /> Get Directions
                            </button>

                            <button
                                className="px-4 py-3 bg-park-gray rounded-xl text-park-primary font-bold text-sm border border-park-primary/10"
                            >
                                View
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="px-6 pb-20">
                <div className="bg-park-dark rounded-3xl p-6 text-white flex items-center gap-4 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 bg-park-primary w-24 h-24 rounded-full opacity-20 blur-xl"></div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                        <CheckCircle2 className="text-white" size={32} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Quick Tip</h4>
                        <p className="text-xs text-white/70">Show your booking ID at the entrance for smooth entry.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
