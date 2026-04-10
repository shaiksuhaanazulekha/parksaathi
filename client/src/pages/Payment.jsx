import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, IndianRupee, ShieldCheck, CheckCircle2, CreditCard, Wallet, Smartphone, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';


const Payment = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [transactionId] = useState(() => `PS_${Math.floor(Math.random() * 900000000) + 100000000}`);
    const [selectedMode, setSelectedMode] = useState('UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const amount = state?.amount || 150;
    const bookingData = state?.bookingData;

    const paymentModes = [
        { id: 'UPI', name: 'UPI (GPay / PhonePe)', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'Card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'Wallet', name: 'Digital Wallet', icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'NetBanking', name: 'Net Banking', icon: Landmark, color: 'text-gray-600', bg: 'bg-gray-50' },
    ];

    const handlePayment = async (status = 'Success') => {
        setIsProcessing(true);

        try {
            // Simulate payment processing time
            await new Promise(resolve => setTimeout(resolve, 1500));

            await apiService.createPayment({
                booking_id: bookingData?.id,
                amount: amount,
                mode: selectedMode,
                transaction_id: status === 'Success' ? transactionId : null,
                status: status
            });

            setIsProcessing(false);
            if (status === 'Success') {
                setIsSuccess(true);
            } else {
                alert("Payment Failed! Your booking request has been cancelled.");
                navigate('/bookings');
            }
        } catch (e) {
            console.error("Payment failed", e);
            alert("Payment failed: " + e.message);
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-park-primary flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center max-w-sm w-full"
                >
                    <div className="bg-green-100 p-6 rounded-full mb-6">
                        <CheckCircle2 size={64} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-park-dark font-outfit mb-2">Payment Paid!</h2>
                    <p className="text-gray-500 mb-8 font-medium">Your parking spot at <span className="text-park-primary font-bold">{bookingData?.name || 'Ashok Vihar'}</span> has been successfully booked.</p>

                    <div className="bg-park-gray w-full p-6 rounded-3xl mb-8 flex justify-between items-center border border-gray-100">
                        <div className="text-left">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Transaction ID</p>
                            <p className="font-bold text-park-dark">{transactionId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Amount</p>
                            <p className="font-bold text-park-primary text-xl">₹{amount}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/bookings')}
                        className="w-full button-primary py-4"
                    >
                        View Bookings
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            <div className="bg-white px-6 pt-12 pb-6 flex items-center gap-4 relative z-10">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full text-park-dark">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-park-dark font-outfit">Payment</h1>
            </div>

            <div className="p-6 relative z-10">
                <div className="bg-park-dark rounded-[32px] p-8 text-white mb-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">Total Payable</p>
                        <div className="flex items-end gap-2">
                            <IndianRupee size={32} className="mb-2" />
                            <h2 className="text-5xl font-bold font-outfit">{amount}</h2>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
                            <ShieldCheck size={14} />
                            Secure encrypted transaction
                        </div>
                    </div>
                </div>

                <h3 className="font-bold text-park-dark mb-4 ml-2">Choose Payment Mode</h3>
                <div className="space-y-4 mb-8">
                    {paymentModes.map((mode) => (
                        <button
                            key={mode.id}
                            disabled={isProcessing}
                            onClick={() => setSelectedMode(mode.id)}
                            className={`w-full p-5 rounded-3xl flex items-center justify-between transition-all border-2 ${selectedMode === mode.id
                                ? 'border-park-primary bg-white shadow-lg scale-[1.02]'
                                : 'border-transparent bg-white shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`${mode.bg} p-3 rounded-2xl`}>
                                    <mode.icon className={mode.color} size={24} />
                                </div>
                                <span className="font-bold text-park-dark">{mode.name}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMode === mode.id ? 'border-park-primary' : 'border-gray-200'
                                }`}>
                                {selectedMode === mode.id && <div className="w-3 h-3 rounded-full bg-park-primary"></div>}
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => handlePayment('Success')}
                    disabled={isProcessing}
                    className="w-full button-primary py-5 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-park-primary/30"
                >
                    {isProcessing ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Processing...
                        </>
                    ) : (
                        <>Proceed to Pay ₹{amount}</>
                    )}
                </button>

                <button
                    onClick={() => handlePayment('Failed')}
                    disabled={isProcessing}
                    className="w-full mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                    Simulate Payment Failure
                </button>
            </div>
        </div>
    );
};

export default Payment;
