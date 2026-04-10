import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, User, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
    const location = useLocation();
    const { profile } = useAuth();

    const isOwner = profile?.user_type === 'owner';

    const driverTabs = [
        { name: 'Search', path: '/dashboard', icon: Search },
        { name: 'Bookings', path: '/bookings', icon: Calendar },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const ownerTabs = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'List Spot', path: '/owner/list-spot', icon: PlusCircle },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const tabs = isOwner ? ownerTabs : driverTabs;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-4 py-3 z-50">
            {profile?.id?.startsWith('demo-') && (
                <div className="absolute -top-[23px] left-1/2 transform -translate-x-1/2 bg-[#f59e0b] shadow-md text-white px-6 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-t-lg z-0">
                    TESTING / DEMO MODE
                </div>
            )}
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;

                return (
                    <Link
                        key={tab.name}
                        to={tab.path}
                        className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-park-primary' : 'text-gray-400'
                            }`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-park-primary' : 'text-gray-400'
                            }`}>
                            {tab.name}
                        </span>
                        {isActive && (
                            <div className="w-1 h-1 rounded-full bg-park-primary mt-0.5" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};

export default Navbar;
