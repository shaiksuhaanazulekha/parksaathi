import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, IndianRupee, Clock, Image as ImageIcon, Save, Trash2, Globe, CloudUpload, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useGoogleDrive } from '../hooks/useGoogleDrive';

const ListSpot = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { openPicker } = useGoogleDrive();
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        rate: '',
        startTime: '08:00',
        endTime: '22:00',
    });

    const [photos, setPhotos] = useState([]); // Array of { id, url, driveId }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        if (photos.length + files.length > 5) {
            alert('Maximum 5 photos allowed per parking space.');
            return;
        }

        setUploading(true);
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Max 5MB.`);
                continue;
            }

            const fileName = `${Date.now()}_${file.name}`;
            const reader = new FileReader();
            
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                try {
                    setUploadProgress(prev => ({ ...prev, [fileName]: 20 }));
                    const res = await apiService.uploadDrivePhoto({
                        fileBase64: base64,
                        fileName,
                        mimeType: file.type,
                        uploadType: 'parking-space',
                        entityId: 'temp_id' // We will update this later or just handle orphans
                    });
                    setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
                    setPhotos(prev => [...prev, { id: res.data.driveFileId, url: res.data.viewUrl, driveId: res.data.driveFileId }]);
                } catch (error) {
                    console.error('Upload failed', error);
                }
            };
            reader.readAsDataURL(file);
        }
        setUploading(false);
    };

    const handleDrivePick = () => {
        openPicker(async (docs) => {
            const newPhotos = docs.map(doc => ({
                id: doc.id,
                url: doc.url, // This is often a view link
                driveId: doc.id
            }));
            
            // In a real app, you'd want to sync these to your backend/DB too
            // For now, we'll just add them to the local state
            setPhotos(prev => [...prev.slice(0, 5 - newPhotos.length), ...newPhotos].slice(0, 5));
        });
    };

    const removePhoto = async (id) => {
        try {
            await apiService.deleteDrivePhoto(id, { uploadType: 'parking-space' });
            setPhotos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            setPhotos(prev => prev.filter(p => p.id !== id)); // Remove from UI anyway
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile?.id) return;

        setLoading(true);
        try {
            const spotRes = await apiService.createSpot({
                owner_id: profile.id,
                name: formData.name,
                address: formData.address,
                hourly_rate: formData.rate,
                lat: 17.3850 + (Math.random() - 0.5) * 0.1,
                lng: 78.4867 + (Math.random() - 0.5) * 0.1,
                image_url: photos.length > 0 ? photos[0].url : `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400`,
                drive_file_ids: photos.map(p => p.driveId),
                photo_urls: photos.map(p => p.url)
            });
            
            alert('Parking spot listed successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to list spot", error);
            alert("Failed to list spot: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-gray-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-gray-50 rounded-full text-park-dark"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-park-dark font-outfit">List Your Spot</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-6 space-y-6 pb-32">
                <div className="space-y-6 pt-6">
                    {/* Photo Upload Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">Parking Space Photos (Max 5)</label>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleDrivePick}
                                className="flex flex-col items-center justify-center p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl hover:bg-blue-100 transition-colors gap-2"
                            >
                                <Globe className="text-blue-500" size={24} />
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">From Drive</span>
                            </button>
                            
                            <label className="flex flex-col items-center justify-center p-4 bg-park-gray border-2 border-dashed border-gray-200 rounded-3xl hover:bg-gray-100 transition-colors gap-2 cursor-pointer">
                                <CloudUpload className="text-park-primary" size={24} />
                                <span className="text-[10px] font-bold text-park-dark uppercase tracking-wider">From Device</span>
                                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                        </div>

                        {/* Progress Bars */}
                        {Object.entries(uploadProgress).map(([name, progress]) => (
                            progress < 100 && (
                                <div key={name} className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-park-primary h-full transition-all duration-300" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            )
                        ))}

                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <AnimatePresence>
                                {photos.map((photo) => (
                                    <motion.div
                                        key={photo.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                                    >
                                        <img src={photo.url} alt="Parking" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(photo.id)}
                                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="absolute bottom-1 right-1">
                                            <CheckCircle2 size={16} className="text-green-500 bg-white rounded-full" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {photos.length === 0 && !uploading && (
                                <div className="col-span-3 py-10 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                    <ImageIcon size={32} className="text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-400 font-medium">No photos yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Ashok Villa Parking"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                            <textarea
                                placeholder="Plot no, Street, Area, Hyderabad"
                                className="input-field pl-12 h-24 pt-3 resize-none"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate (₹)</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number"
                                placeholder="e.g. 50"
                                className="input-field pl-12"
                                value={formData.rate}
                                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="time"
                                    className="input-field pl-12"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="time"
                                    className="input-field pl-12"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full button-primary py-4 text-lg flex items-center justify-center gap-2 shadow-xl shadow-park-primary/30"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20} />} 
                        {loading ? 'Publishing...' : 'Publish Spot'}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4 px-8 leading-relaxed">
                        By publishing, you agree to ParkSaathi's Host Terms and Guarantee.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ListSpot;

