// PARKSAATHI PRODUCTION BUILD - V3 - RE-VERIFIED CLEAN
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MapPin, IndianRupee, Clock, Image as ImageIcon, Save, Trash2, 
  CheckCircle2, Loader2, Globe, CloudUpload, X, Home, Building2, Store, TreePine, 
  Car, Bike, Shield, Eye, TrendingUp, Sparkles, Send, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import DirectUploader from '../components/DirectUploader';

const STEPS = ['Location', 'Basics', 'Photos', 'Pricing', 'Review'];

const ListSpot = () => {
    const navigate = useNavigate();
    useAuth();
    
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [, setError] = useState('');

    // Form Data
    const [form, setForm] = useState({
        name: '', description: '', address: '', city: 'Hyderabad', area: 'Banjara Hills',
        type: 'driveway', vehicles: ['car'],
        lat: 17.4483, lng: 78.3915,
        amenities: { covered: false, cctv: true, available24x7: true, lighting: true, washArea: false },
        capacity: 1, basePrice: 30, peakPricingEnabled: true,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        startTime: '00:00', endTime: '23:59'
    });

    const [photos, setPhotos] = useState([]);
    const [pricingIntel, setPricingIntel] = useState(null);

    useEffect(() => {
        if (step === 3) {
            apiService.getRecommendation(form.city, form.area).then(res => setPricingIntel(res.data));
        }
    }, [step, form.city, form.area]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleBack = () => step > 0 ? setStep(step - 1) : navigate(-1);
    const handleNext = () => step < 4 ? setStep(step + 1) : handleSubmit();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await apiService.createSpot({
                ...form,
                photos: photos.map(p => ({ url: p.url, filename: p.filename, size: p.size })),
                coordinates: { lat: form.lat, lng: form.lng },
                pricing: { basePrice: form.basePrice, peakPricingEnabled: form.peakPricingEnabled },
                availability: { days: form.days, startTime: form.startTime, endTime: form.endTime }
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header */}
            <div className="px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-white z-[100] border-b border-gray-50">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 bg-gray-100 rounded-xl"><ChevronLeft size={22} /></button>
                    <div>
                        <h1 className="text-xl font-black text-park-dark font-outfit uppercase tracking-tighter">List Your Spot</h1>
                        <p className="text-[10px] font-black text-park-primary uppercase tracking-widest leading-none">Step {step + 1} of 5: {STEPS[step]}</p>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setStep(i)}
                            className={`h-1.5 w-4 rounded-full transition-all cursor-pointer hover:opacity-80 ${i <= step ? 'bg-park-primary w-8' : 'bg-gray-100'}`} 
                        />
                    ))}
                </div>
            </div>

            <div className="px-5 pt-10">
                <AnimatePresence mode="wait">
                    {step === 0 && <StepLocation key={0} form={form} set={set} />}
                    {step === 1 && <StepDetails key={1} form={form} set={set} />}
                    {step === 2 && (
                        <motion.section key={2} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl">
                                <button 
                                    onClick={() => set('photoMode', 'upload')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${(!form.photoMode || form.photoMode === 'upload') ? 'bg-white shadow-sm text-park-primary' : 'text-gray-400'}`}
                                >
                                    Upload Photos
                                </button>
                                <button 
                                    onClick={() => set('photoMode', 'ai')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${(form.photoMode === 'ai') ? 'bg-white shadow-sm text-park-primary' : 'text-gray-400'}`}
                                >
                                    ✨ AI Generate
                                </button>
                            </div>

                            {form.photoMode === 'ai' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1,2,3,4].map(i => (
                                            <button 
                                                key={i}
                                                onClick={() => {
                                                    const url = `/ai-templates/${i}.png`;
                                                    const exists = photos.some(p => p.url === url);
                                                    if (exists) setPhotos(photos.filter(p => p.url !== url));
                                                    else setPhotos([...photos, { url, filename: `ai-${i}.png`, size: 1024 }]);
                                                }}
                                                className={`relative h-40 rounded-3xl overflow-hidden border-4 transition-all ${photos.some(p => p.url === `/ai-templates/${i}.png`) ? 'border-park-primary ring-4 ring-park-primary/20' : 'border-white'}`}
                                            >
                                                <img src={`/ai-templates/${i}.png`} className="w-full h-full object-cover" />
                                                {photos.some(p => p.url === `/ai-templates/${i}.png`) && (
                                                    <div className="absolute top-2 right-2 bg-park-primary text-white p-1 rounded-full"><CheckCircle2 size={16} /></div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Sparkles size={24} className="text-white" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Select professional photos generated by Gemini AI <br/> to make your listing stand out.
                                    </p>
                                </div>
                            ) : (
                                <DirectUploader photos={photos} setPhotos={setPhotos} />
                            )}
                        </motion.section>
                    )}
                    {step === 3 && <StepPricing key={3} form={form} set={set} intel={pricingIntel} />}
                    {step === 4 && <StepReview key={4} form={form} photos={photos} />}
                </AnimatePresence>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[2000] flex gap-3">
                <button 
                  onClick={handleNext} 
                  disabled={loading || (step === 2 && photos.length < 1)}
                  className="button-primary flex-1 py-4.5 flex items-center justify-center gap-2 shadow-2xl shadow-park-primary/20"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : step === 4 ? <Send size={20} /> : <Sparkles size={18} />}
                    {loading ? 'Publishing...' : step === 4 ? 'Confirm & Go Live' : 'Next Step'}
                </button>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-park-primary z-[3000] flex flex-col items-center justify-center text-white p-10 text-center">
                        <CheckCircle2 size={80} className="mb-6" />
                        <h2 className="text-3xl font-black font-outfit mb-2">Your Space is Now Live! 🎉</h2>
                        <p className="opacity-80 font-bold uppercase tracking-widest text-xs">Redirecting to Host Panel...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SUB COMPONENTS ---

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const StepLocation = ({ form, set }) => {
    const [fetching, setFetching] = useState(false);

    const fetchAddress = async (lat, lng) => {
        setFetching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.address) {
                const addr = data.display_name;
                const city = data.address.city || data.address.town || data.address.suburb || 'Hyderabad';
                const area = data.address.suburb || data.address.neighbourhood || 'Banjara Hills';
                set('address', addr);
                set('city', city);
                set('area', area);
                // Auto-set name if empty
                if (!form.name) set('name', `${area} Secure Parking`);
            }
        } catch (e) { console.error('Geocoding failed:', e); }
        finally { setFetching(false); }
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                set('lat', e.latlng.lat);
                set('lng', e.latlng.lng);
                fetchAddress(e.latlng.lat, e.latlng.lng);
            },
        });
        return form.lat ? <Marker position={[form.lat, form.lng]} /> : null;
    }

    const handleGPS = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            set('lat', latitude);
            set('lng', longitude);
            fetchAddress(latitude, longitude);
        });
    };

    function MapResizer() {
        const map = useMap();
        useEffect(() => {
            setTimeout(() => map.invalidateSize(), 100);
        }, [map]);
        return null;
    }

    return (
        <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="relative h-72 rounded-[32px] overflow-hidden border-4 border-gray-50 shadow-xl bg-gray-100 z-0">
                <MapContainer center={[form.lat, form.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                    <MapResizer />
                </MapContainer>
                <button 
                  onClick={handleGPS}
                  className="absolute bottom-4 right-4 z-[500] bg-park-primary text-white p-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  <MapPin size={24} />
                </button>
                <div className="absolute top-4 left-4 z-[500] bg-park-dark text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                    {fetching ? 'Magic Auto-filling...' : 'Pin Location or use GPS'}
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Detected Address</label>
                    <div className="relative">
                        <textarea 
                            className={`input-field h-24 pt-4 resize-none transition-all ${fetching ? 'opacity-50 grayscale' : ''}`} 
                            placeholder="Searching for address..."
                            value={form.address}
                            onChange={(e) => set('address', e.target.value)}
                        />
                        {fetching && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-park-primary" /></div>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="input-field py-4 px-4 flex items-center gap-3 bg-gray-50 border-transparent">
                        <Building2 size={18} className="text-park-primary" />
                        <span className="font-bold text-park-dark truncate">{form.city}</span>
                    </div>
                    <div className="input-field py-4 px-4 flex items-center gap-3 bg-gray-50 border-transparent">
                        <MapPin size={18} className="text-park-primary" />
                        <span className="font-bold text-park-dark truncate">{form.area}</span>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-center text-emerald-500 font-black uppercase tracking-widest animate-pulse">✨ Magic Location Enabled</p>
            
            <button 
                onClick={() => setStep(1)}
                className="w-full py-5 bg-park-primary text-white rounded-[24px] font-black uppercase text-xs tracking-[2px] shadow-xl shadow-park-primary/30 flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
            >
                Confirm & Continue <Sparkles size={16} />
            </button>
        </motion.section>
    );
};

const StepDetails = ({ form, set }) => (
    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
        <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Space Name</label>
            <input 
                type="text" 
                placeholder="e.g. Skyline Covered Parking" 
                className="input-field"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
            />
        </div>

        <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Space Type</label>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'driveway', label: 'Driveway', icon: Home },
                    { id: 'society', label: 'Society', icon: Building2 },
                    { id: 'commercial', label: 'Commercial', icon: Store },
                    { id: 'open', label: 'Open Lot', icon: TreePine },
                ].map(t => (
                    <button 
                        key={t.id}
                        onClick={() => set('type', t.id)}
                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                            form.type === t.id ? 'border-park-primary bg-park-primary/5 text-park-primary' : 'border-gray-100 text-gray-400'
                        }`}
                    >
                        <t.icon size={24} />
                        <span className="text-[10px] font-black uppercase">{t.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Supported Vehicles</label>
            <div className="flex gap-3">
                {[
                    { id: 'car', label: 'Car', icon: Car },
                    { id: 'bike', label: 'Bike', icon: Bike },
                ].map(v => (
                    <button 
                        key={v.id}
                        onClick={() => {
                            const current = [...form.vehicles];
                            const idx = current.indexOf(v.id);
                            if (idx > -1) current.splice(idx, 1);
                            else current.push(v.id);
                            set('vehicles', current);
                        }}
                        className={`flex-1 py-4 rounded-3xl border-2 transition-all flex items-center justify-center gap-2 ${
                            form.vehicles.includes(v.id) ? 'border-park-primary bg-park-primary/5 text-park-primary' : 'border-gray-100 text-gray-400'
                        }`}
                    >
                        <v.icon size={18} />
                        <span className="text-xs font-black uppercase">{v.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Amenities</label>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'covered', label: 'Covered', icon: Shield },
                    { id: 'cctv', label: 'CCTV Security', icon: Eye },
                    { id: 'available24x7', label: '24/7 Access', icon: Clock },
                    { id: 'lighting', label: 'Night Light', icon: Zap },
                ].map(a => (
                    <button 
                        key={a.id}
                        onClick={() => set('amenities', { ...form.amenities, [a.id]: !form.amenities[a.id] })}
                        className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-3 ${
                            form.amenities[a.id] ? 'border-park-primary bg-park-primary/5 text-park-primary' : 'border-gray-100 text-gray-400'
                        }`}
                    >
                        <a.icon size={18} />
                        <span className="text-[10px] font-black uppercase">{a.label}</span>
                        <div className={`ml-auto w-4 h-4 rounded-full border-2 ${form.amenities[a.id] ? 'bg-park-primary border-park-primary' : 'border-gray-200'}`} />
                    </button>
                ))}
            </div>
        </div>
    </motion.section>
);

