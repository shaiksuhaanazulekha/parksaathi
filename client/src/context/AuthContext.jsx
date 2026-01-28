import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

// Fake Database for Demo
const MOCK_USERS = [
    { id: '1', email: 'driver@example.com', password: 'password', full_name: 'Rahul Driver', user_type: 'driver', phone: '9876543210' },
    { id: '2', email: 'owner@example.com', password: 'password', full_name: 'Amit Owner', user_type: 'owner', phone: '9123456789' }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persistent session simulation
        const savedUser = localStorage.getItem('parksaathi_session');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setProfile(parsed);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
                if (foundUser) {
                    setUser(foundUser);
                    setProfile(foundUser);
                    localStorage.setItem('parksaathi_session', JSON.stringify(foundUser));
                    resolve(foundUser);
                } else {
                    // Allow dynamic login for any new user in "Fake Auth" mode
                    const newUser = { id: Date.now().toString(), email, full_name: email.split('@')[0], user_type: 'driver' };
                    setUser(newUser);
                    setProfile(newUser);
                    localStorage.setItem('parksaathi_session', JSON.stringify(newUser));
                    resolve(newUser);
                }
                setLoading(false);
            }, 1000);
        });
    };

    const signup = async (data) => {
        setLoading(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser = { ...data, id: Date.now().toString() };
                setUser(newUser);
                setProfile(newUser);
                localStorage.setItem('parksaathi_session', JSON.stringify(newUser));
                setLoading(false);
                resolve(newUser);
            }, 1500);
        });
    };

    const signOut = () => {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('parksaathi_session');
    };

    const updateProfile = async (updates) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        setUser(newProfile);
        localStorage.setItem('parksaathi_session', JSON.stringify(newProfile));
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, signup, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
