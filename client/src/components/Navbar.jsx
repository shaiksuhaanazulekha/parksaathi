import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';

const Navbar = () => {
    const location = useLocation();
    const { profile } = useAuth();
    const isOwner = (profile?.role || profile?.user_type || '').toLowerCase() === 'owner';
    const isDemo  = profile?.id?.startsWith('demo-');

    const [unread, setUnread] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            if (!profile?.id) return;
            try {
                const { data } = await apiService.getNotifications();
                const resData = Array.isArray(data) ? data : [];
                setUnread(resData.filter(n => !n.isRead).length);
            } catch (err) { console.error('Navbar notif error:', err); }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [profile?.id]);

    const driverTabs = [
        { name: 'Search',   path: '/dashboard', icon: Home },
        { name: 'Bookings', path: '/bookings',  icon: Calendar },
        { name: 'Profile',  path: '/profile',   icon: User },
    ];

    const ownerTabs = [
        { name: 'Dashboard', path: '/dashboard',        icon: LayoutDashboard },
        { name: 'List Spot', path: '/owner/list-spot',  icon: PlusCircle },
        { name: 'Profile',   path: '/profile',          icon: User },
    ];

    const tabs = isOwner ? ownerTabs : driverTabs;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[1000] safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            {isDemo && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white">
                    Demo Mode
                </div>
            )}
            <div className="flex justify-around items-center px-4 py-3 max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const Icon     = tab.icon;
                    const isActive = location.pathname === tab.path || (tab.path !== '/dashboard' && location.pathname.startsWith(tab.path));
                    return (
                        <Link
                            key={tab.name}
                            to={tab.path}
                            className={`flex flex-col items-center gap-1 group relative ${
                                isActive ? 'text-park-primary' : 'text-gray-400'
                            }`}
                        >
                            <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-park-primary/10' : 'group-hover:bg-gray-50'}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                                {tab.name === 'Profile' && unread > 0 && (
                                    <div className="absolute top-1.5 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {unread > 9 ? '9+' : unread}
                                    </div>
                                )}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${isActive ? 'text-park-primary opacity-100' : 'text-gray-400'}`}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default Navbar;
