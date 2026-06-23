'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchAPI } from '@/lib/api';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { Map, List } from 'lucide-react';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function HotspotMap() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('station');
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchAPI('/api/hotspot').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ height: '100%' }}><div className="skeleton skeleton-map"></div></div>;

  const maxCount = Math.max(...data.stations.map(s => s.count));

  return (
    <div className="hotspot-layout">
      <div className="map-area">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setView('station')}
              style={{ padding: '6px 12px', fontSize: '13px', background: view === 'station' ? 'var(--surface-tint)' : 'transparent', color: view === 'station' ? 'var(--blue)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: view === 'station' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Map size={14} /> Station View
            </button>
            <button 
              onClick={() => setView('heatmap')}
              style={{ padding: '6px 12px', fontSize: '13px', background: view === 'heatmap' ? '#fffbeb' : 'transparent', color: view === 'heatmap' ? 'var(--amber)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: view === 'heatmap' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <List size={14} /> Heatmap View
            </button>
          </div>
        </div>
        <div className="map-container surface-card no-hover" style={{ padding: 0, overflow: 'hidden' }}>
          <MapView>
            {view === 'station' && data.stations.map(s => {
              const radius = Math.sqrt(s.count / maxCount) * 25 + 5;
              const intensity = s.count / maxCount;
              // Soften intensity for bright map
              const r = Math.round(14 + intensity * (225 - 14));
              const g = Math.round(165 - intensity * (165 - 0));
              const b = Math.round(233 - intensity * (233 - 0));
              
              return (
                <CircleMarker 
                  key={s.name} 
                  center={[s.lat, s.lng]} 
                  radius={radius}
                  pathOptions={{ 
                    fillColor: selectedStation?.name === s.name ? 'var(--rose)' : `rgba(${r},${g},${b}, 0.5)`, 
                    fillOpacity: selectedStation?.name === s.name ? 0.8 : 0.5, 
                    color: selectedStation?.name === s.name ? 'var(--rose)' : `rgba(${r},${g},${b}, 0.8)`, 
                    weight: selectedStation?.name === s.name ? 2 : 1 
                  }}
                  eventHandlers={{
                    click: () => setSelectedStation(s)
                  }}
                >
                  <Tooltip>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: '14px' }}>{s.name}</strong>
                      <span>Count: {s.count.toLocaleString()}</span><br />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top: {s.top_violation}</span>
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
                pathOptions={{ fillColor: 'var(--amber)', fillOpacity: 0.3, stroke: false }}
              />
            ))}
          </MapView>
        </div>
      </div>
      
      <div className="ranking-area surface-card scrollable-y">
        {selectedStation ? (
          <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--rose)', marginBottom: '8px' }}>{selectedStation.name}</h3>
              <button onClick={() => setSelectedStation(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Violations:</span>
                <strong className="tabular-nums">{selectedStation.count.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Top Violation:</span>
                <span style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedStation.top_violation}</span>
              </div>
            </div>
          </div>
        ) : null}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Top High-Traffic Areas</h3>
          {data.stations.slice(0, 10).map((s, i) => (
            <div 
              key={s.name} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                background: selectedStation?.name === s.name ? 'var(--surface-soft)' : 'transparent',
                border: selectedStation?.name === s.name ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.2s',
                maxWidth: '100%',
                minWidth: 0
              }}
              onClick={() => setSelectedStation(s)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', gap: '8px' }}>
                <span style={{ color: selectedStation?.name === s.name ? 'var(--rose)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i + 1}. {s.name}</span>
                <span style={{ fontWeight: 600, flexShrink: 0 }} className="tabular-nums">{s.count.toLocaleString()}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
                <div style={{ height: '100%', width: `${(s.count / maxCount) * 100}%`, background: selectedStation?.name === s.name ? 'var(--rose)' : 'var(--blue)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hotspot-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 24px;
          height: 100%;
        }

        .map-area {
          display: flex;
          flex-direction: column;
        }

        .map-container {
          flex: 1;
          min-height: 620px;
        }

        .ranking-area {
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        @media (max-width: 1024px) {
          .hotspot-layout {
            grid-template-columns: 1fr;
          }
          .map-container {
            min-height: 520px;
          }
        }

        @media (max-width: 768px) {
          .map-container {
            min-height: 420px;
          }
        }
      `}</style>
    </div>
  );
}
