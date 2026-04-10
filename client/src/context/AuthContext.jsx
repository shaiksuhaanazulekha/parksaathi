/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useCallback } from 'react';
import apiService, { getStoredToken, setStoredToken } from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Bootstrap: restore session on refresh ─────────────────────────
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
                    const { data } = await apiService.getProfile();
                    setUser({ uid: data.profile.id, email: data.profile.email });
                    setProfile(data.profile);
                } catch {
                    setStoredToken(null); // token expired / invalid
                }
            }
            setLoading(false);
        };
        restore();
    }, []);

    // ── Login ──────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        // Demo shortcuts
        const DEMOS = {
            'driver@demo.com': { uid: 'demo-driver-id', role: 'Driver', name: 'Rahul (Demo Driver)', phone: '9876543210' },
            'owner@demo.com':  { uid: 'demo-owner-id',  role: 'Owner',  name: 'Priya (Demo Owner)',  phone: '9123456780' },
        };
        if (DEMOS[email] && password === 'demo123') {
            const d = DEMOS[email];
            const demoUser    = { uid: d.uid, email };
            const demoProfile = { id: d.uid, email, fullName: d.name, role: d.role, phone: d.phone };
            setUser(demoUser);
            setProfile(demoProfile);
            localStorage.setItem('demo_session', JSON.stringify({ user: demoUser, profile: demoProfile }));
            return { user: demoUser, profile: demoProfile };
        }

        // Real backend login
        const { data } = await apiService.login(email, password);
        setStoredToken(data.token);
        setUser({ uid: data.profile.id, email: data.profile.email });
        setProfile(data.profile);
        return data;
    }, []);

    // ── Signup ─────────────────────────────────────────────────────────
    const signup = useCallback(async ({ email, password, fullName, role, phone }) => {
        const { data } = await apiService.signup({ email, password, fullName, role, phone });
        setStoredToken(data.token);
        setUser({ uid: data.profile.id, email: data.profile.email });
        setProfile(data.profile);
        return data;
    }, []);

    // ── Sign Out ───────────────────────────────────────────────────────
    const signOut = useCallback(async () => {
        setStoredToken(null);
        localStorage.removeItem('demo_session');
        localStorage.removeItem('parksaathi_session');
        setUser(null);
        setProfile(null);
    }, []);

    // ── Update Profile ─────────────────────────────────────────────────
    const updateProfile = useCallback(async (updates) => {
        const id = user?.uid || profile?.id;
        if (!id) return;
        try {
            const { data } = await apiService.updateProfile(id, updates);
            setProfile(data);
        } catch (err) {
            console.error('Failed to update profile:', err.message);
        }
    }, [user, profile]);

    // ── Refresh profile from server ────────────────────────────────────
    const refreshProfile = useCallback(async () => {
        if (!getStoredToken()) return;
        try {
            const { data } = await apiService.getProfile();
            setProfile(data.profile);
        } catch { /* silent */ }
    }, []);

    return (
        <AuthContext.Provider value={{
            user, profile, loading,
            login, signup, signOut, updateProfile, refreshProfile,
            // Legacy aliases kept for backward-compat with existing pages
            loginWithPhone: () => Promise.resolve(),
            sendOtp:        () => Promise.resolve(),
            verifyOtp:      () => Promise.resolve(),
        }}>
            {children}
        </AuthContext.Provider>
    );
};
