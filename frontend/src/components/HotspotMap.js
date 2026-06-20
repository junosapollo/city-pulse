'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchAPI } from '@/lib/api';
import { CircleMarker, Tooltip } from 'react-leaflet';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function HotspotMap() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('station');

  useEffect(() => {
    fetchAPI('/api/hotspot').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading Hotspot Map...</div>;

  const maxCount = Math.max(...data.stations.map(s => s.count));

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', padding: '24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Spatial Hotspot Heatmap</h2>
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setView('station')}
              style={{ padding: '8px 16px', background: view === 'station' ? 'var(--accent-blue)' : 'transparent', color: view === 'station' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
            >
              Station View
            </button>
            <button 
              onClick={() => setView('heatmap')}
              style={{ padding: '8px 16px', background: view === 'heatmap' ? 'var(--accent-amber)' : 'transparent', color: view === 'heatmap' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
            >
              Heatmap View
            </button>
          </div>
        </div>
        <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <MapView>
            {view === 'station' && data.stations.map(s => {
              const radius = Math.sqrt(s.count / maxCount) * 25 + 5;
              const intensity = s.count / maxCount;
              const r = Math.round(59 + intensity * (244 - 59));
              const g = Math.round(130 - intensity * (130 - 63));
              const b = Math.round(246 - intensity * (246 - 94));
              
              return (
                <CircleMarker 
                  key={s.name} 
                  center={[s.lat, s.lng]} 
                  radius={radius}
                  pathOptions={{ fillColor: `rgb(${r},${g},${b})`, fillOpacity: 0.7, color: '#fff', weight: 1 }}
                >
                  <Tooltip>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: '1.1rem' }}>{s.name}</strong>
                      <span>Count: {s.count.toLocaleString()}</span><br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top: {s.top_violation}</span>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
            {view === 'heatmap' && data.heatmap_points.map((p, i) => (
              <CircleMarker 
                key={i} 
                center={[p.lat, p.lng]} 
                radius={3}
                pathOptions={{ fillColor: 'var(--accent-amber)', fillOpacity: 0.15, stroke: false }}
              />
            ))}
          </MapView>
        </div>
      </div>
      <div className="glass-card scrollable-y" style={{ width: '320px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Top Hotspots</h3>
        {data.stations.slice(0, 10).map((s, i) => (
          <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>{i + 1}. {s.name}</span>
              <span style={{ fontWeight: 600 }}>{s.count.toLocaleString()}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(s.count / maxCount) * 100}%`, background: 'var(--accent-blue)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
