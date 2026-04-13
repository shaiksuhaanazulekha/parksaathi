import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, IndianRupee, Zap, ShieldCheck, CheckCircle2, Navigation, Share2, Tag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [spot, setSpot] = useState(null);
    const [slots, setSlots] = useState({ available: [], booked: [], surge: [] });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    
    // Selection state
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(null);
    const [duration, setDuration] = useState(1);
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(null); // { code, discount }

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [spotRes, slotsRes] = await Promise.all([
                    apiService.getSpot(id),
                    apiService.getSlots(id, selectedDate)
                ]);
                setSpot(spotRes.data);
                setSlots(slotsRes.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id, selectedDate]);

    // Generate next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            date: d.getDate(),
            month: d.toLocaleDateString('en-IN', { month: 'short' })
        };
    });

    const handleBooking = async () => {
        if (!startTime) return;
        setSubmitting(true);
        try {
            const res = await apiService.createBooking({
                spaceId: id,
                date: selectedDate,
                startTime,
                duration,
                coupon: couponApplied?.code,
                paymentMethod: 'upi'
            });
            setConfirmed(res.data);
        } catch (err) { alert(err.message); }
        finally { setSubmitting(false); }
    };

    const calculatePricing = () => {
        if (!spot) return { total: 0 };
        const base = spot.pricing?.basePrice || 30;
        const isSurgeSlot = slots.surge.includes(startTime);
        
        let surgeMult = 1.0;
        if (isSurgeSlot) surgeMult = 1.3;
        else {
            const d = new Date(selectedDate);
            if (d.getDay() === 0 || d.getDay() === 6) surgeMult = 1.2;
        }

        const subtotal = base * duration * surgeMult;
        const coveredPremium = spot.amenities?.covered ? (10 * duration) : 0;
        const platformFee = (subtotal + coveredPremium) * 0.1;
        const couponDisc = couponApplied?.discount || 0;
        const total = Math.max(0, subtotal + coveredPremium + platformFee - couponDisc);

        return {
            base, duration, surgeMult, subtotal, coveredPremium, platformFee, total,
            saved: (spot.cityPricing?.avg * duration) - total
        };
    };

    const applyCoupon = () => {
        const c = coupon.toUpperCase();
        if (c === 'PARK20') {
            setCouponApplied({ code: 'PARK20', discount: 20 });
            setCoupon('');
        } else {
            alert('Invalid coupon');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white p-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-park-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Finding Best Price...</p>
        </div>
    );

    if (confirmed) return (
        <div className="min-h-screen bg-park-dark text-white p-8 flex flex-col items-center justify-center text-center">
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/40">
                <CheckCircle2 size={48} />
             </motion.div>
             <h1 className="text-3xl font-black font-outfit mb-2">Booking Confirmed! 🎉</h1>
             <p className="text-white/50 text-sm mb-10">Monospace ID: <span className="font-mono text-white tracking-widest">{confirmed.bookingId}</span></p>
             
             <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-left mb-10">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> {spot.name}</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-white/40 font-bold uppercase">Date & Time</span>
                        <span className="font-black">{new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {startTime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/40 font-bold uppercase">Duration</span>
                        <span className="font-black">{duration} Hour{duration > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/40 font-bold uppercase">Amount Paid</span>
                        <span className="font-black text-emerald-400">₹{confirmed.totalAmount}</span>
                    </div>
                </div>
             </div>

             <div className="w-full space-y-3">
                <button className="w-full py-4 bg-park-primary rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 shadow-xl">
                    <Calendar size={18} /> Add to Calendar
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates?.lat},${spot.coordinates?.lng}`, '_blank')} className="py-4 bg-white/10 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2">
                        <Navigation size={16} /> Navigate
                    </button>
                    <button className="py-4 bg-white/10 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2">
                        <Share2 size={16} /> Share
                    </button>
                </div>
                <button onClick={() => navigate('/dashboard')} className="w-full py-4 text-white/40 font-bold text-sm">Back to Home</button>
             </div>
        </div>
    );

    const price = calculatePricing();

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <div className="bg-white px-5 pt-12 pb-6 border-b border-gray-100 rounded-b-[40px] shadow-sm mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-100 rounded-xl"><ChevronLeft size={22} /></button>
                    <h1 className="text-xl font-black text-park-dark font-outfit">Reservation</h1>
                </div>

                <div className="flex items-start gap-4 mb-6">
                    <img src={spot.photos?.[0]?.url || 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=200&auto=format'} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                    <div className="flex-1">
                        <h2 className="font-black text-park-dark truncate">{spot.name}</h2>
                        <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1 mt-1 uppercase tracking-tight">
                            <MapPin size={10} className="text-park-primary" /> {spot.area}, {spot.city}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-600 rounded-lg">₹{spot.pricing?.basePrice}/hr</span>
                            <span className="text-[10px] font-black text-gray-300">Avg ₹{spot.cityPricing?.avg}/hr</span>
                        </div>
                    </div>
                </div>

                {/* Date Strip */}
                <div className="overflow-x-auto no-scrollbar -mx-5 px-5 flex gap-3 mb-2">
                    {dates.map((d) => (
                        <button 
                            key={d.full}
                            onClick={() => setSelectedDate(d.full)}
                            className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                                selectedDate === d.full ? 'bg-park-primary text-white shadow-lg shadow-park-primary/30' : 'bg-gray-50 text-gray-400'
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase mb-1">{d.day}</span>
                            <span className="text-lg font-black">{d.date}</span>
                            <span className="text-[10px] font-bold">{d.month}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-5 space-y-8">
                {/* Time Slots */}
                <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                        <Clock size={14} /> Select Start Time
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 15 }, (_, i) => {
                            const h = i + 8;
                            const time = `${h.toString().padStart(2, '0')}:00`;
                            const isBooked = slots.booked.includes(time);
                            const isSurge = slots.surge.includes(time);
                            const isSelected = startTime === time;

                            return (
                                <button
                                    key={time}
                                    disabled={isBooked}
                                    onClick={() => setStartTime(time)}
                                    className={`relative py-3 rounded-2xl text-[11px] font-black transition-all border-2 ${
                                        isBooked ? 'bg-gray-100 text-gray-300 border-transparent line-through' :
                                        isSelected ? 'bg-park-primary border-park-primary text-white shadow-lg shadow-park-primary/20 scale-105' :
                                        isSurge ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                        'bg-white text-park-dark border-gray-100'
                                    }`}
                                >
                                    {isSurge && <Zap size={10} className="absolute -top-1 -right-0.5 text-orange-500" fill="currentColor" />}
                                    {h > 12 ? `${h-12}PM` : h === 12 ? '12PM' : `${h}AM`}
                                </button>
                            );
                        })}
                        <div className="bg-gray-50 rounded-2xl py-3 flex items-center justify-center text-[10px] font-black text-gray-300 uppercase border-2 border-dashed border-gray-100">Full</div>
                    </div>
                </section>

                {/* Duration */}
                <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-4">Duration (Hours)</h3>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4].map((h) => (
                            <button
                                key={h}
                                onClick={() => setDuration(h)}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${
                                    duration === h ? 'bg-park-primary text-white shadow-lg' : 'bg-white text-park-dark border border-gray-100'
                                }`}
                            >
                                {h} Hr{h > 1 ? 's' : ''}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Price Guide Card */}
                <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 bg-emerald-100/50 rounded-full blur-2xl -mr-10 -mt-10" />
                     <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={14} /> {spot.area} Price Guide
                     </h4>
                     <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-800/60 uppercase">Area Average</span>
                            <span className="font-black text-emerald-800">₹{spot.cityPricing?.avg}/hr</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-800/60 uppercase">This Space</span>
                            <span className="font-black text-emerald-800">₹{spot.pricing?.basePrice}/hr</span>
                        </div>
                        <div className="pt-3 border-t border-emerald-200/50 flex justify-between items-center">
                            <p className="text-xs font-black text-emerald-700">✓ ₹{spot.cityPricing?.avg - spot.pricing?.basePrice} below area average</p>
                        </div>
                     </div>
                </div>

                {/* Order Summary */}
                <section className="bg-park-dark rounded-[40px] p-8 text-white relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-park-primary/20 blur-3xl rounded-full" />
                    <h3 className="text-lg font-black font-outfit mb-6 flex justify-between items-end">
                        Payment Summary
                        <span className="text-xs font-bold text-white/40 uppercase">PS2024</span>
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-xs">
                            <span className="text-white/40 font-bold uppercase">Base rate</span>
                            <span className="font-black">₹{price.base}/hr × {price.duration}h</span>
                        </div>
                        {price.surgeMult > 1 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-orange-400 font-bold uppercase">Peak hour (×{price.surgeMult})</span>
                                <span className="font-black text-orange-400">+₹{Math.round(price.subtotal * 0.3)}</span>
                            </div>
                        )}
                        {price.coveredPremium > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-white/40 font-bold uppercase">Covered premium</span>
                                <span className="font-black">+₹{price.coveredPremium}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs">
                            <span className="text-white/40 font-bold uppercase">Platform fee (10%)</span>
                            <span className="font-black">+₹{Math.round(price.platformFee)}</span>
                        </div>
                        {couponApplied && (
                            <div className="flex justify-between text-xs">
                                <span className="text-emerald-400 font-bold uppercase">Coupon ({couponApplied.code})</span>
                                <span className="font-black text-emerald-400">-₹{couponApplied.discount}</span>
                            </div>
                        )}
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-sm font-black uppercase">Final Total</span>
                            <span className="text-3xl font-black text-park-primary font-outfit">₹{price.total}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input 
                                type="text" 
                                placeholder="Coupon Code" 
                                className="w-full bg-white/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-white/10 focus:ring-1 focus:ring-park-primary transition-all"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                            />
                        </div>
                        <button onClick={applyCoupon} className="bg-park-primary/20 text-park-primary px-6 rounded-2xl font-black uppercase text-xs hover:bg-park-primary hover:text-white transition-all">Apply</button>
                    </div>

                    <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest mb-8">
                        💰 You saved ₹{price.saved} vs area average
                    </p>

                    <button 
                        onClick={handleBooking}
                        disabled={submitting || !startTime}
                        className="w-full h-16 bg-gradient-to-r from-park-primary to-park-secondary rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-park-primary/30 disabled:opacity-50 disabled:from-gray-500 disabled:to-gray-500 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative flex items-center justify-center gap-2">
                             {submitting ? 'Processing...' : `Confirm & Pay ₹${price.total}`} 
                             {!submitting && <ArrowRight size={20} />}
                        </span>
                    </button>
                </section>
            </div>
        </div>
    );
};

export default Booking;
