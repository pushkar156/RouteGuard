import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle auto-centering when selected shipment changes
const MapEffect = ({ selectedRoute }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedRoute && selectedRoute.coords && selectedRoute.coords.length > 0) {
      const bounds = L.latLngBounds(selectedRoute.coords);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 5 });
    }
  }, [selectedRoute, map]);
  return null;
};

const createRiskIcon = (severity) => {
  const isHigh = severity === 'high' || severity === 'CRITICAL';
  const color = isHigh ? '#ef4444' : '#eab308';
  const bgColor = isHigh ? '#fee2e2' : '#fef08a';
  
  return L.divIcon({
    className: 'custom-risk-icon',
    html: `<div style="background-color: ${bgColor}; border: 2px solid ${color}; border-radius: 50%; width: 20px; height: 20px; ${isHigh ? 'animation: pulse-red 2s infinite; box-shadow: 0 0 10px #ef4444;' : ''}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MultiMapComponent = ({ shipments, riskEvents, selectedShipment, onSelectShipment }) => {
  const selectedRouteInfo = shipments.find(s => s.id === selectedShipment);

  return (
    <MapContainer 
      center={[20, 10]} 
      zoom={2.5} 
      minZoom={2}
      className="w-full h-full z-0 font-body"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
      
      {/* Risk Event Markers */}
      {riskEvents && riskEvents.map(event => (
        <Marker 
          key={event.id} 
          position={[event.lat, event.lng]} 
          icon={createRiskIcon(event.severity)}
        />
      ))}

      {/* Shipment Routes */}
      {shipments && shipments.map(shipment => {
        const isSelected = selectedShipment === shipment.id;
        const color = shipment.riskScore >= 70 ? '#ef4444' : (shipment.riskScore >= 40 ? '#eab308' : '#f97316');
        const weight = isSelected ? 4 : 2;
        const opacity = isSelected ? 1 : 0.6;
        const dashArray = shipment.riskScore >= 70 ? '8, 8' : (shipment.riskScore >= 40 ? '5, 5' : '');

        return (
          <Polyline 
            key={shipment.id}
            positions={shipment.coords} 
            color={color}
            weight={weight}
            opacity={opacity}
            dashArray={dashArray}
            eventHandlers={{
              click: () => onSelectShipment && onSelectShipment(shipment.id)
            }}
            pathOptions={{ cursor: 'pointer' }}
          />
        );
      })}

      <MapEffect selectedRoute={selectedRouteInfo} />
    </MapContainer>
  );
};

export default MultiMapComponent;
