'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import StatsCard from './StatsCard';
import { SkeletonCard } from './LoadingSkeleton';

export default function CommandCenter({ setActiveFeature }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/command-center').then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="kpi-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const activeAlerts = [];
  if (data.flagged_devices_count > 0) activeAlerts.push('hardware');
  if (data.active_offenders_count > 50) activeAlerts.push('offender');
  if (data.top_pressure_stations.some(s => s.score > 0.8)) activeAlerts.push('pressure');

  const formattedDate = new Date(data.last_updated).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🎯</span> Command Center
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>System health and critical operational alerts</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last Data Sync</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
            <div className="pulse-dot" style={{ background: 'var(--accent-emerald)' }}></div>
            {formattedDate}
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="glass-card alert-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveFeature('hardware_health')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Hardware Health</div>
            {data.flagged_devices_count > 0 && <div className="pulse-dot"></div>}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '12px 0 4px', color: 'var(--text-primary)' }}>
            {data.flagged_devices_count}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Flagged cameras require attention</div>
        </div>

        <div className="glass-card alert-card warning" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveFeature('offender')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Chronic Offenders</div>
            {data.active_offenders_count > 0 && <div className="pulse-dot" style={{ background: 'var(--accent-amber)' }}></div>}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '12px 0 4px', color: 'var(--text-primary)' }}>
            {data.active_offenders_count.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vehicles with 5+ violations</div>
        </div>

        <div className="glass-card alert-card warning" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveFeature('pressure_score')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Critical Pressure</div>
            {data.top_pressure_stations.length > 0 && <div className="pulse-dot" style={{ background: 'var(--accent-amber)' }}></div>}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '12px 0 4px', color: 'var(--text-primary)' }}>
            {data.top_pressure_stations.filter(s => s.score > 0.7).length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stations with score &gt; 0.70</div>
        </div>

        <div className="glass-card alert-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveFeature('prediction')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Tomorrow's Forecast</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '12px 0 4px', color: 'var(--text-primary)' }}>
            {data.predicted_hotspots.filter(h => h.predicted_violations > 1000).length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stations predicted &gt; 1k violations</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Top Pressure Stations</h3>
          <table style={{ margin: 0 }}>
            <tbody>
              {data.top_pressure_stations.slice(0, 5).map(s => (
                <tr key={s.name} style={{ cursor: 'pointer' }} onClick={() => setActiveFeature('pressure_score')}>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.name}</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right', fontWeight: 600, color: s.score > 0.8 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                    {s.score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Enforcement Divergence Alerts</h3>
          <table style={{ margin: 0 }}>
            <tbody>
              {data.enforcement_alerts.slice(0, 5).map(s => (
                <tr key={s.name} style={{ cursor: 'pointer' }} onClick={() => setActiveFeature('enforcement_gap')}>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.name}</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
                    <span className="badge badge-amber">JS: {s.divergence_score.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
