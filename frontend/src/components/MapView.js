'use client';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    // Invalidate size after a short delay to allow layout to settle
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

export default function MapView({ center = [12.9716, 77.5946], zoom, style = { height: '100%', width: '100%' }, children }) {
  // Mobile zoom 10, desktop zoom 11
  const defaultZoom = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 11;
  const finalZoom = zoom !== undefined ? zoom : defaultZoom;

  return (
    <MapContainer center={center} zoom={finalZoom} style={style} scrollWheelZoom={false}>
      <MapInvalidator />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      />
      {children}
    </MapContainer>
  );
}
