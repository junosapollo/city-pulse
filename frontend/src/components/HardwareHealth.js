'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import StatsCard from './StatsCard';

export default function HardwareHealth() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAPI('/api/hardware-health').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading Hardware Health...</div>;

  const filtered = data.devices.filter(d => d.device_id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label="Total Devices" value={data.summary.total_devices.toLocaleString()} />
        <StatsCard label="Flagged Devices" value={data.summary.flagged_count.toLocaleString()} color="var(--accent-rose)" />
        <StatsCard label="Avg Rejection Rate" value={`${(data.summary.avg_rejection_rate * 100).toFixed(1)}%`} color="var(--accent-amber)" />
      </div>

      <div className="glass-card" style={{ padding: '16px', fontSize: '0.9rem' }}>
        <strong>Flagging threshold:</strong> devices above {data.thresholds.method} — rejection &gt; {data.thresholds.rejection_pct.toFixed(1)}%, duplicate &gt; {data.thresholds.duplicate_pct.toFixed(1)}%
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '400px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <input 
            type="text" 
            placeholder="Search device ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border)', 
              color: 'var(--text-primary)', 
              padding: '8px 16px', 
              borderRadius: '8px',
              width: '100%',
              maxWidth: '300px',
              outline: 'none'
            }} 
          />
        </div>
        <div className="scrollable-y" style={{ flex: 1 }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
              <tr>
                <th>Device ID</th>
                <th>Total Captures</th>
                <th>Approval %</th>
                <th>Rejection %</th>
                <th>Duplicate %</th>
                <th>Status</th>
                <th>Flag Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const isFlagged = d.flagged;
                return (
                  <tr key={d.device_id} style={{ borderLeft: isFlagged ? '4px solid var(--accent-rose)' : '4px solid transparent' }}>
                    <td style={{ fontFamily: 'monospace' }}>{d.device_id}</td>
                    <td>{d.total.toLocaleString()}</td>
                    <td>{d.total > d.unknown ? ((d.approved / (d.total - d.unknown)) * 100).toFixed(1) + '%' : '-'}</td>
                    <td style={{ color: d.rejection_rate > data.thresholds.rejection_pct / 100 ? 'var(--accent-amber)' : 'inherit' }}>
                      {d.rejection_rate !== null ? (d.rejection_rate * 100).toFixed(1) + '%' : '-'}
                    </td>
                    <td style={{ color: d.duplicate_rate > data.thresholds.duplicate_pct / 100 ? 'var(--accent-amber)' : 'inherit' }}>
                      {d.duplicate_rate !== null ? (d.duplicate_rate * 100).toFixed(1) + '%' : '-'}
                    </td>
                    <td>
                      {isFlagged ? <span style={{ color: 'var(--accent-rose)' }}>🔴 Flagged</span> : <span style={{ color: 'var(--accent-emerald)' }}>🟢 Healthy</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{d.flag_reason || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
