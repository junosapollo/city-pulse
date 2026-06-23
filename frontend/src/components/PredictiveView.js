'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import StatsCard from './StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function PredictiveView() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/prediction').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading Forecast...</div>;

  const formatHours = (hours) => hours.map(h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`).join(', ');

  const featImp = Object.entries(data.model_metrics.feature_importance)
    .map(([name, val]) => ({ name, importance: val }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Predictions for {data.forecast_date}</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Error Margin:</span>
            <strong>{data.model_metrics.rmse.toFixed(2)}</strong>
          </div>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Accuracy Score:</span>
            <strong>{data.model_metrics.r2.toFixed(3)}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {data.predictions.map((p, i) => (
          <div key={p.station} className="glass-card animate-enter" style={{ padding: '20px', animationDelay: `${i * 0.1}s` }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Rank #{i + 1}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>{p.station}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '8px' }}>
              {p.predicted_total.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Peak: {formatHours(p.peak_hours)}
            </div>
          </div>
        ))}
      </div>

      <ChartWrapper title="What Impacts Predictions Most" subtitle="How much each factor matters.">
        <BarChart data={featImp} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 'auto']} tick={{ fill: 'var(--text-muted)' }} />
          <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
          <Bar dataKey="importance" fill="var(--accent-blue)" />
        </BarChart>
      </ChartWrapper>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
        Predictions based on past data. Doesn't include real-time factors like weather or events.
      </div>
    </div>
  );
}
