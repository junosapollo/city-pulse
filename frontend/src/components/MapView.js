'use client';
import { MapContainer, TileLayer } from 'react-leaflet';

export default function MapView({ center = [12.9716, 77.5946], zoom = 11, style = { height: '500px', width: '100%' }, children }) {
  return (
    <MapContainer center={center} zoom={zoom} style={style}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      />
      {children}
    </MapContainer>
  );
}
