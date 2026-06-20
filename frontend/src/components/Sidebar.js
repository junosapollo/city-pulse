export default function Sidebar({ activeFeature, setActiveFeature }) {
  const features = [
    { id: 'hotspot', label: 'Spatial Hotspot Heatmap', icon: '📍' },
    { id: 'correlation', label: 'Congestion Correlation', icon: '🔗' },
    { id: 'enforcement_gap', label: 'Enforcement Gap Analysis', icon: '⏳' },
    { id: 'pressure_score', label: 'Parking Pressure Score', icon: '📊' },
    { id: 'prediction', label: 'Predictive Hotspot Forecast', icon: '🔮' },
    { id: 'hardware_health', label: 'Hardware Health Monitor', icon: '🔧' },
    { id: 'offender', label: 'Chronic Offender Tracker', icon: '🚘' },
    { id: 'junction_gap', label: 'Junction Coverage Gap', icon: '🗺️' }
  ];

  return (
    <div className="glass-card" style={{ 
      width: '260px', 
      height: '100vh', 
      position: 'sticky', 
      top: 0, 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 0,
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: 'none'
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏙️</span> CityPulse
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Bengaluru Parking Intelligence</p>
      </div>
      <div className="scrollable-y" style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {features.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFeature(f.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              textAlign: 'left',
              background: activeFeature === f.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeFeature === f.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeFeature === f.id ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px' }}>
          Flipkart Gridlock 2.0
        </span>
      </div>
    </div>
  );
}
