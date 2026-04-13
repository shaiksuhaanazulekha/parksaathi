import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Navigation as NavIcon, ShieldCheck } from 'lucide-react';
import apiService from '../services/api';

// Fix Vite/Webpack bundling issue with Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createPriceIcon = (price, selected, isNew) => L.divIcon({
    className: '',
    html: `<div style="
        background: ${selected ? '#1e3a8a' : '#10b981'};
        color: white;
        padding: 5px 11px;
        border-radius: 20px;
        border: 2.5px solid white;
        font-weight: 900;
        font-size: 12px;
        font-family: 'Outfit', sans-serif;
        box-shadow: 0 6px 16px rgba(0,0,0,0.22);
        white-space: nowrap;
        cursor: pointer;
        transform: translate(-50%, -100%);
        position: absolute;
        transition: all 0.2s;
    ">
        ₹${price}
        ${isNew ? '<span style="position: absolute; top: -10px; right: -10px; background: #ef4444; color: white; font-size: 8px; padding: 2px 5px; border-radius: 6px; border: 1.5px solid white; animation: bounce 1s infinite;">NEW</span>' : ''}
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
});

function FlyToCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo([center.lat, center.lng], 14, { animate: true, duration: 1.2 });
    }, [center, map]);
    return null;
}

const DEMO_SPOTS = [
    { id: 'demo-1', name: 'Kompally Parking Hub',   address: 'Kompally Main Road, Hyderabad',     lat: 17.535,  lng: 78.4836, pricePerHour: 40, hourly_rate: 40, rating: 4.8, photos: ['https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=400&auto=format'] },
    { id: 'demo-2', name: 'Jubilee Hills Spot',      address: 'Road No. 36, Jubilee Hills',         lat: 17.4302, lng: 78.4074, pricePerHour: 60, hourly_rate: 60, rating: 4.5, photos: ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&auto=format'] },
    { id: 'demo-3', name: 'HITEC City Parking',      address: 'Cyber Towers, HITEC City',           lat: 17.4474, lng: 78.3762, pricePerHour: 80, hourly_rate: 80, rating: 4.9, photos: ['https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&auto=format'] },
    { id: 'demo-4', name: 'Banjara Hills Garage',    address: 'Road No. 12, Banjara Hills',         lat: 17.4108, lng: 78.4483, pricePerHour: 50, hourly_rate: 50, rating: 4.3, photos: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&auto=format'] },
    { id: 'demo-5', name: 'Ameerpet Metro Parking',  address: 'Ameerpet Metro Station, Hyderabad',  lat: 17.4374, lng: 78.4487, pricePerHour: 30, hourly_rate: 30, rating: 4.2, photos: ['https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=400&auto=format'] },
];

const DEFAULT_CENTER = { lat: 17.4483, lng: 78.3915 };
const FALLBACK_IMG   = 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?w=400&auto=format';

const MapView = ({ spots = [], onSelect }) => {
    const [center, setCenter]         = useState(DEFAULT_CENTER);
    const [selectedSpot, setSelectedSpot] = useState(null);

    // Get user location
    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {}
        );
    }, []);

    const handleSpotSelect = (spot) => {
        if (onSelect) onSelect(spot);
    };

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyToCenter center={center} />

                {spots.map(spot => (
                    <Marker
                        key={`${spot._id}-${spot.pricing?.basePrice || spot.pricePerHour}`}
                        position={[spot.lat, spot.lng]}
                        icon={createPriceIcon(
                            spot.pricing?.basePrice || spot.pricePerHour || spot.hourly_rate || '?',
                            selectedSpot?._id === spot._id,
                            spot._id.startsWith('s17')
                        )}
                        eventHandlers={{ click: () => setSelectedSpot(spot) }}
                    >
                        {(selectedSpot?._id === spot._id) && (
                            <Popup
                                position={[spot.lat, spot.lng]}
                                onClose={() => setSelectedSpot(null)}
                                offset={[0, -6]}
                            >
                                <div className="p-1 min-w-[200px] font-sans">
                                    <div className="w-full h-28 bg-gray-100 rounded-xl overflow-hidden mb-3">
                                        <img
                                            src={spot.photos?.[0] || FALLBACK_IMG}
                                            alt={spot.name}
                                            className="w-full h-full object-cover"
                                            onError={e => { e.target.src = FALLBACK_IMG; }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm text-gray-800 flex-1 pr-2">{spot.name}</h3>
                                        <div className="flex items-center gap-0.5 text-yellow-400 shrink-0">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-bold text-gray-700">{spot.rating || '4.5'}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-3">
                                        <MapPin size={10} className="text-park-primary shrink-0" /> {spot.address}
                                    </p>
                                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleSpotSelect(spot)}
                                            className="w-full bg-park-primary text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-park-primary/20 flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck size={14} /> Book This Spot
                                        </button>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                        >
                                            <NavIcon size={14} fill="white" /> Start Navigation
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                ))}
            </MapContainer>

            {/* Locate me button */}
            <button
                onClick={() => navigator.geolocation?.getCurrentPosition(
                    pos => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => {}
                )}
                className="absolute right-4 bottom-32 z-[500] bg-white p-3.5 rounded-2xl shadow-xl text-park-primary hover:bg-gray-50 transition-colors border border-gray-100"
                title="My Location"
            >
                <NavIcon size={22} />
            </button>
        </div>
    );
};

export default MapView;
