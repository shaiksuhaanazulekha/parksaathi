import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Phone, Eye, EyeOff, ShieldCheck } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { login, loginWithPhone, verifyOtp } = useAuth();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await loginWithPhone(phone);
            setIsOtpSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await verifyOtp(phone, otp);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-white p-4 rounded-3xl shadow-xl mb-4 border border-park-primary/5">
                        <img src="/logo.png" alt="ParkSaathi" className="w-16 h-16 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-park-dark font-outfit">Welcome Back</h1>
                    <p className="text-gray-500 text-sm">Log in to your ParkSaathi account</p>
                </div>

                <div className="flex bg-park-gray p-1 rounded-2xl mb-8">
                    <button
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${loginMethod === 'email' ? 'bg-white text-park-dark shadow-sm' : 'text-gray-400'}`}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => setLoginMethod('phone')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${loginMethod === 'phone' ? 'bg-white text-park-dark shadow-sm' : 'text-gray-400'}`}
                    >
                        Mobile
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {loginMethod === 'email' ? (
                        <motion.form
                            key="email"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleEmailLogin}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="input-field"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="input-field pr-12"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full button-primary flex items-center justify-center gap-2"
                            >
                                {loading ? 'Authenticating...' : (
                                    <>
                                        <LogIn size={20} />
                                        Log in to ParkSaathi
                                    </>
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="phone"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}
                            className="space-y-5"
                        >
                            {!isOtpSent ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Mobile Number</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-park-dark">+91</span>
                                        <input
                                            type="tel"
                                            placeholder="98765 43210"
                                            className="input-field pl-14"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Enter OTP</label>
                                    <input
                                        type="text"
                                        placeholder="0 0 0 0"
                                        className="input-field text-center tracking-[1em] text-xl font-bold"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-center text-gray-400 mt-4">
                                        OTP sent to +91 {phone}. <button type="button" onClick={() => setIsOtpSent(false)} className="text-park-primary font-bold">Change?</button>
                                    </p>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full button-primary flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <ShieldCheck size={20} />
                                        {isOtpSent ? 'Verify OTP' : 'Get OTP'}
                                    </>
                                )}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-park-primary font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                            type="button"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await login('driver@demo.com', 'demo123');
                                    navigate('/dashboard');
                                } catch (e) { setError(e.message); }
                                finally { setLoading(false); }
                            }}
                            className="bg-white border border-gray-100 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-park-primary hover:text-white hover:border-park-primary transition-all shadow-sm group"
                        >
                            <span className="font-bold text-sm">Demo Driver</span>
                            <span className="text-[10px] opacity-50 font-medium text-gray-400 group-hover:text-white/70">One-Tap Login</span>
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await login('owner@demo.com', 'demo123');
                                    navigate('/dashboard');
                                } catch (e) { setError(e.message); }
                                finally { setLoading(false); }
                            }}
                            className="bg-white border border-gray-100 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-park-accent hover:text-white hover:border-park-accent transition-all shadow-sm group"
                        >
                            <span className="font-bold text-sm">Demo Owner</span>
                            <span className="text-[10px] opacity-50 font-medium text-gray-400 group-hover:text-white/70">One-Tap Login</span>
                        </button>
                    </div>

                    <div className="mt-8">
                        <button className="w-full bg-white border border-gray-100 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg" alt="Google" className="w-5 h-5" />
                            <span className="font-bold text-park-dark">Google Account</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
