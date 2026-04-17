import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapComponent = ({ center = [22.3964, 114.1095], routes = [] }) => {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={4} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Render mock routes/events if provided */}
        {routes.map((route, idx) => (
          <React.Fragment key={idx}>
            {route.position && (
              <Marker position={route.position} icon={customMarkerIcon}>
                <Popup className="dark-popup">
                  <div className="font-bold text-on-surface">{route.name}</div>
                  <div className="text-xs text-error font-bold">{route.severity}</div>
                </Popup>
              </Marker>
            )}
            {route.path && <Polyline positions={route.path} color={route.color || "#f97316"} weight={3} dashArray="5, 5" />}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
