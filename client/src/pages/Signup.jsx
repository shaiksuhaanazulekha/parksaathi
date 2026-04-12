import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Car, Home as HouseIcon, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, user } = useAuth();

    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    const [step, setStep]               = useState(1);
    const [role, setRole]               = useState('driver');
    const [fullName, setFullName]       = useState('');
    const [email, setEmail]             = useState('');
    const [phone, setPhone]             = useState('');
    const [password, setPassword]       = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');

    const validate = () => {
        if (!fullName) { setError('Full name is required'); return false; }
        if (fullName.length < 3) { setError('Name is too short'); return false; }
        if (!email) { setError('Email is required'); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email format'); return false; }
        if (!password) { setError('Password is required'); return false; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;

        setLoading(true);
        try {
            await signup({
                name: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone: phone.trim(),
                role: role.charAt(0).toUpperCase() + role.slice(1),
                user_type: role,
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Signup failed. Email might already exist.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'driver', icon: Car, title: 'I\'m a Driver', sub: 'Find parking near me', grad: 'from-emerald-400 to-park-primary' },
        { id: 'owner',  icon: HouseIcon, title: 'I\'m a Host', sub: 'Rent out my space', grad: 'from-amber-400 to-park-accent' },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-12 pb-12 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-white p-4 rounded-[28px] shadow-xl border border-gray-100 mb-4">
                        <img src="/logo.png" alt="logo" className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-park-dark font-outfit">Join Us</h1>
                    <p className="text-gray-400 text-sm font-medium">Smart Parking for Everyone</p>
                </div>

                <div className="flex justify-center gap-2 mb-10">
                    {[1, 2].map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-12 bg-park-primary' : 'w-6 bg-gray-100'}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div key="s1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="space-y-4">
                            <h2 className="text-center font-black text-gray-400 uppercase tracking-[4px] text-[10px] mb-6">Choose Your Role</h2>
                            {roles.map(r => (
                                <button
                                    key={r.id} onClick={() => { setRole(r.id); setStep(2); }}
                                    className={`w-full p-6 rounded-[32px] border-2 bg-white flex items-center gap-5 transition-all hover:scale-[1.02] active:scale-[0.98] ${role === r.id ? 'border-park-primary shadow-2xl shadow-park-primary/10' : 'border-gray-50 shadow-sm'}`}
                                >
                                    <div className={`w-14 h-14 bg-gradient-to-br ${r.grad} rounded-2xl flex items-center justify-center text-white shadow-lg`}><r.icon size={26} /></div>
                                    <div className="text-left flex-1">
                                        <p className="font-black text-park-dark text-lg leading-none">{r.title}</p>
                                        <p className="text-xs text-gray-400 mt-1.5">{r.sub}</p>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-200" />
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.form key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleSignup} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-black text-park-dark font-outfit uppercase tracking-tighter">Your Details</h3>
                                <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black underline text-park-primary">BACK</button>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input type="text" placeholder="John Doe" className="input-field" value={fullName} onChange={e => { setFullName(e.target.value); setError(''); }} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                <input type="email" placeholder="john@email.com" className="input-field" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mobile No</label>
                                <input type="tel" placeholder="9876543210" className="input-field" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-12" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 text-red-500 rounded-2xl text-[11px] font-bold border border-red-100 flex items-center gap-2">
                                        <AlertCircle size={14} /> {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button type="submit" disabled={loading} className="button-primary w-full py-4.5 text-base flex items-center justify-center gap-2 shadow-2xl shadow-park-primary/25 disabled:opacity-50">
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={20} />}
                                {loading ? 'Creating...' : `Join as ${role}`}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p className="text-center text-sm font-bold text-gray-400 mt-10">
                    Already with us? <Link to="/login" className="text-park-primary underline underline-offset-4 ml-1">Login here</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
