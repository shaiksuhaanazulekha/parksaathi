import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, MapPin, Star, ShieldCheck, Loader2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=800&auto=format';

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const defaultStart = `${pad(now.getHours() + 1)}:00`;
const defaultEnd   = `${pad(now.getHours() + 3)}:00`;

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [spot, setSpot]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [startTime, setStartTime]   = useState(defaultStart);
    const [endTime, setEndTime]       = useState(defaultEnd);
    const [error, setError]           = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await apiService.getSpotById(id);
                setSpot(data);
            } catch {
                setError('Failed to load parking spot.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const calcDuration = () => {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        let mins = (eh * 60 + em) - (sh * 60 + sm);
        if (mins <= 0) mins += 24 * 60;
        return Math.max(1, parseFloat((mins / 60).toFixed(2)));
    };

    const duration   = calcDuration();
    const rate       = spot?.pricePerHour || spot?.hourly_rate || 0;
    const totalPrice = Math.round(duration * rate);

    const handleBooking = async () => {
        if (!profile?.id) return navigate('/login');
        setSubmitting(true);
        setError('');
        try {
            const today = new Date();
            const makeDate = (t) => {
                const [h, m] = t.split(':').map(Number);
                const d = new Date(today);
                d.setHours(h, m, 0, 0);
                return d;
            };
            let startDT = makeDate(startTime);
            let endDT   = makeDate(endTime);
            if (endDT <= startDT) endDT.setDate(endDT.getDate() + 1);

            const { data: booking } = await apiService.createBooking({
                spot_id:     id,
                driver_id:   profile.id,
                start_time:  startDT.toISOString(),
                end_time:    endDT.toISOString(),
                total_price: totalPrice,
            });

            navigate('/bookings', { state: { message: 'Booking request sent! Waiting for owner approval.' } });
        } catch (err) {
            setError(err.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-park-primary" size={36} />
        </div>
    );

    if (!spot) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-4">
                <MapPin size={40} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-park-dark mb-2">Spot Not Found</h2>
            <p className="text-gray-400 text-sm mb-6">{error || 'This parking spot may no longer be available.'}</p>
            <button onClick={() => navigate('/dashboard')} className="button-primary px-8">Browse Spots</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero image */}
            <div className="relative h-72 overflow-hidden bg-gray-200">
                <img
                    src={spot.photos?.[0] || FALLBACK_IMG}
                    alt={spot.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = FALLBACK_IMG; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-5 p-2.5 bg-white/80 backdrop-blur rounded-xl text-park-dark shadow-lg"
                >
                    <ChevronLeft size={22} />
                </button>
                {spot.photos?.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {spot.photos.map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail card */}
            <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mx-4 -mt-6 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 relative z-10"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                        <h1 className="text-2xl font-bold text-park-dark font-outfit leading-tight">{spot.name}</h1>
                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                            <MapPin size={14} className="text-park-primary shrink-0" />
                            <span className="truncate">{spot.address}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-park-primary font-black text-2xl">₹{rate}<span className="text-xs text-gray-400 font-normal">/hr</span></p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold">{spot.rating || '4.5'}</span>
                        </div>
                    </div>
                </div>

                {spot.description && (
                    <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl">{spot.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 bg-park-gray rounded-2xl p-4 mb-6">
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Slots</p>
                        <p className="text-sm font-bold text-park-dark mt-0.5">{spot.totalSlots || 1}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Availability</p>
                        <p className="text-sm font-bold text-green-600 mt-0.5">Open Now</p>
                    </div>
                </div>

                {/* Time pickers */}
                <h3 className="font-bold text-park-dark flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-park-primary" /> Select Duration
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Arrival</label>
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Departure</label>
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input-field" />
                    </div>
                </div>

                {/* Summary */}
                <div className="border-t border-dashed border-gray-200 pt-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Duration</p>
                            <p className="text-xs text-gray-400">{duration.toFixed(1)} hours × ₹{rate}/hr</p>
                        </div>
                        <p className="text-3xl font-black text-park-dark">₹{totalPrice}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-3 rounded-xl border border-green-100">
                        <ShieldCheck size={15} className="shrink-0" />
                        Free cancellation up to 1 hour before arrival
                    </div>

                    {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl font-medium">{error}</p>}

                    <button onClick={handleBooking} disabled={submitting} className="button-primary w-full py-4 text-base flex items-center justify-center gap-2">
                        {submitting ? (
                            <><Loader2 className="animate-spin" size={20} /> Processing...</>
                        ) : (
                            <><DollarSign size={20} /> Pay ₹{totalPrice} & Reserve</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Booking;
