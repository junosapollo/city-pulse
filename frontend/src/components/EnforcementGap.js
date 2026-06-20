'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function EnforcementGap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/enforcement-gap').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading Enforcement Gap...</div>;

  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    hour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
    violations: data.city_wide.violation_hours[i],
    incidents: data.city_wide.incident_hours[i],
    accidents: data.city_wide.accident_hours[i]
  }));

  const formatHours = (hours) => hours.map(h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`).join(', ');

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ChartWrapper title="City-Wide Enforcement vs Incidents by Hour" subtitle="Shaded areas represent volume. Dashed line represents accidents.">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)' }} />
          <YAxis yAxisId="left" tick={{ fill: 'var(--accent-blue)' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--accent-rose)' }} />
          <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="violations" name="Violations" fill="var(--accent-blue)" stroke="var(--accent-blue)" fillOpacity={0.3} />
          <Area yAxisId="right" type="monotone" dataKey="incidents" name="Incidents" fill="var(--accent-rose)" stroke="var(--accent-rose)" fillOpacity={0.3} />
          <Line yAxisId="right" type="monotone" dataKey="accidents" name="Accidents" stroke="var(--accent-amber)" strokeDasharray="5 5" dot={false} strokeWidth={2} />
        </ComposedChart>
      </ChartWrapper>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Per-Station Divergence Score</h3>
        <div className="scrollable-y" style={{ maxHeight: '400px' }}>
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Divergence Score</th>
                <th>Top Violation Hours</th>
                <th>Top Incident Hours</th>
              </tr>
            </thead>
            <tbody>
              {data.per_station.map(s => {
                const isNull = s.divergence_score === null;
                const scoreColor = isNull ? 'var(--text-muted)' : s.divergence_score > 0.5 ? 'var(--accent-rose)' : s.divergence_score > 0.3 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
                
                return (
                  <tr key={s.name}>
                    <td><strong>{s.name}</strong></td>
                    <td style={{ color: scoreColor, fontWeight: 600 }}>
                      {isNull ? 'Insufficient Data' : s.divergence_score.toFixed(3)}
                    </td>
                    <td>{formatHours(s.violation_peak_hours)}</td>
                    <td>{formatHours(s.incident_peak_hours)}</td>
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
