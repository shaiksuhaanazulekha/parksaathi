import { motion } from 'framer-motion';

const ParkSaathiLogo = ({ size = 'md', className = '', showTagline = false }) => {
    const scales = {
        sm: { icon: 'h-6', text: 'text-lg', tagline: 'text-[8px]' },
        md: { icon: 'h-10', text: 'text-2xl', tagline: 'text-[10px]' },
        lg: { icon: 'h-16', text: 'text-4xl', tagline: 'text-xs' },
        xl: { icon: 'h-24', text: 'text-6xl', tagline: 'text-base' }
    };

    const s = scales[size] || scales.md;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="flex items-center gap-3">
                {/* Icon: Bold "P" + handshake dots + location pin */}
                <motion.div 
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className={`${s.icon} aspect-square bg-gradient-to-br from-park-primary to-park-secondary rounded-2xl flex items-center justify-center relative shadow-lg shadow-park-primary/20`}
                >
                    <span className="text-white font-black font-jakarta select-none" style={{ fontSize: '120%' }}>P</span>
                    {/* Handshake dots */}
                    <div className="absolute -bottom-1 -right-1 flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-park-accent border-2 border-park-dark shadow-sm" />
                        <div className="w-2 h-2 rounded-full bg-white border-2 border-park-dark shadow-sm" />
                    </div>
                </motion.div>

                {/* Wordmark */}
                <div className="flex flex-col">
                    <div className={`${s.text} font-jakarta font-extrabold tracking-tighter leading-none flex items-center`}>
                        <span className="text-white">Park</span>
                        <span className="text-park-primary">Saathi</span>
                    </div>
                    {showTagline && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 flex flex-col items-start"
                        >
                            <span className={`${s.tagline} text-park-text-muted font-bold uppercase tracking-[2px]`}>Your Parking Friend</span>
                            <span className={`${s.tagline} text-park-primary font-jakarta font-medium`}>हर जगह, हर बार</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParkSaathiLogo;
