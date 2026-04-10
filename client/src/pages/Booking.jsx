import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Calendar, MapPin, Star, ShieldCheck, Loader2 } from 'lucide-react';

import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [spot, setSpot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState('10:30');
    const [endTime, setEndTime] = useState('12:30');
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchSpot = async () => {
            setLoading(true);
            try {
                const { data } = await apiService.getSpotById(id);
                setSpot(data);
            } catch (error) {
                console.error("Failed to fetch spot", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSpot();
    }, [id]);

    useEffect(() => {
        if (!spot) return;

        // Basic price calculation logic
        const start = parseInt(startTime.split(':')[0]);
        const end = parseInt(endTime.split(':')[0]);
        let duration = end - start;

        // Handle next day or same hour edge cases
        if (duration <= 0) duration = 1;

        const rate = spot.hourly_rate || 50;
        setTotalPrice(duration * rate);
    }, [startTime, endTime, spot]);

    const handleBooking = async () => {
        if (!profile?.id) return navigate('/login');

        try {
            // Generate real ISO timestamps for the selected times on the current day
            const today = new Date();
            const [startHour, startMin] = startTime.split(':');
            const [endHour, endMin] = endTime.split(':');

            const startDateTime = new Date(today.setHours(startHour, startMin, 0, 0));
            const endDateTime = new Date(today.setHours(endHour, endMin, 0, 0));

            await apiService.createBooking({
                spot_id: id,
                driver_id: profile.id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                total_price: totalPrice
            });

            alert("Booking request sent! Once the owner approves, you can proceed to payment.");
            navigate('/bookings');
        } catch (error) {
            console.error("Booking failed", error);
            alert("Booking failed: " + error.message);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="animate-spin text-park-primary mb-4" size={40} />
            <p className="text-gray-500 font-medium">Fetching details...</p>
        </div>
    );

    if (!spot) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
            <h2 className="text-2xl font-bold text-park-dark mb-2">Spot Not Found</h2>
            <p className="text-gray-500 mb-6">The parking spot you're looking for might have been removed.</p>
            <button onClick={() => navigate('/dashboard')} className="button-primary w-full max-w-xs">Return Home</button>
        </div>
    );


    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="relative h-72 group overflow-hidden">
                {spot.photo_urls && spot.photo_urls.length > 0 ? (
                    <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                        {spot.photo_urls.map((url, i) => (
                            <div key={i} className="flex-shrink-0 w-full h-full snap-center">
                                <img src={url} alt={`Spot ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <img
                        src="https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=800&h=600&fit=crop"
                        alt="parking spot"
                        className="w-full h-full object-cover"
                    />
                )}
                
                {/* Carousel Indicator */}
                {spot.photo_urls && spot.photo_urls.length > 1 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {spot.photo_urls.map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 p-2 bg-white/50 backdrop-blur-sm rounded-full text-park-dark shadow-sm hover:bg-white transition-colors z-20"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            <div className="px-6 -mt-8 relative z-10">
                <div className="bg-white rounded-t-3xl p-6 shadow-sm border-t border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-park-dark font-outfit">{spot.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin size={14} className="text-park-primary" />
                                <span>{spot.address}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-park-primary font-bold text-xl">₹{spot.hourly_rate}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="text-yellow-400 fill-current" size={14} />
                                <span className="text-xs font-bold">{spot.rating || '4.5'}</span>
                                <span className="text-[10px] text-gray-400">({spot.reviews || '28'})</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-park-gray rounded-2xl p-4 flex justify-around mb-8 border border-park-primary/5">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Distance</p>
                            <p className="text-sm font-bold text-park-dark">{spot.distance ? `${spot.distance.toFixed(1)} km` : 'Near you'}</p>
                        </div>
                        <div className="w-px bg-gray-200"></div>
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Availability</p>
                            <p className="text-sm font-bold text-green-600">Open Now</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-bold text-park-dark flex items-center gap-2">
                            <Clock size={18} className="text-park-primary" /> Set Duration
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Arrival</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Departure</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 pt-6 mt-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                                    <p className="text-xs text-gray-400 font-medium italic">Calculated for your duration</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-park-dark">₹{totalPrice}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-green-600 font-semibold bg-green-50 p-3 rounded-xl border border-green-100 mb-6">
                                <ShieldCheck size={16} />
                                Booking includes Free Cancellation & Protection
                            </div>

                            <button
                                onClick={handleBooking}
                                className="w-full button-primary py-4 text-lg"
                            >
                                Request Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