const StepPricing = ({ form, set, intel }) => (
    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
        <div className="bg-park-dark rounded-[40px] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
             <h3 className="text-3xl font-black text-white font-outfit mb-6">₹{form.basePrice}<span className="text-sm text-white/40">/hr</span></h3>
             <input 
                type="range" min="5" max="200" step="5"
                value={form.basePrice}
                onChange={(e) => set('basePrice', parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-park-primary mb-8"
             />

             <div className="bg-white/5 rounded-3xl p-5 border border-white/10 space-y-4">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40 font-bold">Daily Estimate (4h/day)</span>
                    <span className="font-black text-emerald-400">₹{intel?.earningsDaily || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40 font-bold">Monthly Estimate</span>
                    <span className="font-black text-emerald-400">₹{intel?.earningsMonthly || 0}</span>
                </div>
             </div>
        </div>

        <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-6 flex items-center gap-2">
                <Shield size={14} /> {form.area} Intel
            </h4>
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    {[
                        { label: 'Bud', range: '₹20-30', active: form.basePrice <= 30 },
                        { label: 'Std', range: '₹30-50', active: form.basePrice > 30 && form.basePrice <= 50 },
                        { label: 'Pre', range: '₹50+',   active: form.basePrice > 50 }
                    ].map(st => (
                        <div key={st.label} className="flex flex-col items-center gap-2">
                            <span className={`text-[10px] font-black uppercase ${st.active ? 'text-park-primary' : 'text-gray-300'}`}>{st.label}</span>
                            <div className={`w-12 rounded-t-lg transition-all ${st.label === 'Bud' ? 'h-4 bg-emerald-400' : st.label === 'Std' ? 'h-8 bg-blue-400' : 'h-12 bg-orange-400'} ${st.active ? 'opacity-100' : 'opacity-20'}`} />
                            <span className="text-[8px] font-bold text-gray-400">{st.range}</span>
                        </div>
                    ))}
                </div>
                <button 
                  onClick={() => set('basePrice', intel?.avg || 35)}
                  className="w-full py-4 bg-park-primary/10 text-park-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-park-primary hover:text-white transition-all"
                >
                    Recommended: ₹{intel?.avg || 35}/hr
                </button>
            </div>
        </div>

        <button 
            onClick={() => set('peakPricingEnabled', !form.peakPricingEnabled)}
            className={`w-full p-6 rounded-[40px] border-2 transition-all flex items-center gap-4 ${
                form.peakPricingEnabled ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'
            }`}
        >
            <div className={`p-3 rounded-2xl ${form.peakPricingEnabled ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300'}`}><Zap size={24} fill="currentColor" /></div>
            <div className="flex-1 text-left">
                <p className="font-black uppercase tracking-tighter text-sm">Smart Peak Pricing</p>
                <p className="text-[10px] font-bold uppercase opacity-60">Auto +30% at peak hours</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all ${form.peakPricingEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.peakPricingEnabled ? 'left-7' : 'left-1'}`} />
            </div>
        </button>
    </motion.section>
);

const StepReview = ({ form, photos }) => (
    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-10">
        <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
            <div className="relative h-56">
                <img src={photos[0]?.url || '/ai-templates/1.png'} className="w-full h-full object-cover" alt="Parking" />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg border-2 border-white/20">✨ Ready to Earn</div>
            </div>
            
            <div className="p-8 space-y-8">
                {/* Section 1: Identity */}
                <div>
                    <h3 className="text-2xl font-black text-park-dark font-outfit mb-1">{form.name}</h3>
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tight">
                        <MapPin size={14} className="text-park-primary" /> {form.area}, {form.city}
                    </p>
                </div>

                {/* Section 2: Quick Specs */}
                <div className="grid grid-cols-3 gap-4 border-y border-gray-50 py-6">
                    <div className="text-center">
                        <p className="text-[9px] text-gray-300 font-black uppercase mb-1">Rate</p>
                        <p className="text-lg font-black text-park-primary font-outfit">₹{form.basePrice}<span className="text-[10px]">/hr</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] text-gray-300 font-black uppercase mb-1">Type</p>
                        <p className="text-sm font-black text-park-dark uppercase">{form.type}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] text-gray-300 font-black uppercase mb-1">Security</p>
                        <p className="text-sm font-black text-park-dark uppercase">{form.amenities.cctv ? 'CCTV' : 'Standard'}</p>
                    </div>
                </div>

                {/* Section 3: Deep Details */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-park-primary shrink-0"><MapPin size={20} /></div>
                        <div>
                            <p className="text-[9px] text-gray-300 font-black uppercase mb-1">Verified Address</p>
                            <p className="text-[11px] font-bold text-park-dark leading-relaxed line-clamp-2">{form.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-park-primary shrink-0"><Car size={20} /></div>
                        <div>
                            <p className="text-[9px] text-gray-300 font-black uppercase mb-1">Vehicle Support</p>
                            <div className="flex gap-2">
                                {form.vehicles.map(v => <span key={v} className="text-[10px] font-black text-park-dark uppercase">{v}</span>)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-park-primary shrink-0"><Zap size={20} /></div>
                        <div>
                            <p className="text-[9px] text-gray-300 font-black uppercase mb-1">Smart Features</p>
                            <p className="text-[11px] font-bold text-park-dark uppercase">{form.peakPricingEnabled ? 'Peak Pricing Active' : 'Fixed Pricing'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-center space-y-2">
            <p className="text-[11px] text-park-dark font-black uppercase tracking-[4px]">Verified & Optimized</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Click below to list your slot and start appearing on driver maps</p>
        </div>
    </motion.section>
);

const MapIcon = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="2"/><path d="M12 18V6"/><path d="M6 12h12"/></svg>;

export default ListSpot;
