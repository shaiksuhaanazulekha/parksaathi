/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useCallback } from 'react';
import apiService, { getStoredToken, setStoredToken } from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restore = async () => {
            // 1. Demo session
            const demoRaw = localStorage.getItem('demo_session');
            if (demoRaw) {
                try {
                    const s = JSON.parse(demoRaw);
                    setUser(s.user);
                    setProfile(s.profile);
                    setLoading(false);
                    return;
                } catch { localStorage.removeItem('demo_session'); }
            }

            // 2. Real JWT
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const { data } = await apiService.getMe();
                    const p = data.profile;
                    setUser({ uid: p.id, email: p.email });
                    setProfile(p);
            } catch (err) {
                console.error('Session restoration failed:', err);
                setStoredToken(null);
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    const login = useCallback(async (email, password) => {
        // Demo bypass (works offline)
        const DEMOS = {
            'driver@demo.com': { uid: 'demo-driver-001', role: 'Driver', name: 'Rahul (Demo Driver)', phone: '9876543210' },
            'owner@demo.com':  { uid: 'demo-owner-001',  role: 'Owner',  name: 'Priya (Demo Owner)',  phone: '9123456780' },
        };
        if (DEMOS[email] && password === 'demo123') {
            const d = DEMOS[email];
            const demoUser    = { uid: d.uid, email };
            const demoProfile = {
                id: d.uid, email, name: d.name,
                fullName: d.name, role: d.role,
                user_type: d.role.toLowerCase(),
                phone: d.phone, profilePhoto: '',
            };
            setUser(demoUser);
            setProfile(demoProfile);
            localStorage.setItem('demo_session', JSON.stringify({ user: demoUser, profile: demoProfile }));
            return { user: demoUser, profile: demoProfile };
        }

        const { data } = await apiService.login(email, password);
        setStoredToken(data.token);
        const p = data.profile;
        setUser({ uid: p.id, email: p.email });
        setProfile(p);
        return data;
    }, []);

    const signup = useCallback(async (payload) => {
        const { data } = await apiService.signup(payload);
        setStoredToken(data.token);
        const p = data.profile;
        setUser({ uid: p.id, email: p.email });
        setProfile(p);
        return data;
    }, []);

    const signOut = useCallback(() => {
        setStoredToken(null);
        localStorage.removeItem('demo_session');
        localStorage.removeItem('parksaathi_session');
        setUser(null);
        setProfile(null);
    }, []);

    const updateProfile = useCallback(async (updates) => {
        const id = user?.uid || profile?.id;
        if (!id) return;

        // For demo users, update locally
        const isDemo = id === 'demo-driver-001' || id === 'demo-owner-001';
        const updated = { ...profile, ...updates };
        setProfile(updated);

        if (!isDemo) {
            try {
                const { data } = await apiService.updateProfile(updates);
                setProfile(data); // data is the updated user object
            } catch (err) {
                console.error('Profile update failed:', err.message);
            }
        }
    }, [user, profile]);

    // Effect to listen for 401 errors from API interceptor
    useEffect(() => {
        const check = setInterval(() => {
            const token = getStoredToken();
            if (!token && (user || profile)) {
                signOut();
            }
        }, 5000);
        return () => clearInterval(check);
    }, [user, profile, signOut]);

    const refreshProfile = useCallback(async () => {
        if (!getStoredToken()) return;

        const demo = localStorage.getItem('demo_session');
        if (demo) return;

        try {
            const { data } = await apiService.getMe();
            setProfile(data.profile);
        } catch { /* silent */ }
    }, []);

    return (
        <AuthContext.Provider value={{
            user, profile, loading,
            login, signup, signOut, updateProfile, refreshProfile,
            // No-op legacy aliases
            loginWithPhone: () => Promise.resolve(),
            sendOtp:        () => Promise.resolve(),
            verifyOtp:      () => Promise.resolve(),
        }}>
            {children}
        </AuthContext.Provider>
    );
};
