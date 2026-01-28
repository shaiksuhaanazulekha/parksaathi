import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Navigation } from 'lucide-react';
import { MockDB } from '../services/MockDB';

// Custom Marker Icon
const createCustomIcon = (price) => {
    return L.divIcon({
        className: 'custom-map-marker',
        html: `
      <div style="
        background-color: #2D5A27;
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        border: 2px solid white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>₹${price}</span>
      </div>
    `,
        iconSize: [50, 30],
        iconAnchor: [25, 30],
    });
};

// Component to handle map center changes
function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const MapView = ({ onSpotSelect }) => {
    const [spots, setSpots] = useState([]);
    const [center, setCenter] = useState([17.4483, 78.3915]); // Default near Jubilee Hills
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSpots = async () => {
            const data = await MockDB.getSpots({ lat: center[0], lng: center[1] });
            setSpots(data);
            if (data.length > 0) {
                setCenter([data[0].lat, data[0].lng]);
            }
            setLoading(false);
        };
        loadSpots();
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
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Premium light theme
                />
                <ChangeView center={center} zoom={15} />

                {spots.map((spot) => (
                    <Marker
                        key={spot.id}
                        position={[spot.lat, spot.lng]}
                        icon={createCustomIcon(spot.hourly_rate || spot.price)}
                    >
                        <Popup className="premium-popup">
                            <div className="p-2 min-w-[200px]">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-park-dark text-sm">{spot.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <Star className="text-yellow-400 fill-current" size={12} />
                                        <span className="text-xs font-bold">{spot.rating}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 mb-3 flex items-center gap-1">
                                    <MapPin size={10} /> {spot.address}
                                </p>
                                <div className="flex justify-between items-center border-t pt-3">
                                    <span className="text-park-primary font-bold">₹{spot.hourly_rate || spot.price}<span className="text-[10px] text-gray-400">/hr</span></span>
                                    <button
                                        onClick={() => onSpotSelect(spot)}
                                        className="bg-park-primary text-white text-[10px] px-4 py-2 rounded-lg font-bold shadow-lg shadow-park-primary/20 hover:scale-105 active:scale-95 transition-transform"
                                    >
                                        Reserve Now
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Controls */}
            <div className="absolute right-4 bottom-24 z-[1000] flex flex-col gap-2">
                <button className="bg-white p-3 rounded-2xl shadow-xl text-park-primary hover:bg-gray-50 transition-colors">
                    <Navigation size={24} />
                </button>
            </div>
        </div>
    );
};

export default MapView;
