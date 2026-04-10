import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Car, Home as House, ArrowRight, User, Phone, Mail, Lock } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
    const [step, setStep] = useState(1); // 1: Role, 2: Info
    const [role, setRole] = useState(null); // 'driver' or 'owner'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const { signup, verifyOtp } = useAuth();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signup({
                email,
                phone,
                full_name: fullName,
                user_type: role,
                password
            });
            // On success, backend sends OTP and we move to OTP step
            setStep(3);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setVerifying(true);
        setError(null);

        try {
            await verifyOtp(phone, otp);
            // After phone verification, we inform them to check email too, but for MVP we can navigate
            alert("Phone Verified! Please also verify your email via the link sent to you.");
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        } finally {
            setVerifying(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center px-6 pt-12 overflow-x-hidden">
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <div className="inline-block bg-white p-3 rounded-2xl shadow-sm mb-4">
                                    <img src="/logo.png" alt="ParkSaathi" className="w-12 h-12" />
                                </div>
                                <h1 className="text-3xl font-bold text-park-dark mb-2 font-outfit">Join ParkSaathi</h1>
                                <p className="text-gray-500 font-medium">Choose your primary role</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => { setRole('driver'); setStep(2); }}
                                    className={`flex items-center p-6 rounded-3xl transition-all duration-300 border-2 text-left group ${role === 'driver' ? 'border-park-primary bg-park-primary/5' : 'border-white bg-white'
                                        } shadow-md hover:shadow-xl`}
                                >
                                    <div className="bg-park-primary/10 p-4 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                                        <Car className="text-park-primary w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-lg font-bold text-park-dark">I want to Park</span>
                                        <p className="text-gray-400 text-xs mt-1">Search, book and navigate to slots</p>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-300" />
                                </button>

                                <button
                                    onClick={() => { setRole('owner'); setStep(2); }}
                                    className={`flex items-center p-6 rounded-3xl transition-all duration-300 border-2 text-left group ${role === 'owner' ? 'border-park-primary bg-park-primary/5' : 'border-white bg-white'
                                        } shadow-md hover:shadow-xl`}
                                >
                                    <div className="bg-park-accent/10 p-4 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                                        <House className="text-park-accent w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-lg font-bold text-park-dark">I have a Space</span>
                                        <p className="text-gray-400 text-xs mt-1">List your spot and track earnings</p>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-300" />
                                </button>
                            </div>

                            <p className="text-center text-gray-500 font-medium pt-4">
                                Already have an account?{' '}
                                <Link to="/login" className="text-park-primary font-bold">Log in</Link>
                            </p>
                        </motion.div>
                    ) : step === 2 ? (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <button
                                onClick={() => setStep(1)}
                                className="text-park-primary font-bold flex items-center gap-2 mb-4 hover:gap-3 transition-all"
                            >
                                <ArrowRight className="rotate-180" size={20} /> Back
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-park-dark font-outfit">
                                    {role === 'driver' ? 'Driver Registration' : 'House Owner Info'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Complete your profile to get started</p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="input-field pl-12"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            placeholder="+91 9876543210"
                                            className="input-field pl-12"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="input-field pl-12"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input-field pl-12"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</p>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full button-primary flex items-center justify-center gap-2 py-4"
                                    >
                                        {loading ? 'Creating Account...' : (
                                            <>
                                                <UserPlus size={20} />
                                                Join ParkSaathi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-2xl space-y-8"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-park-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Phone className="text-park-primary w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-park-dark mb-2">Verify Phone</h2>
                                <p className="text-gray-400 text-sm px-4">
                                    We've sent a 6-digit code to <span className="font-bold text-park-dark">{phone}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        className="w-full text-center text-4xl font-black tracking-[1rem] py-6 rounded-3xl border-2 border-gray-100 focus:border-park-primary focus:ring-4 focus:ring-park-primary/10 outline-none transition-all placeholder:text-gray-100"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={verifying}
                                    className="w-full button-primary py-5 rounded-3xl shadow-xl shadow-park-primary/30 flex items-center justify-center gap-3"
                                >
                                    {verifying ? (
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Complete Verification <ArrowRight size={20} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Signup;
