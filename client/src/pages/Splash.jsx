import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="h-screen w-screen bg-park-primary flex flex-col items-center justify-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <div className="bg-white p-6 rounded-[40px] shadow-2xl mb-6">
                    <img src="/logo.png" alt="ParkSaathi" className="w-24 h-24 object-contain" />
                </div>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold text-white font-outfit tracking-tight"
                >
                    ParkSaathi
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-white/60 text-sm mt-2 font-medium tracking-widest uppercase"
                >
                    Smart Peer-to-Peer Parking
                </motion.p>
            </motion.div>

            <div className="absolute bottom-12 flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 bg-white rounded-full"
                    />
                ))}
            </div>
        </div>
    );
};

export default SplashScreen;
