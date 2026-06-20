'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import StatsCard from './StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function PressureScore() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/pressure-score').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading Pressure Score...</div>;

  const chartData = data.stations.map(s => {
    const max_d = Math.max(...data.stations.map(x => x.device_count));
    const d_norm = s.device_count / (max_d || 1);
    const d_gap = 1 - d_norm;

    return {
      name: s.name,
      'Violation Volume (40%)': s.violations_norm * 0.4,
      'Repeat Offenders (20%)': s.repeat_offender_ratio * 0.2,
      'Timing Divergence (20%)': s.timing_divergence * 0.2,
      'Device Gaps (20%)': d_gap * 0.2,
      total: s.score
    };
  });

  const bestStation = data.stations[data.stations.length - 1];
  const worstStation = data.stations[0];

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label={`Most Pressured: ${worstStation.name}`} value={worstStation.score.toFixed(3)} color="var(--accent-rose)" />
        <StatsCard label={`Best Managed: ${bestStation.name}`} value={bestStation.score.toFixed(3)} color="var(--accent-emerald)" />
      </div>

      <ChartWrapper title="Parking Pressure Score by Station" subtitle="Composite score representing stress on the parking enforcement system.">
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 1]} tick={{ fill: 'var(--text-muted)' }} />
          <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: '0.8rem' }} interval={0} width={100} />
          <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="Violation Volume (40%)" stackId="a" fill="var(--accent-blue)" />
          <Bar dataKey="Repeat Offenders (20%)" stackId="a" fill="var(--accent-amber)" />
          <Bar dataKey="Timing Divergence (20%)" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="Device Gaps (20%)" stackId="a" fill="var(--accent-rose)" />
        </BarChart>
      </ChartWrapper>

      <div className="glass-card" style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <strong>Note:</strong> Repeat offender ratio = vehicles with ≥5 violations at this specific station / total vehicles at this station.<br/>
        Weights (40/20/20/20) are configurable policy parameters, not statistically derived.
      </div>
    </div>
  );
}
