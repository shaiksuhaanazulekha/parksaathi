import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { User, Settings, Shield, Bell, LogOut, RefreshCcw, ChevronRight, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, profile, signOut, updateProfile } = useAuth();
    const navigate = useNavigate();

    const handleToggleMode = async () => {
        const newType = profile?.user_type === 'owner' ? 'driver' : 'owner';
        await updateProfile({ user_type: newType });
        navigate('/dashboard');
    };


    const [isDark, setIsDark] = useState(false);

    const toggleDarkMode = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const menuItems = [
        { title: 'Dark Mode', icon: Settings, color: 'text-gray-700', action: toggleDarkMode, type: 'toggle' },
        { title: 'Personal Information', icon: User, color: 'text-blue-500' },
        { title: 'Payment Methods', icon: CreditCard, color: 'text-green-500' },
        { title: 'Notifications', icon: Bell, color: 'text-orange-500' },
        { title: 'Security', icon: Shield, color: 'text-purple-500' },
    ];


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-park-primary px-6 pt-16 pb-12 rounded-b-[40px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-2xl">
                        <div className="w-full h-full bg-park-gray rounded-2xl flex items-center justify-center text-park-primary">
                            <User size={48} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold font-outfit">{profile?.full_name || 'User'}</h1>
                        <p className="text-white/70 text-sm">{user?.email}</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${profile?.user_type === 'owner' ? 'bg-park-accent' : 'bg-green-400'}`}></div>
                        {profile?.user_type} Mode
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-6">
                <button
                    onClick={handleToggleMode}
                    className="w-full bg-white p-4 rounded-2xl shadow-lg border border-park-primary/5 flex items-center justify-between group active:scale-[0.98] transition-transform"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-park-primary/10 p-3 rounded-xl">
                            <RefreshCcw className="text-park-primary group-hover:rotate-180 transition-transform duration-500" size={24} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-park-dark">Switch to {profile?.user_type === 'owner' ? 'Driver' : 'Owner'} Mode</h4>
                            <p className="text-xs text-gray-400">Changed your mind? Swap roles anytime</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300" size={20} />
                </button>
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.action}
                            className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`${item.color} ${isDark && item.type === 'toggle' ? 'text-yellow-400' : ''}`} size={20} />
                                <span className="text-sm font-semibold text-park-dark dark:text-white">{item.title}</span>
                            </div>
                            {item.type === 'toggle' ? (
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-park-primary' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDark ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            ) : (
                                <ChevronRight className="text-gray-300" size={16} />
                            )}
                        </button>
                    ))}
                </div>


                <button
                    onClick={signOut}
                    className="w-full mt-4 bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
