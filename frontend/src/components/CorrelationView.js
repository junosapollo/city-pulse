'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import StatsCard from './StatsCard';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, BarChart, Bar, Legend, Cell } from 'recharts';

export default function CorrelationView() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/correlation').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading Correlation...</div>;

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
        <StatsCard label="Pearson Correlation (r)" value={data.correlation_r.toFixed(3)} color="var(--accent-amber)" />
        <StatsCard label="P-Value" value={data.correlation_p < 0.001 ? '< 0.001' : data.correlation_p.toFixed(3)} color="var(--accent-blue)" />
      </div>

      <ChartWrapper title="Congestion Correlation Engine" subtitle="Violations (X) vs Incidents (Y) normalized. Dots in top-right are highly congested hotspots.">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis type="number" dataKey="violations_norm" name="Violations" tick={{ fill: 'var(--text-muted)' }} />
          <YAxis type="number" dataKey="incidents_norm" name="Incidents" tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <ReferenceLine x={0.5} stroke="var(--border)" strokeDasharray="3 3" />
          <ReferenceLine y={0.5} stroke="var(--border)" strokeDasharray="3 3" />
          <Scatter name="Stations" data={data.stations} fill="var(--accent-blue)">
            {data.stations.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={(entry.violations_norm > 0.5 && entry.incidents_norm > 0.5) ? 'var(--accent-rose)' : 'var(--accent-blue)'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ChartWrapper>

      <ChartWrapper title="Incident Breakdown for Top 5 Incident Hotspots">
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
