import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Phone, Mail, LogOut, ChevronRight, ShieldCheck, LayoutDashboard, RefreshCw, Bell, Camera, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const Profile = () => {
    const navigate = useNavigate();
    const { profile, signOut, updateProfile } = useAuth();

    const [editing, setEditing]   = useState(false);
    const [loading, setLoading]   = useState(false);
    const [name, setName]         = useState(profile?.name || '');
    const [phone, setPhone]       = useState(profile?.phone || '');
    const [saved, setSaved]       = useState(false);

    // Crop state
    const [cropModal, setCropModal] = useState(null); // url
    const [crop, setCrop]           = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const imgRef = useRef(null);

    const isOwner  = (profile?.role || profile?.user_type || '').toLowerCase() === 'owner';
    const isDemoUser = profile?.id?.startsWith('demo-');

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ name: name.trim(), phone: phone.trim() });
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 3000);
        } catch { /* error handled by context */ }
        finally { setLoading(false); }
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCropModal(url);
        }
    };

    const saveAvatar = async () => {
        if (!completedCrop || !imgRef.current) return;
        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        
        // Use a fixed size for profile photos
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // Create circular path for clipping
        ctx.beginPath();
        ctx.arc(200, 200, 200, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
            imgRef.current, 
            completedCrop.x * scaleX, completedCrop.y * scaleY, 
            completedCrop.width * scaleX, completedCrop.height * scaleY, 
            0, 0, 400, 400
        );
        
        setLoading(true);
        try {
            const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            
            const formData = new FormData();
            formData.append('photo', file);

            // POST to upload
            const { data: uploadRes } = await apiService.uploadPhoto(formData);
            
            // Update profile with the URL
            await updateProfile({ 
                profilePhoto: uploadRes.url,
                "profilePhoto.url": uploadRes.url, 
                "profilePhoto.filename": uploadRes.filename 
            });
            
            setCropModal(null);
        } catch (err) {
            console.error('Avatar update failed:', err);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <div className="bg-white pt-16 pb-12 px-6 border-b border-gray-100 rounded-b-[42px] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <User size={150} />
                </div>
                
                <div className="flex flex-col items-center relative z-10">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-[36px] bg-gradient-to-br from-park-primary to-park-dark flex items-center justify-center shadow-2xl shadow-park-primary/30 overflow-hidden ring-4 ring-white">
                            {profile?.profilePhoto ? (
                                <img src={profile.profilePhoto} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-white">{(profile?.name || 'U')[0].toUpperCase()}</span>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-park-primary text-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all">
                            <Camera size={18} />
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                        </label>
                    </div>

                    <div className="mt-6 text-center">
                        <h1 className="text-2xl font-black text-park-dark font-outfit">{profile?.name || 'User'}</h1>
                        <p className="text-sm text-gray-400 font-medium">{profile?.email}</p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm ${
                                isOwner ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                {isOwner ? 'House Owner' : 'Driver'}
                            </span>
                            {isDemoUser && <span className="text-[10px] font-black bg-park-dark text-white px-3 py-1.5 rounded-full shadow-sm">DEMO</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 max-w-lg mx-auto">
                {saved && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-700 text-xs font-black shadow-sm">
                        <ShieldCheck size={18} /> PROFILE UPDATED SUCCESSFULLY
                    </motion.div>
                )}

                <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} className="text-park-primary" /> Personal Information
                        </h3>
                        {editing ? (
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)} className="p-2 text-gray-400"><X size={18} /></button>
                                <button onClick={handleSave} disabled={loading} className="bg-park-primary text-white p-2 rounded-xl shadow-lg"><Check size={18} /></button>
                            </div>
                        ) : (
                            <button onClick={() => setEditing(true)} className="text-[10px] font-black underline text-park-primary uppercase tracking-wider">Modify</button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {[
                            { icon: User,  label: 'Full Name', value: name,  set: setName,  type: 'text' },
                            { icon: Phone, label: 'Phone No',  value: phone, set: setPhone, type: 'tel' },
                            { icon: Mail,  label: 'Email ID',  value: profile?.email || '', readonly: true },
                        ].map(({ icon: Icon, label, value, set, type, readonly }) => (
                            <div key={label} className="group">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2 group-focus-within:text-park-primary transition-colors">
                                    <Icon size={12} /> {label}
                                </p>
                                {editing && !readonly ? (
                                    <input type={type} className="w-full text-sm font-bold text-park-dark bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-park-primary/20 focus:bg-white transition-all" value={value} onChange={e => set(e.target.value)} />
                                ) : (
                                    <p className="text-sm font-black text-park-dark">{value || 'Not set'}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left group">
                        <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform"><LayoutDashboard size={20} /></div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-park-dark text-sm uppercase tracking-tight">Dashboard</p>
                            <p className="text-[11px] text-gray-400">View activity & stats</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                    <button onClick={() => navigate('/notifications')} className="w-full flex items-center gap-4 p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left group">
                        <div className="bg-purple-50 p-3.5 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform"><Bell size={20} /></div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-park-dark text-sm uppercase tracking-tight">Notifications</p>
                            <p className="text-[11px] text-gray-400">Alerts & messages</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                    <button 
                        onClick={async () => {
                            const newRole = isOwner ? 'Driver' : 'Owner';
                            setLoading(true);
                            await updateProfile({ role: newRole, user_type: newRole.toLowerCase() });
                            setLoading(false);
                            navigate('/dashboard');
                        }} 
                        className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left group"
                    >
                        <div className={`p-3.5 rounded-2xl group-hover:scale-110 transition-transform ${isOwner ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                            <RefreshCw size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-park-dark text-sm uppercase tracking-tight">Switch to {isOwner ? 'Driver' : 'Host'}</p>
                            <p className="text-[11px] text-gray-400">Change your active persona</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>

                <button onClick={signOut} className="w-full py-5 bg-red-50 text-red-500 rounded-[32px] font-black text-sm uppercase tracking-[3px] border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    Sign Out
                </button>
            </div>

            {/* Avatar Crop Modal */}
            <AnimatePresence>
                {cropModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/90 z-[3000] flex flex-col p-8">
                        <div className="flex justify-between items-center text-white mb-6">
                            <h2 className="font-black font-outfit text-xl uppercase tracking-widest">Update Avatar</h2>
                            <button onClick={() => setCropModal(null)}><X size={28} /></button>
                        </div>
                        <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl border border-white/10">
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1} circularCrop>
                                <img ref={imgRef} src={cropModal} alt="Avatar Source" onLoad={(e) => {
                                    const { width, height } = e.currentTarget;
                                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
                                }} className="max-h-[50vh] object-contain" />
                            </ReactCrop>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setCropModal(null)} className="flex-1 py-5 bg-white/10 text-white font-black text-sm rounded-[24px]">CANCEL</button>
                            <button onClick={saveAvatar} className="flex-1 py-5 bg-park-primary text-white font-black text-sm rounded-[24px] shadow-xl">SAVE AVATAR</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
