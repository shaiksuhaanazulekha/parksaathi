import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, IndianRupee, Clock, Image as ImageIcon, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const ListSpot = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        rate: '',
        startTime: '08:00',
        endTime: '22:00',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Parking spot listed successfully!');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="px-6 pt-12 pb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-gray-50 rounded-full text-park-dark"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-park-dark font-outfit">List Your Spot</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-6 space-y-6 pb-24">
                <div className="space-y-4">
                    <div className="w-full h-48 bg-park-gray rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="bg-white p-4 rounded-2xl shadow-sm text-park-primary">
                            <ImageIcon size={32} />
                        </div>
                        <p className="text-sm font-bold text-gray-500">Upload Photos</p>
                        <p className="text-[10px] text-gray-400">Add up to 5 photos of your space</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="e.g. Ashok Villa Parking"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
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
                        className="w-full button-primary py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Publish Spot
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4 px-8">
                        By publishing, you agree to ParkSaathi's Host Terms and Guarantee.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ListSpot;
