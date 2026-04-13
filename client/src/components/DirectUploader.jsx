import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const DirectUploader = ({ photos, setPhotos, max = 5, min = 2 }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const compressImage = (file, maxWidth = 800) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.onload = () => {
                const ratio = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.8);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (photos.length + selectedFiles.length > max) {
            alert(`You can only upload up to ${max} photos.`);
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const compressed = await compressImage(file);
                
                const formData = new FormData();
                formData.append('photo', compressed);

                const xhr = new XMLHttpRequest();
                const uploadPromise = new Promise((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            setProgress(Math.round((event.loaded / event.total) * 100));
                        }
                    });
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200 || xhr.status === 201) resolve(JSON.parse(xhr.responseText));
                            else reject(new Error('Upload failed'));
                        }
                    };
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    xhr.open('POST', `${apiUrl}/upload/photo`, true);
                    const token = localStorage.getItem('auth_token');
                    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(formData);
                });

                const result = await uploadPromise;
                setPhotos(prev => [...prev, result]);
                setProgress(0);
            }
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (filename) => {
        setPhotos(prev => prev.filter(p => p.filename !== filename));
    };

    const isMinimumMet = photos.length >= min;

    return (
        <div className="space-y-6">
            <div 
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    const files = e.dataTransfer.files;
                    if (files.length) handleUpload({ target: { files } });
                }}
                className={`relative h-60 border-4 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all ${
                    uploading ? 'bg-park-gray border-park-primary/20' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                }`}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90">
                                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * progress) / 100} className="text-park-primary transition-all duration-300" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black">{progress}%</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-park-primary tracking-widest animate-pulse">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-4">
                            <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-park-primary hover:scale-110 transition-transform"><Camera size={28} /></button>
                            <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-park-primary hover:scale-110 transition-transform"><ImageIcon size={28} /></button>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Drop photos here or click to browse</p>
                        </div>
                    </div>
                )}
                <input type="file" multiple ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </div>

            <Reorder.Group axis="x" values={photos} onReorder={setPhotos} className="grid grid-cols-3 gap-4">
                <AnimatePresence>
                    {photos.map((photo, i) => (
                        <Reorder.Item 
                            key={photo.filename} 
                            value={photo}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative aspect-square rounded-[32px] overflow-hidden border-2 border-gray-100 shadow-sm bg-white cursor-grab active:cursor-grabbing group"
                        >
                            <img src={photo.url} className="w-full h-full object-cover pointer-events-none" />
                            <button 
                                onClick={() => removePhoto(photo.filename)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X size={14} />
                            </button>
                            {i === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-park-primary/90 backdrop-blur-sm py-1.5 flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Cover Photo</span>
                                </div>
                            )}
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            <div className={`p-5 rounded-[32px] flex items-center justify-between border-2 transition-all ${
                isMinimumMet ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
                <div className="flex items-center gap-2">
                    <CloudUpload size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {photos.length}/{max} Photos Added
                    </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {isMinimumMet ? 'Ready to publish' : `${min} Required`}
                </span>
            </div>
        </div>
    );
};

export default DirectUploader;
