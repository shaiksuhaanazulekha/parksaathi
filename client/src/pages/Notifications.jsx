import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, BellOff, CheckCircle2, IndianRupee, MapPin, Clock, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]           = useState(true);

    const fetchNotifs = async () => {
        setLoading(true);
        try {
            const { data } = await apiService.getNotifications();
            setNotifications(data || []);
        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifs(); }, []);

    const markRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => apiService.markNotificationRead(n.id)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="px-5 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-xl"><ChevronLeft size={22} /></button>
                    <h1 className="text-xl font-black text-park-dark font-outfit">Notifications</h1>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button onClick={markAllRead} className="text-[10px] font-black text-park-primary underline uppercase tracking-widest leading-none">Mark all read</button>
                )}
            </div>

            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-park-primary opacity-30" size={32} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing alerts...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <AnimatePresence>
                        {notifications.map((n, i) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => !n.isRead && markRead(n.id)}
                                className={`p-5 rounded-[28px] border transition-all relative overflow-hidden group ${
                                    n.isRead ? 'bg-white border-gray-100 opacity-60' : 'bg-white border-park-primary/20 shadow-lg shadow-park-primary/5'
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`p-3 rounded-2xl shrink-0 ${
                                        n.type === 'Payment' ? 'bg-emerald-50 text-emerald-500' :
                                        n.type === 'Booking' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                        {n.type === 'Payment' ? <IndianRupee size={20} /> : <Bell size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-black text-park-dark text-sm leading-tight">{n.title}</h3>
                                            <span className="text-[9px] font-bold text-gray-300 whitespace-nowrap ml-2">
                                                {new Date(n.timestamp || n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed pr-2">{n.message}</p>
                                    </div>
                                </div>
                                {!n.isRead && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <div className="w-2 h-2 bg-park-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <BellOff size={32} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-park-dark mb-2">Inbox Empty</h2>
                        <p className="text-sm text-gray-400">All caught up! We'll notify you when something happens.</p>
                        <button onClick={fetchNotifs} className="mt-8 flex items-center gap-2 text-xs font-black text-park-primary uppercase tracking-widest">
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
