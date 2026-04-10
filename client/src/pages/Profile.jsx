import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { useAuth } from '../hooks/useAuth';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import apiService from '../services/api';
import { User, Settings, Shield, Bell, LogOut, RefreshCcw, ChevronRight, CreditCard, Camera, CloudUpload, Globe, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { openPicker } = useGoogleDrive();

    const [loading, setLoading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Cropping state
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [aspect] = useState(1);
    const imgRef = useRef(null);

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height));
    };

    const getCroppedImg = useCallback(async () => {
        if (!imgRef.current || !crop) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                   resolve(reader.result.split(',')[1]);
                };
            }, 'image/jpeg');
        });
    }, [crop]);

    const handleUploadCropped = async () => {
        setLoading(true);
        try {
            const base64 = await getCroppedImg();
            const res = await apiService.uploadDrivePhoto({
                fileBase64: base64,
                fileName: `profile_${user.uid}.jpg`,
                mimeType: 'image/jpeg',
                uploadType: 'profile'
            });
            await refreshProfile();
            setShowPhotoModal(false);
            setImgSrc('');
        } catch (error) {
            console.error('Profile upload failed', error);
            alert('Failed to upload profile photo');
        } finally {
            setLoading(false);
        }
    };

    const handleDrivePick = () => {
        openPicker(async (docs) => {
            if (docs.length > 0) {
                const doc = docs[0];
                try {
                    setLoading(true);
                    // For Drive selection, we just update the URL directly if we don't want to crop
                    // but usually you want to save the driveId too
                    await apiService.updateProfile(profile.id, {
                        profile_photo_drive_id: doc.id,
                        profile_photo_url: doc.url
                    });
                    await refreshProfile();
                    setShowPhotoModal(false);
                } catch (error) {
                    alert('Failed to set profile from Drive');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleToggleMode = async () => {
        const newType = profile?.user_type === 'owner' ? 'driver' : 'owner';
        await updateProfile({ user_type: newType });
        navigate('/dashboard');
    };

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
            {/* Header / Avatar Section */}
            <div className="bg-park-primary px-6 pt-16 pb-12 rounded-b-[40px] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>

                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="relative group">
                        <div className="w-28 h-28 bg-white rounded-[40px] p-1 shadow-2xl transform group-hover:rotate-6 transition-transform">
                            <div className="w-full h-full bg-park-gray rounded-[36px] flex items-center justify-center text-park-primary overflow-hidden">
                                {profile?.profile_photo_url ? (
                                    <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={54} />
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPhotoModal(true)}
                            className="absolute -bottom-2 -right-2 bg-white text-park-primary p-2.5 rounded-2xl shadow-lg border border-park-primary/5 hover:scale-110 active:scale-95 transition-all"
                        >
                            <Camera size={20} />
                        </button>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-2xl font-bold font-outfit">{profile?.fullName || profile?.full_name || 'User'}</h1>
                        <p className="text-white/70 text-sm">{user?.email}</p>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/20">
                        <div className={`w-2 h-2 rounded-full ${profile?.user_type === 'owner' ? 'bg-park-accent' : 'bg-green-400'}`}></div>
                        {profile?.user_type} Mode
                    </div>
                </div>
            </div>

            {/* Role Switch & Menu */}
            <div className="px-6 -mt-6">
                <button
                    onClick={handleToggleMode}
                    className="w-full bg-white p-5 rounded-3xl shadow-xl shadow-park-primary/5 border border-park-primary/5 flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-park-primary/10 p-3.5 rounded-2xl group-hover:bg-park-primary transition-colors">
                            <RefreshCcw className="text-park-primary group-hover:text-white group-hover:rotate-180 transition-all duration-700" size={24} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-park-dark">Switch to {profile?.user_type === 'owner' ? 'Driver' : 'Owner'} Mode</h4>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Instant Role Swap</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-park-primary transition-colors" size={20} />
                </button>
            </div>

            <div className="p-6 space-y-4 pb-24">
                <div className="grid grid-cols-1 gap-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.action}
                            className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`${item.color}`} size={20} />
                                <span className="text-sm font-bold text-park-dark dark:text-white">{item.title}</span>
                            </div>
                            {item.type === 'toggle' ? (
                                <div className={`w-11 h-6 rounded-full relative transition-colors ${isDark ? 'bg-park-primary' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isDark ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            ) : (
                                <ChevronRight className="text-gray-300" size={16} />
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={signOut}
                    className="w-full mt-4 bg-red-50 text-red-600 p-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                    <LogOut size={20} /> Sign Out
                </button>
            </div>

            {/* Photo Upload Modal */}
            <AnimatePresence>
                {showPhotoModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-park-dark font-outfit">Update Photo</h3>
                                <button onClick={() => { setShowPhotoModal(false); setImgSrc(''); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                            </div>

                            <div className="p-8">
                                {!imgSrc ? (
                                    <div className="space-y-4">
                                        <button onClick={handleDrivePick} className="w-full flex items-center gap-4 p-5 bg-blue-50 text-blue-700 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-colors">
                                            <div className="bg-white p-3 rounded-2xl shadow-sm"><Globe size={24}/></div>
                                            <div className="text-left">
                                                <p className="font-bold">Google Drive</p>
                                                <p className="text-[10px] opacity-70">Pick from your Drive files</p>
                                            </div>
                                        </button>

                                        <label className="w-full flex items-center gap-4 p-5 bg-park-gray text-park-dark rounded-3xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                            <div className="bg-white p-3 rounded-2xl shadow-sm"><CloudUpload size={24}/></div>
                                            <div className="text-left">
                                                <p className="font-bold">Upload New</p>
                                                <p className="text-[10px] opacity-70">Take a photo or pick from device</p>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="rounded-3xl overflow-hidden border border-gray-100">
                                            <ReactCrop
                                                crop={crop}
                                                onChange={(c) => setCrop(c)}
                                                aspect={aspect}
                                                circularCrop
                                            >
                                                <img 
                                                    ref={imgRef}
                                                    src={imgSrc} 
                                                    alt="Crop" 
                                                    onLoad={onImageLoad}
                                                    className="w-full max-h-[40vh] object-contain" 
                                                />
                                            </ReactCrop>
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setImgSrc('')}
                                                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold flex items-center justify-center gap-2"
                                            >
                                                <X size={18}/> Cancel
                                            </button>
                                            <button 
                                                onClick={handleUploadCropped}
                                                disabled={loading}
                                                className="flex-1 py-4 bg-park-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-park-primary/20"
                                            >
                                                {loading ? <RefreshCcw className="animate-spin" size={18}/> : <Check size={18}/>}
                                                {loading ? 'Uploading...' : 'Save Photo'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;

