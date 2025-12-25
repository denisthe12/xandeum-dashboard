// src/components/map/MapClient.tsx
"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'; // Используем Marker вместо CircleMarker
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CityNodesModal } from './CityNodesModal';

interface MapProps {
  data: {
    city: string;
    country: string;
    count: number;
    lat: number;
    lng: number;
  }[];
}

const bounds = new L.LatLngBounds([-85, -180], [85, 180]);

// Функция для создания неоновой иконки разного размера
const createNeonIcon = (count: number) => {
  // Размер зависит от кол-ва нод, но не слишком большой
  const size = Math.min(Math.max(20, Math.log(count) * 8 + 10), 50);
  
  return L.divIcon({
    className: 'neon-marker',
    iconSize: [size, size],
    // Важно: якорь должен быть ровно половина размера
    iconAnchor: [size / 2, size / 2], 
    html: ''
  });
};

export default function MapClient({ data }: MapProps) {
  const [selectedLocation, setSelectedLocation] = useState<{city: string, country: string} | null>(null);

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={[25, 10]} // Чуть сместили центр, чтобы Европа была виднее
        zoom={1.5} // Отдалили
        minZoom={1.5} 
        maxBounds={bounds} 
        maxBoundsViscosity={1.0} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
      >
        {/* Более темная и контрастная карта (CartoDB Dark Matter No Labels) */}
        <TileLayer
          noWrap={true}
          attribution='&copy; CARTO'
          // Вернули dark_all (с названиями)
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {data.map((city, idx) => (
          <Marker
            key={idx}
            position={[city.lat, city.lng]}
            icon={createNeonIcon(city.count)}
            eventHandlers={{
              click: () => {
                setSelectedLocation({ city: city.city, country: city.country });
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
              <div className="text-center cursor-pointer p-1">
                <div className="font-bold text-slate-900">{city.city}</div>
                <div className="text-blue-600 font-bold">{city.count} Nodes</div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <CityNodesModal 
        isOpen={!!selectedLocation}
        city={selectedLocation?.city || ''}
        country={selectedLocation?.country || ''}
        onClose={() => setSelectedLocation(null)}
      />
    </div>
  );
}