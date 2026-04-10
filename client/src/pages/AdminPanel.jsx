import { useState } from 'react';
import { Users, MapPin, Calendar, CreditCard, ShieldCheck, ChevronRight, Search } from 'lucide-react';


const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');

    const stats = [
        { label: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-600' },
        { label: 'Active Spots', value: '452', icon: MapPin, color: 'text-green-600' },
        { label: 'Total Bookings', value: '8,421', icon: Calendar, color: 'text-purple-600' },
        { label: 'Revenue', value: '₹4,25,000', icon: CreditCard, color: 'text-orange-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-park-dark p-6 flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl">
                        <img src="/logo.png" alt="logo" className="w-8 h-8" />
                    </div>
                    <span className="text-white font-bold text-xl font-outfit">Admin</span>
                </div>

                <nav className="space-y-2">
                    {['users', 'spots', 'bookings', 'payments', 'settings'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`w-full p-4 rounded-xl text-left font-bold capitalize transition-all ${activeTab === item ? 'bg-park-primary text-white' : 'text-white/40 hover:text-white'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-park-dark font-outfit">System Overview</h1>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <Search size={18} className="text-gray-400" />
                        <input type="text" placeholder="Global Search..." className="outline-none bg-transparent text-sm w-64" />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-10">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className={`p-3 rounded-2xl bg-gray-50 inline-block mb-4`}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-bold text-park-dark font-outfit">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-park-dark font-outfit">Recent {activeTab}</h2>
                        <button className="button-primary py-2 px-6 text-xs">Export CSV</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-gray-400 font-bold uppercase tracking-widest border-b border-gray-50">
                                    <th className="pb-4">Name</th>
                                    <th className="pb-4">Role / Type</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-park-dark">User {i}</p>
                                                    <p className="text-[10px] text-gray-400">user{i}@example.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-bold text-gray-500">{i % 2 === 0 ? 'Owner' : 'Driver'}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="flex items-center gap-2 text-xs font-bold text-green-600">
                                                <ShieldCheck size={14} /> Active
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button className="p-2 text-gray-300 hover:text-park-primary">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
