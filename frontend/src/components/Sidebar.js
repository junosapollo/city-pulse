import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function Sidebar({ activeFeature, setActiveFeature, isCollapsed, setIsCollapsed }) {
  const [alerts, setAlerts] = useState({});

  useEffect(() => {
    fetchAPI('/api/command-center').then(data => {
      if (data) {
        setAlerts({
          hardware_health: data.flagged_devices_count > 0,
          offender: data.active_offenders_count > 0,
          pressure_score: data.top_pressure_stations && data.top_pressure_stations.some(s => s.pressure_score > 0.7)
        });
      }
    }).catch(console.error);
  }, []);
  const groups = [
    {
      title: 'Command Center',
      items: [
        { id: 'command_center', label: 'Command Center', icon: '🎯', shortcut: '0' }
      ]
    },
    {
      title: 'Analysis',
      items: [
        { id: 'hotspot', label: 'High-Traffic Areas Map', icon: '📍', shortcut: '1' },
        { id: 'correlation', label: 'Traffic & Parking Issues', icon: '🔗', shortcut: '2' },
        { id: 'enforcement_gap', label: 'Missed Ticketing Spots', icon: '⏳', shortcut: '3' },
        { id: 'pressure_score', label: 'Parking Difficulty Score', icon: '📊', shortcut: '4' }
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'prediction', label: 'Tomorrow\'s Predictions', icon: '🔮', shortcut: '5' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'hardware_health', label: 'Camera Status Check', icon: '🔧', shortcut: '6' },
        { id: 'offender', label: 'Repeat Offenders', icon: '🚘', shortcut: '7' },
        { id: 'junction_gap', label: 'Camera Blind Spots', icon: '🗺️', shortcut: '8' }
      ]
    }
  ];

  return (
    <>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="glass-card sidebar-toggle"
        style={{
          display: 'none', // Shown via CSS media query
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 100,
          padding: '8px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          borderRadius: '8px'
        }}
      >
        ☰
      </button>

      <div className={`glass-card sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ 
        width: '260px', 
        height: '100vh', 
        position: 'sticky', 
        top: 0, 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 0,
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        transition: 'transform 0.3s ease',
        zIndex: 50
      }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏙️</span> CityPulse
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Bengaluru Parking Intelligence</p>
      </div>
      <div className="scrollable-y" style={{ padding: '8px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {groups.map((g, gi) => (
          <div key={g.title} style={{ marginBottom: '8px' }}>
            <div className="sidebar-category">{g.title}</div>
            {g.items.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFeature(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  width: '100%',
                  textAlign: 'left',
                  background: activeFeature === f.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeFeature === f.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: activeFeature === f.id ? 600 : 400,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                className="sidebar-item"
              >
                <span style={{ fontSize: '1.2rem', position: 'relative' }}>
                  {f.icon}
                  {alerts[f.id] && (
                    <div className="pulse-dot" style={{ position: 'absolute', top: '-4px', right: '-4px', width: '6px', height: '6px' }}></div>
                  )}
                </span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  color: 'var(--text-muted)'
                }}>{f.shortcut}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px' }}>
          Flipkart Gridlock 2.0
        </span>
      </div>
    </div>
    </>
  );
}
