import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Eye, EyeOff, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    const [email, setEmail]             = useState('');
    const [password, setPassword]       = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]         = useState(false);
    const [demoLoading, setDemoLoading] = useState(null);
    const [error, setError]             = useState('');

    const validate = () => {
        if (!email) { setError('Email is required'); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email format'); return false; }
        if (!password) { setError('Password is required'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;
        
        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid credentials. Try demo login below.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async (role) => {
        setDemoLoading(role);
        setError('');
        try {
            await login(`${role}@demo.com`, 'demo123');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setDemoLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-16 pb-12 overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-white p-5 rounded-[32px] shadow-2xl border border-gray-100 mb-6">
                        <img src="/logo.png" alt="ParkSaathi" className="w-14 h-14 object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-park-dark font-outfit tracking-tighter">Login</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">Hello again! Welcome back.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email" placeholder="name@email.com"
                            className={`input-field ${error && email === '' ? 'border-red-500' : ''}`}
                            value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`input-field pr-12 ${error && password === '' ? 'border-red-500' : ''}`}
                                value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
                                <AlertCircle size={18} className="shrink-0" /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button type="submit" disabled={loading} className="button-primary w-full py-4.5 text-base flex items-center justify-center gap-2 shadow-2xl shadow-park-primary/25 disabled:opacity-50">
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn size={20} />}
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                    <div className="relative flex justify-center"><span className="px-4 bg-white text-[10px] text-gray-300 font-bold uppercase tracking-[4px]">Fast Access</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <button onClick={() => handleDemo('driver')} disabled={demoLoading} className="bg-white border border-gray-100 p-5 rounded-3xl flex flex-col items-center gap-2 hover:border-park-primary hover:bg-park-primary/5 transition-all shadow-sm group">
                        <Zap size={24} className="text-park-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-park-dark uppercase">Driver Demo</span>
                    </button>
                    <button onClick={() => handleDemo('owner')} disabled={demoLoading} className="bg-white border border-gray-100 p-5 rounded-3xl flex flex-col items-center gap-2 hover:border-park-accent hover:bg-park-accent/5 transition-all shadow-sm group">
                        <ShieldCheck size={24} className="text-park-accent group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-park-dark uppercase">Owner Demo</span>
                    </button>
                </div>

                <p className="text-center text-sm font-bold text-gray-400">
                    New to ParkSaathi? <Link to="/signup" className="text-park-primary underline underline-offset-4 ml-1">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
