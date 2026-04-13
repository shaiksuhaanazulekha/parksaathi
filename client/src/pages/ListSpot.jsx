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
                        <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${i <= step ? 'bg-park-primary w-8' : 'bg-gray-100'}`} />
                    ))}
                </div>
            </div>

            <div className="px-5 pt-10">
                <AnimatePresence mode="wait">
                    {step === 0 && <StepLocation key={0} form={form} set={set} />}
                    {step === 1 && <StepDetails key={1} form={form} set={set} />}
                    {step === 2 && (
                        <motion.section key={2} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <DirectUploader photos={photos} setPhotos={setPhotos} />
                        </motion.section>
                    )}
                    {step === 3 && <StepPricing key={3} form={form} set={set} intel={pricingIntel} />}
                    {step === 4 && <StepReview key={4} form={form} photos={photos} />}
                </AnimatePresence>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[110] flex gap-3">
                <button 
                  onClick={handleNext} 
                  disabled={loading || (step === 2 && photos.length < 2)}
                  className="button-primary flex-1 py-4 flex items-center justify-center gap-2 shadow-2xl shadow-park-primary/20"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : step === 4 ? <Send size={20} /> : <Sparkles size={18} />}
                    {loading ? 'Publishing...' : step === 4 ? 'Publish Listing' : 'Continue'}
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

const StepLocation = ({ form, set }) => (
    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
        <div className="relative h-64 rounded-[32px] overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center">
             <MapIcon size={40} className="text-gray-300 animate-bounce" />
             <p className="absolute bottom-4 bg-park-dark text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Pin Location Confirmed</p>
        </div>
        <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Full Address</label>
                <textarea 
                    className="input-field h-32 pt-4 resize-none" 
                    placeholder="Enter your property address..."
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="input-field py-4 px-4 flex items-center gap-3">
                    <Building2 size={18} className="text-park-primary" />
                    <span className="font-bold text-park-dark">{form.city}</span>
                </div>
                <div className="input-field py-4 px-4 flex items-center gap-3">
                    <MapPin size={18} className="text-park-primary" />
                    <span className="font-bold text-park-dark">{form.area}</span>
                </div>
             </div>
        </div>
    </motion.section>
);

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
        <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="relative h-56">
                <img src={photos[0]?.url} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-xl text-xs font-black text-park-dark shadow-lg">⭐ New Listing</div>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-black text-park-dark font-outfit">{form.name}</h3>
                        <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-1 uppercase tracking-tight">
                            <MapPin size={12} className="text-park-primary" /> {form.area}, {form.city}
                        </p>
                    </div>
                    <p className="text-2xl font-black text-park-primary font-outfit">₹{form.basePrice}<span className="text-xs text-gray-400">/hr</span></p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                    {form.vehicles.map(v => <span key={v} className="px-3 py-1 bg-park-gray rounded-lg text-[10px] font-black uppercase text-park-primary">{v}</span>)}
                    {form.amenities.covered && <span className="px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-black uppercase text-emerald-600">Covered</span>}
                    {form.amenities.cctv && <span className="px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-black uppercase text-blue-600">CCTV</span>}
                </div>
                <div className="h-24 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 font-bold text-xs border-2 border-dashed border-gray-100">
                    Map Preview Location Confirmed
                </div>
            </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[3px]">Everything looks perfect! 🚀</p>
    </motion.section>
);

const MapIcon = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="2"/><path d="M12 18V6"/><path d="M6 12h12"/></svg>;

export default ListSpot;
