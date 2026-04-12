import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import ListSpot from './pages/ListSpot';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import SplashScreen from './pages/Splash';
import Payment from './pages/Payment';
import NavigationPage from './pages/Navigation';
import Notifications from './pages/Notifications';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, profile, loading } = useAuth();

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-park-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-400">Loading...</p>
            </div>
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = (profile?.role || profile?.user_type || '').toLowerCase();
        const allowed  = allowedRoles.map(r => r.toLowerCase());
        if (!allowed.includes(userRole)) return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppRoutes() {
    const { user, profile } = useAuth();
    const isOwner = (profile?.role || profile?.user_type || '').toLowerCase() === 'owner';

    return (
        <div className="pb-20">
            <Routes>
                <Route path="/"       element={<SplashScreen />} />
                <Route path="/login"  element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        {isOwner ? <OwnerDashboard /> : <Home />}
                    </ProtectedRoute>
                } />

                <Route path="/bookings" element={
                    <ProtectedRoute allowedRoles={['driver']}>
                        <MyBookings />
                    </ProtectedRoute>
                } />

                <Route path="/book/:id" element={
                    <ProtectedRoute allowedRoles={['driver']}>
                        <Booking />
                    </ProtectedRoute>
                } />

                <Route path="/payment" element={
                    <ProtectedRoute allowedRoles={['driver']}>
                        <Payment />
                    </ProtectedRoute>
                } />

                <Route path="/navigation/:id" element={
                    <ProtectedRoute allowedRoles={['driver']}>
                        <NavigationPage />
                    </ProtectedRoute>
                } />

                <Route path="/owner/dashboard" element={
                    <ProtectedRoute allowedRoles={['owner']}>
                        <OwnerDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/owner/list-spot" element={
                    <ProtectedRoute allowedRoles={['owner']}>
                        <ListSpot />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                <Route path="/notifications" element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {user && <Navbar />}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}
