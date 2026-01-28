import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import AdminPanel from './pages/AdminPanel';




const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(profile?.user_type)) {
    return <Navigate to="/dashboard" />;
  }


  return children;
};

function AppRoutes() {
  const { user, profile } = useAuth();

  return (
    <div className="pb-20"> {/* Margin for bottom bar */}
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {profile?.user_type === 'owner' ? <OwnerDashboard /> : <Home />}
            </ProtectedRoute>
          }
        />


        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book/:id"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <Payment />
            </ProtectedRoute>
          }
        />


        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/list-spot"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <ListSpot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={<AdminPanel />}
        />
      </Routes>

      {user && <Navbar />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
