'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import StatsCard from './StatsCard';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, BarChart, Bar, Legend, Cell, LabelList } from 'recharts';
import { SkeletonChart } from './LoadingSkeleton';
export default function CorrelationView() {
  const [data, setData] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchAPI('/api/correlation').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px', height: '100%' }}><SkeletonChart /></div>;

  const topStations = [...data.stations].sort((a, b) => b.incidents_raw - a.incidents_raw).slice(0, 5);
  
  const barData = topStations.map(s => ({
    name: s.name,
    ...s.incident_breakdown
  }));
  
  const causeKeys = Array.from(new Set(topStations.flatMap(s => Object.keys(s.incident_breakdown))));
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="glass-card" style={{ padding: '12px' }}>
          <strong>{d.name}</strong><br/>
          Violations: {d.violations_raw}<br/>
          Incidents: {d.incidents_raw}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label="Link Strength" value={data.correlation_r.toFixed(3)} color="var(--accent-amber)" />
        <StatsCard label="Data Reliability" value={data.correlation_p < 0.001 ? '< 0.001' : data.correlation_p.toFixed(3)} color="var(--accent-blue)" />
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '400px' }}>
          <ChartWrapper title="Traffic & Parking Issues" subtitle="Fines vs Incidents. Click a dot for details.">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" dataKey="violations_norm" name="Violations" tick={{ fill: 'var(--text-muted)' }} domain={['auto', 'auto']} />
              <YAxis type="number" dataKey="incidents_norm" name="Incidents" tick={{ fill: 'var(--text-muted)' }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <ReferenceLine x={0.5} stroke="var(--border)" strokeDasharray="3 3" />
              <ReferenceLine y={0.5} stroke="var(--border)" strokeDasharray="3 3" />
              <Scatter 
                name="Stations" 
                data={data.stations} 
                fill="var(--accent-blue)"
                onClick={(e) => setSelectedStation(e && e.payload ? e.payload : e)}
                style={{ cursor: 'pointer' }}
              >
                {data.stations.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedStation?.name === entry.name ? 'var(--accent-amber)' : ((entry.violations_norm > 0.5 && entry.incidents_norm > 0.5) ? 'var(--accent-rose)' : 'var(--accent-blue)')} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartWrapper>
        </div>
        
        {selectedStation && (
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="glass-card animate-enter" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-amber)' }}>{selectedStation.name}</h3>
                <button onClick={() => setSelectedStation(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Violations (Raw):</span>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedStation.violations_raw.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Incidents (Raw):</span>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedStation.incidents_raw.toLocaleString()}</strong>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Incident Breakdown</h4>
                  {Object.entries(selectedStation.incident_breakdown || {}).map(([cause, count]) => (
                    <div key={cause} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span>{cause}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChartWrapper title="Incident Details for Top 5 Areas">
        <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} />
          <YAxis tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
          <Legend />
          {causeKeys.map((k, i) => (
            <Bar key={k} dataKey={k} stackId="a" fill={colors[i % colors.length]} />
          ))}
        </BarChart>
      </ChartWrapper>
    </div>
  );
}
