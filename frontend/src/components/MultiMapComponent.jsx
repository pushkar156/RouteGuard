import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
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
        >
          <Popup className="custom-popup">
            <div className="p-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${event.severity === 'high' || event.severity === 'CRITICAL' ? 'bg-error-container text-on-error-container' : 'bg-warning-container text-on-warning-container'}`}>
                  {event.severity} Risk
                </span>
                <span className="text-on-surface-variant text-[10px]">{new Date(event.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface leading-tight mb-1">{event.title}</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2">{event.summary || 'Disruption affecting maritime routes in this polygon.'}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Shipment Routes */}
      {shipments && shipments.map(shipment => {
        const isSelected = selectedShipment === shipment.id;
        const color = shipment.riskScore >= 70 ? '#ef4444' : (shipment.riskScore >= 40 ? '#eab308' : '#f97316');
        const weight = isSelected ? 4 : 2;
        const opacity = isSelected ? 1 : 0.6;
        const dashArray = shipment.riskScore >= 70 ? '8, 8' : (shipment.riskScore >= 40 ? '5, 5' : '');

        return (
          <React.Fragment key={shipment.id}>
            <Polyline 
              positions={shipment.coords} 
              color={color}
              weight={weight}
              opacity={opacity}
              dashArray={dashArray}
              eventHandlers={{
                click: () => onSelectShipment && onSelectShipment(shipment.id)
              }}
              pathOptions={{ cursor: 'pointer' }}
            >
              <Popup>
                <div className="p-1">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mb-0.5">{shipment.id}</div>
                  <h3 className="font-bold text-sm text-on-surface mb-1">{shipment.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${shipment.riskScore}%`, backgroundColor: color }}></div>
                    </div>
                    <span className="text-xs font-bold" style={{ color }}>{Math.round(shipment.riskScore)}% Risk</span>
                  </div>
                </div>
              </Popup>
            </Polyline>
            
            {/* Visual indicator for current location (first coord for demo) */}
            <Marker 
              position={shipment.coords[0]} 
              icon={L.divIcon({
                className: 'ship-pos',
                html: `<div style="width: 12px; height: 12px; background-color: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12]
              })}
            />
          </React.Fragment>
        );
      })}

      <MapEffect selectedRoute={selectedRouteInfo} />
    </MapContainer>
  );
};

export default MultiMapComponent;
