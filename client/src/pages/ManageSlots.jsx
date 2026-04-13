import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalIcon, Clock, Lock, Unlock, User, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const ManageSlots = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [space, setSpace] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState({ available: [], booked: [], surge: [] });

    useEffect(() => {
        const fetch = async () => {
            try {
                const [spaceRes, slotsRes] = await Promise.all([
                   apiService.getSpot(id),
                   apiService.getSlots(id, selectedDate)
                ]);
                setSpace(spaceRes.data);
                setSlots(slotsRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id, selectedDate]);

    // Generate next 7 days for calendar
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white px-5 pt-12 pb-6 border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-100 rounded-xl"><ChevronLeft size={22} /></button>
                    <div>
                        <h1 className="text-xl font-black text-park-dark font-outfit uppercase">Manage Slots</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{space?.name}</p>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                    {days.map(d => (
                        <button 
                            key={d}
                            onClick={() => setSelectedDate(d)}
                            className={`flex-shrink-0 px-5 py-3 rounded-2xl font-black transition-all ${
                                selectedDate === d ? 'bg-park-primary text-white shadow-lg shadow-park-primary/20' : 'bg-gray-50 text-gray-400'
                            }`}
                        >
                            <span className="text-[10px] block uppercase opacity-50 mb-1">
                                {new Date(d).toLocaleDateString('en-IN', { weekday: 'short' })}
                            </span>
                            {new Date(d).getDate()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-8 flex-1">
                <section>
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6 flex items-center gap-2">
                        <Clock size={14} /> Schedule Overview
                    </h2>

                    <div className="space-y-3">
                        {Array.from({ length: 15 }, (_, i) => {
                            const h = i + 8;
                            const time = `${h.toString().padStart(2, '0')}:00`;
                            const isBooked = slots.booked.includes(time);
                            
                            return (
                                <div key={time} className={`p-4 rounded-[28px] border-2 transition-all flex items-center justify-between ${
                                    isBooked ? 'bg-park-primary/5 border-park-primary/20' : 'bg-white border-transparent'
                                }`}>
                                   <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isBooked ? 'bg-park-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {h > 12 ? `${h-12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm uppercase ${isBooked ? 'text-park-primary' : 'text-gray-400'}`}>
                                                {isBooked ? 'Slot Booked' : 'Slot Available'}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                {isBooked ? 'Earnings ₹35.00' : 'Price ₹35/hr'}
                                            </p>
                                        </div>
                                   </div>

                                   {isBooked ? (
                                        <button className="p-3 bg-park-primary/10 text-park-primary rounded-xl"><User size={18} /></button>
                                   ) : (
                                        <button className="px-4 py-2 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-xl tracking-tighter">Block</button>
                                   )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
            
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-park-dark text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
                <Lock size={18} className="text-park-primary" />
                <span className="text-xs font-black uppercase tracking-widest">Smart-Lock Sync Active</span>
            </div>
        </div>
    );
};

export default ManageSlots;
