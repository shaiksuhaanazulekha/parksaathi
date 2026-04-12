import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, IndianRupee, Clock, Image as ImageIcon, Save, Trash2, CheckCircle2, Loader2, Globe, CloudUpload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const MAX_PHOTOS = 5;
const MAX_SIZE   = 5 * 1024 * 1024; // 5MB

const ListSpot = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { openPicker } = useGoogleDrive();

    const [loading, setLoading]     = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess]     = useState(false);
    const [error, setError]         = useState('');
    const [photos, setPhotos]       = useState([]); // { id, url, file, isDrive }

    // Crop state
    const [cropModal, setCropModal] = useState(null); // { url, index }
    const [crop, setCrop]           = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const imgRef = useRef(null);

    const [form, setForm] = useState({
        name: '', address: '', lat: '', lng: '',
        pricePerHour: '', totalSlots: '1',
        startTime: '08:00', endTime: '22:00',
        description: '',
    });

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleFiles = (files) => {
        if (photos.length >= MAX_PHOTOS) { setError('Maximum 5 photos allowed.'); return; }
        const toAdd = Array.from(files);
        
        if (photos.length + toAdd.length > MAX_PHOTOS) {
            setError(`You can only add ${MAX_PHOTOS - photos.length} more photos.`);
            return;
        }

        const newPhotos = [];
        for (const file of toAdd) {
            if (!file.type.startsWith('image/')) { setError(`${file.name} is not an image.`); continue; }
            if (file.size > MAX_SIZE) { setError(`${file.name} is too large (max 5MB).`); continue; }
            
            const url = URL.createObjectURL(file);
            newPhotos.push({ id: `local-${Date.now()}-${Math.random()}`, url, file, name: file.name });
        }
        setPhotos(prev => [...prev, ...newPhotos]);
        setError('');
    };

    const handleDrivePick = () => {
        if (photos.length >= MAX_PHOTOS) { setError('Maximum 5 photos allowed.'); return; }
        openPicker((docs) => {
            const remaining = MAX_PHOTOS - photos.length;
            const toAdd = docs.slice(0, remaining).map(doc => ({
                id: doc.id,
                url: doc.url || doc.embedUrl || `https://lh3.googleusercontent.com/d/${doc.id}`,
                isDrive: true,
                name: doc.name
            }));
            setPhotos(prev => [...prev, ...toAdd]);
            if (docs.length > remaining) setError(`Only added ${remaining} photos (limit reached).`);
        });
    };

    const removePhoto = (id) => {
        const photo = photos.find(p => p.id === id);
        if (photo && photo.url && !photo.isDrive) URL.revokeObjectURL(photo.url);
        setPhotos(prev => prev.filter(p => p.id !== id));
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
            width, height
        );
        setCrop(initialCrop);
    };

    const saveCrop = async () => {
        if (!completedCrop || !imgRef.current) return;
        
        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0,
            completedCrop.width,
            completedCrop.height
        );

        const base64 = canvas.toDataURL('image/jpeg');
        const newPhotos = [...photos];
        newPhotos[cropModal.index] = { ...newPhotos[cropModal.index], url: base64, isCropped: true };
        setPhotos(newPhotos);
        setCropModal(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile?.id) return navigate('/login');
        if (!form.name || !form.address || !form.pricePerHour) { setError('Required fields missing.'); return; }

        setLoading(true);
        setError('');
        try {
            await apiService.createSpot({
                ...form,
                ownerId:      profile.id,
                pricePerHour: parseFloat(form.pricePerHour),
                totalSlots:   parseInt(form.totalSlots) || 1,
                photos:       photos.map(p => p.url),
                lat:          parseFloat(form.lat) || 17.4483 + (Math.random() - 0.5) * 0.1,
                lng:          parseFloat(form.lng) || 78.3915 + (Math.random() - 0.5) * 0.1,
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="px-5 pt-12 pb-4 flex items-center gap-4 sticky top-0 bg-white z-[100] border-b border-gray-50">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-xl"><ChevronLeft size={22} /></button>
                <h1 className="text-xl font-black text-park-dark font-outfit">List Your Spot</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pb-32 space-y-6 pt-6">
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Photos ({photos.length}/{MAX_PHOTOS})</label>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            type="button"
                            onClick={handleDrivePick}
                            className="flex flex-col items-center justify-center p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl hover:bg-blue-100 transition-all gap-1 group"
                        >
                            <Globe size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-blue-600 uppercase">From Drive</span>
                        </button>
                        <label className="flex flex-col items-center justify-center p-4 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-3xl hover:bg-emerald-100 transition-all gap-1 group cursor-pointer">
                            <CloudUpload size={24} className="text-park-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-park-primary uppercase">From Device</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
                        </label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {photos.map((p, i) => (
                            <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
                                <img src={p.url} alt="spot" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {!p.isDrive && (
                                        <button type="button" onClick={() => setCropModal({ url: p.url, index: i })} className="p-1.5 bg-white rounded-lg text-park-dark shadow-sm">
                                            <ImageIcon size={14} />
                                        </button>
                                    )}
                                    <button type="button" onClick={() => removePhoto(p.id)} className="p-1.5 bg-red-500 rounded-lg text-white shadow-sm">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                {i === 0 && <span className="absolute top-1 left-1 bg-park-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">COVER</span>}
                            </div>
                        ))}
                        {photos.length === 0 && (
                            <div className="col-span-3 py-10 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                                <ImageIcon size={32} />
                                <p className="text-[10px] font-bold uppercase mt-2">No photos yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Location Name</label>
                        <input type="text" placeholder="e.g. Skyline Parking" className="input-field" value={form.name} onChange={set('name')} required />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 text-park-primary opacity-50" size={18} />
                            <textarea placeholder="Full address..." className="input-field pl-12 h-20 pt-3 resize-none" value={form.address} onChange={set('address')} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Rate (₹/hr)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-park-primary opacity-50" size={18} />
                                <input type="number" placeholder="50" className="input-field pl-12" value={form.pricePerHour} onChange={set('pricePerHour')} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Total Slots</label>
                            <input type="number" className="input-field" value={form.totalSlots} onChange={set('totalSlots')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Opens</label>
                            <input type="time" className="input-field" value={form.startTime} onChange={set('startTime')} />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Closes</label>
                            <input type="time" className="input-field" value={form.endTime} onChange={set('endTime')} />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100">
                            Error: {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-[110]">
                    <button type="submit" disabled={loading} className="button-primary w-full py-4 flex items-center justify-center gap-2 shadow-2xl shadow-park-primary/30">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {loading ? 'Publishing...' : 'Publish Parking Spot'}
                    </button>
                </div>
            </form>

            {/* Crop Modal */}
            <AnimatePresence>
                {cropModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/80 z-[2000] flex flex-col p-6">
                        <div className="flex justify-between items-center text-white mb-4">
                            <h2 className="font-black font-outfit text-xl">Crop Photo</h2>
                            <button onClick={() => setCropModal(null)}><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/40 rounded-3xl">
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={16 / 9}>
                                <img ref={imgRef} src={cropModal.url} alt="Crop" onLoad={onImageLoad} className="max-h-[60vh] object-contain" />
                            </ReactCrop>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setCropModal(null)} className="flex-1 py-4 bg-white/10 text-white font-bold rounded-2xl">Cancel</button>
                            <button onClick={saveCrop} className="flex-1 py-4 bg-park-primary text-white font-bold rounded-2xl shadow-lg">Apply Crop</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Overlay */}
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-park-primary z-[3000] flex flex-col items-center justify-center text-white p-10 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
                            <CheckCircle2 size={48} className="text-park-primary" />
                        </motion.div>
                        <h2 className="text-3xl font-black font-outfit mb-2">Spot Published!</h2>
                        <p className="opacity-80">Taking you back to dashboard...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ListSpot;
