import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Navigation } from 'lucide-react';
import apiService from '../services/api';

// Fix default marker icons broken by Webpack/Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green price-tag marker
const createPriceIcon = (price, isSelected) =>
    L.divIcon({
        className: '',
        html: `<div style="
            background:${isSelected ? '#1a3d16' : '#2D5A27'};
            color:white;
            padding:5px 10px;
            border-radius:20px;
            border:2px solid white;
            font-weight:bold;
            font-size:12px;
            box-shadow:0 4px 10px rgba(0,0,0,0.25);
            white-space:nowrap;
            cursor:pointer;
            transform:translate(-50%,-100%);
            position:absolute;
        ">₹${price}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });

// Helper to fly to new center when it changes
function FlyToCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo([center.lat, center.lng], 14, { duration: 1 });
    }, [center, map]);
    return null;
}

const DEMO_SPOTS = [
    { id: 'demo-1', name: 'Kompally Parking Hub', address: 'Kompally Main Road, Hyderabad', lat: 17.535, lng: 78.4836, hourly_rate: 40, rating: 4.8 },
    { id: 'demo-2', name: 'Jubilee Hills Spot', address: 'Road No. 36, Jubilee Hills', lat: 17.4302, lng: 78.4074, hourly_rate: 60, rating: 4.5 },
    { id: 'demo-3', name: 'Hitech City Parking', address: 'Cyber Towers, HITEC City', lat: 17.4474, lng: 78.3762, hourly_rate: 80, rating: 4.9 },
];

const defaultCenter = { lat: 17.4483, lng: 78.3915 };

const MapView = ({ onSpotSelect }) => {
    const [spots, setSpots] = useState([]);
    const [center, setCenter] = useState(defaultCenter);
    const [loading, setLoading] = useState(true);
    const [selectedSpot, setSelectedSpot] = useState(null);

    useEffect(() => {
        const loadSpots = async () => {
            try {
                const { data } = await apiService.getSpots({ lat: center.lat, lng: center.lng });
                const validSpots = (data || []).filter(s => s.lat && s.lng);
                if (validSpots.length > 0) {
                    setSpots(validSpots);
                    setCenter({ lat: validSpots[0].lat, lng: validSpots[0].lng });
                } else {
                    setSpots(DEMO_SPOTS);
                }
            } catch {
                setSpots(DEMO_SPOTS);
            } finally {
                setLoading(false);
            }
        };
        loadSpots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Try to get user's actual location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => {}
            );
        }
    }, []);

    if (loading) {
        return (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-park-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyToCenter center={center} />

                {spots.map((spot) => (
                    <Marker
                        key={spot.id}
                        position={[spot.lat, spot.lng]}
                        icon={createPriceIcon(spot.hourly_rate || spot.price || '–', selectedSpot?.id === spot.id)}
                        eventHandlers={{ click: () => setSelectedSpot(spot) }}
                    >
                        {selectedSpot?.id === spot.id && (
                            <Popup
                                position={[spot.lat, spot.lng]}
                                onClose={() => setSelectedSpot(null)}
                                offset={[0, -8]}
                            >
                                <div className="p-1 min-w-[190px] text-black font-sans">
                                    <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                        <img src={spot.photo_urls?.[0] || spot.image_url} alt="spot" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm text-gray-800">{spot.name}</h3>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-bold">{spot.rating || 'New'}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-3 flex items-center gap-1">
                                        <MapPin size={10} /> {spot.address}
                                    </p>
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                                        <span className="text-green-700 font-bold text-sm">
                                            ₹{spot.hourly_rate || spot.price}
                                            <span className="text-[10px] text-gray-400">/hr</span>
                                        </span>
                                        <button
                                            onClick={() => onSpotSelect(spot)}
                                            className="bg-green-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-md hover:bg-green-800 active:scale-95 transition-all"
                                        >
                                            Reserve Now
                                        </button>
                                    </div>
                                    <div className="mt-2 border-t border-gray-100 pt-2">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-50 text-blue-600 text-[10px] px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"
                                        >
                                            <Navigation size={11} /> Get Directions
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                ))}
            </MapContainer>

            {/* Locate Me button */}
            <button
                onClick={() => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) =>
                            setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                        );
                    }
                }}
                className="absolute right-4 bottom-28 z-[999] bg-white p-3 rounded-2xl shadow-xl text-green-700 hover:bg-gray-50 transition-colors"
                title="My Location"
            >
                <Navigation size={22} />
            </button>
        </div>
    );
};

export default MapView;
