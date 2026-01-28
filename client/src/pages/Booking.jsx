import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Calendar, MapPin, Star, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [startTime, setStartTime] = useState('10:30');
    const [endTime, setEndTime] = useState('13:30');
    const [totalPrice, setTotalPrice] = useState(150);

    // Mock spot data
    const spot = {
        id: 1,
        name: 'Ashok Vihar Parking',
        address: 'Plot 24, Ashok Vihar, Phase 1, Hyderabad',
        distance: '40m away',
        price_per_hr: 50,
        rating: 4.8,
        reviews: 124,
        availability: '10:30-13:30 (Available)',
    };

    useEffect(() => {
        // Basic price calculation logic
        const start = parseInt(startTime.split(':')[0]);
        const end = parseInt(endTime.split(':')[0]);
        const duration = end - start;
        if (duration > 0) {
            setTotalPrice(duration * spot.price_per_hr);
        }
    }, [startTime, endTime]);

    const handleBooking = () => {
        navigate('/payment', {
            state: {
                amount: totalPrice,
                bookingData: {
                    id: id,
                    name: spot.name,
                    address: spot.address,
                    startTime: startTime,
                    endTime: endTime
                }
            }
        });
    };


    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="relative h-64">
                <img
                    src="https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=800&h=600&fit=crop"
                    alt="parking spot"
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 p-2 bg-white/50 backdrop-blur-md rounded-full text-park-dark"
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
                            <span className="text-park-primary font-bold text-xl">₹{spot.price_per_hr}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="text-yellow-400 fill-current" size={14} />
                                <span className="text-xs font-bold">{spot.rating}</span>
                                <span className="text-[10px] text-gray-400">({spot.reviews})</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-park-gray rounded-2xl p-4 flex justify-around mb-8 border border-park-primary/5">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Distance</p>
                            <p className="text-sm font-bold text-park-dark">{spot.distance}</p>
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
                                    <p className="text-xs text-gray-400 font-medium italic">Calculated for 3 hours</p>
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
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
