import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, ShieldCheck, CheckCircle2, Loader2, AlertCircle, Calendar, MapPin, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking } = location.state || {};

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry]         = useState('');
    const [cvv, setCvv]               = useState('');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus]         = useState('idle'); // idle, loading, success, error
    const [error, setError]           = useState('');

    useEffect(() => {
        if (!booking) navigate('/dashboard');
    }, [booking, navigate]);

    if (!booking) return null;

    const formatCardNumber = (val) => {
        const raw = val.replace(/\D/g, '');
        const chunks = raw.match(/.{1,4}/g) || [];
        return chunks.join(' ').substr(0, 19);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (cardNumber.length < 19) { setError('Invalid card number'); return; }
        if (expiry.length < 5) { setError('Invalid expiry'); return; }
        if (cvv.length < 3) { setError('Invalid CVV'); return; }

        setProcessing(true);
        setStatus('loading');
        setError('');

        try {
            const response = await apiService.processPayment({
                booking_id: booking.id || booking._id,
                amount:     booking.totalPrice || booking.total_price,
                status:     'Success',
                cardNumber: cardNumber
            });

            // Simulate server response delay for realism
            await new Promise(r => setTimeout(r, 2000));
            
            setStatus('success');
            setTimeout(() => navigate(`/navigation/${booking.id || booking._id}`), 2500);
        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
            setStatus('error');
            setProcessing(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={52} className="text-green-500" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-3xl font-black text-park-dark font-outfit mb-2">Payment Success!</h2>
                    <p className="text-gray-400 font-medium">Your parking spot is reserved. Redirecting to navigation...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="px-5 pt-12 pb-6 flex items-center gap-4 bg-white border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-xl"><ChevronLeft size={22} /></button>
                <h1 className="text-xl font-black text-park-dark font-outfit">Checkout</h1>
            </div>

            <div className="p-5 space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                            <h3 className="font-black text-lg text-park-dark font-outfit truncate">{booking.spotName}</h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {booking.spotAddress}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-park-primary">₹{booking.totalPrice || booking.total_price}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Due</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 py-3 border-t border-dashed border-gray-100 mt-2">
                        <Calendar size={14} className="text-park-primary" />
                        <span className="text-xs font-bold text-gray-600">Reserved for Today</span>
                    </div>
                </div>

                {/* Card Info */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <CreditCard size={14} className="text-park-primary" /> Payment details
                        </h3>
                        <div className="flex gap-1">
                            <div className="w-8 h-5 bg-gray-100 rounded" />
                            <div className="w-8 h-5 bg-gray-100 rounded" />
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Card Number</label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text" placeholder="0000 0000 0000 0000"
                                    className="input-field pl-12"
                                    value={cardNumber} onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setError(''); }}
                                    maxLength={19}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Expiry</label>
                                <input
                                    type="text" placeholder="MM/YY"
                                    className="input-field"
                                    value={expiry} onChange={e => {
                                        let v = e.target.value.replace(/\D/g, '').substr(0, 4);
                                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                        setExpiry(v);
                                        setError('');
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">CVV</label>
                                <input
                                    type="password" placeholder="123"
                                    className="input-field"
                                    value={cvv} onChange={e => { setCvv(e.target.value.replace(/\D/g, '').substr(0, 3)); setError(''); }}
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-50 text-red-500 rounded-2xl text-[11px] font-bold border border-red-100 flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="button-primary w-full py-4.5 text-base flex items-center justify-center gap-2 shadow-2xl shadow-park-primary/20 disabled:opacity-50"
                            >
                                {processing ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                {processing ? 'Verifying Transaction...' : `Securely Pay ₹${booking.totalPrice || booking.total_price}`}
                            </button>
                            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                <ShieldCheck size={12} className="text-green-500" /> SSL Encrypted Secured Payment
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* Hints for QA */}
                <div className="p-4 bg-gray-100 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">QA Test Cards:</p>
                    <div className="space-y-1">
                        <p className="text-[11px] font-mono text-gray-600">Success: 4242 4242 4242 4242</p>
                        <p className="text-[11px] font-mono text-gray-600">Decline: 4000 0000 0000 0002</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
