import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user?.uid && !profile?.id) return;
        
        const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const newSocket = io(apiUrl);
        
        newSocket.on('connect', () => {
            newSocket.emit('join', user?.uid || profile?.id);
        });

        setSocket(newSocket);
        
        return () => newSocket.close();
    }, [user, profile]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
