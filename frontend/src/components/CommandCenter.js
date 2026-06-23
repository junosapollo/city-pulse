'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { SkeletonCard } from './LoadingSkeleton';
import ErrorState from './ErrorState';
import StatsCard from './StatsCard';
import { Camera, Car, MapPin, Clock, AlertCircle, AlertTriangle, Crosshair, TrendingUp, ArrowRight } from 'lucide-react';

export default function CommandCenter({ setActiveFeature }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const loadData = () => {
    setError(null);
    fetchAPI('/api/command-center')
      .then(setData)
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) return <ErrorState message={error} onRetry={loadData} />;
  
  if (!data) {
    return (
      <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="kpi-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const syncDate = new Date(data.last_updated);
  const timeString = syncDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Operational Snapshot Row */}
      <div className="kpi-grid">
        <StatsCard 
          label="Flagged Cameras" 
          value={data.flagged_devices_count} 
          icon={<Camera size={16} />} 
          color="var(--rose)" 
        />
        <StatsCard 
          label="Repeat Offenders" 
          value={data.active_offenders_count} 
          icon={<Car size={16} />} 
          color="var(--amber)" 
        />
        <StatsCard 
          label="Top Pressure Area" 
          value={data.top_pressure_stations?.[0]?.name || 'N/A'} 
          icon={<MapPin size={16} />} 
          color="var(--violet)" 
        />
        <StatsCard 
          label="Latest Sync" 
          value={timeString} 
          icon={<Clock size={16} />} 
          color="var(--green)" 
        />
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Action Items</h3>
      <div className="card-grid">
        {data.flagged_devices_count > 0 && (
          <div className="surface-card action-card" onClick={() => setActiveFeature('hardware_health')}>
            <div className="action-header">
              <div className="icon-circle rose"><AlertCircle size={20} /></div>
              <span className="badge badge-rose">Urgent</span>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '12px 0 4px', color: 'var(--text)' }}>Camera Maintenance</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>{data.flagged_devices_count} cameras need image-quality review.</p>
            <div className="action-link">View details <ArrowRight size={14} /></div>
          </div>
        )}

        {data.active_offenders_count > 0 && (
          <div className="surface-card action-card" onClick={() => setActiveFeature('offender')}>
            <div className="action-header">
              <div className="icon-circle amber"><AlertTriangle size={20} /></div>
              <span className="badge badge-amber">Warning</span>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '12px 0 4px', color: 'var(--text)' }}>Repeat Violators</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>{data.active_offenders_count.toLocaleString()} vehicles caught 5+ times.</p>
            <div className="action-link">Track offenders <ArrowRight size={14} /></div>
          </div>
        )}

        <div className="surface-card action-card" onClick={() => setActiveFeature('pressure_score')}>
          <div className="action-header">
            <div className="icon-circle violet"><Crosshair size={20} /></div>
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '12px 0 4px', color: 'var(--text)' }}>High Parking Difficulty</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>{data.top_pressure_stations.filter(s => s.score > 0.7).length} areas experiencing high pressure.</p>
          <div className="action-link">View heatmap <ArrowRight size={14} /></div>
        </div>

        <div className="surface-card action-card" onClick={() => setActiveFeature('prediction')}>
          <div className="action-header">
            <div className="icon-circle blue"><TrendingUp size={20} /></div>
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '12px 0 4px', color: 'var(--text)' }}>Predicted Hotspots</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>{data.predicted_hotspots.filter(h => h.predicted_violations > 1000).length} areas expected to peak tomorrow.</p>
          <div className="action-link">View forecast <ArrowRight size={14} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Most Difficult Parking Areas</h3>
          </div>
          <div className="mobile-card-list" style={{ padding: '0', gap: 0 }}>
            {data.top_pressure_stations.slice(0, 5).map(s => (
              <div 
                key={s.name} 
                className="summary-row" 
                onClick={() => setActiveFeature('pressure_score')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{s.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: s.score > 0.8 ? 'var(--rose)' : 'var(--amber)' }}>{s.score.toFixed(2)}</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${s.score * 100}%`, background: s.score > 0.8 ? 'var(--rose)' : 'var(--amber)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Uneven Ticketing Alerts</h3>
          </div>
          <div className="mobile-card-list" style={{ padding: '0', gap: 0 }}>
            {data.enforcement_alerts.slice(0, 5).map(s => (
              <div 
                key={s.name} 
                className="summary-row" 
                onClick={() => setActiveFeature('enforcement_gap')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{s.name}</span>
                  <span className="badge badge-amber">Score: {s.divergence_score.toFixed(2)}</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${s.divergence_score * 100}%`, background: 'var(--amber)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .action-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .action-card p,
        .action-card h4 {
          overflow-wrap: break-word;
        }
        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-circle.rose { background: #fff1f2; color: var(--rose); }
        .icon-circle.amber { background: #fffbeb; color: var(--amber); }
        .icon-circle.blue { background: var(--surface-tint); color: var(--blue); }
        .icon-circle.violet { background: #f3e8ff; color: var(--violet); }
        
        .action-link {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--blue);
        }

        .summary-row {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .summary-row:last-child {
          border-bottom: none;
        }
        .summary-row:hover {
          background: var(--surface-soft);
        }
        .progress-bg {
          width: 100%;
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
