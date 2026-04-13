import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import LocationPicker from './pages/LocationPicker';
import AreaPicker from './pages/AreaPicker';
import Booking from './pages/Booking';
import ListSpot from './pages/ListSpotWizard';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import Notifications from './pages/Notifications';
import Payment from './pages/Payment';
import ManageSlots from './pages/ManageSlots';
import AllSpaces from './pages/AllSpaces';

// Components
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, role }) => {
    const { user, profile, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (role && (profile?.role || profile?.user_type || '').toLowerCase() !== role.toLowerCase()) {
        return <Navigate to="/profile" replace />;
    }
    return children;
};

const AppRoutes = () => {
    const { user, profile } = useAuth();
    const isOwner = (profile?.role || profile?.user_type || '').toLowerCase() === 'owner';

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-20">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    <Route path="/location-picker" element={<ProtectedRoute><LocationPicker /></ProtectedRoute>} />
                    <Route path="/area-picker" element={<ProtectedRoute><AreaPicker /></ProtectedRoute>} />
                    
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            {isOwner ? <OwnerDashboard /> : <Home />}
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                    <Route path="/owner/list-spot" element={<ProtectedRoute role="Owner"><ListSpot /></ProtectedRoute>} />
                    <Route path="/owner/all-spaces" element={<ProtectedRoute role="Owner"><AllSpaces /></ProtectedRoute>} />
                    <Route path="/owner/manage-slots/:id" element={<ProtectedRoute role="Owner"><ManageSlots /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                </Routes>
            </main>
            {user && <Navbar />}
        </div>
    );
};

import { SocketProvider } from './context/SocketContext';

export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}
