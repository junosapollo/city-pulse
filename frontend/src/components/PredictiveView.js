'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SkeletonChart } from './LoadingSkeleton';
import { Target, Activity } from 'lucide-react';

export default function PredictiveView() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/prediction').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ height: '100%' }}><SkeletonChart /></div>;

  const formatHours = (hours) => hours.map(h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`).join(', ');

  const featImp = Object.entries(data.model_metrics.feature_importance)
    .map(([name, val]) => ({ name, importance: val }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>Predictions for {data.forecast_date}</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="surface-card no-hover" style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
            <Activity size={16} color="var(--rose)" />
            <span style={{ color: 'var(--text-muted)' }}>Error Margin:</span>
            <strong className="tabular-nums" style={{ color: 'var(--text)' }}>{data.model_metrics.rmse.toFixed(2)}</strong>
          </div>
          <div className="surface-card no-hover" style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
            <Target size={16} color="var(--green)" />
            <span style={{ color: 'var(--text-muted)' }}>Accuracy Score:</span>
            <strong className="tabular-nums" style={{ color: 'var(--text)' }}>{data.model_metrics.r2.toFixed(3)}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {data.predictions.map((p, i) => (
          <div key={p.station} className="surface-card animate-enter" style={{ animationDelay: `${i * 0.1}s` }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
              Rank #{i + 1}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.station}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--amber)', marginBottom: '8px' }} className="tabular-nums">
              {p.predicted_total.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Peak: {formatHours(p.peak_hours)}
            </div>
          </div>
        ))}
      </div>

      <ChartWrapper title="What Impacts Predictions Most" subtitle="How much each factor matters." minChartWidth={640}>
        <BarChart data={featImp} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
            itemStyle={{ color: 'var(--blue)', fontWeight: 600 }}
            cursor={{ fill: 'var(--surface-soft)' }}
          />
          <Bar dataKey="importance" fill="var(--blue)" radius={[0, 4, 4, 0]} barSize={24} />
        </BarChart>
      </ChartWrapper>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: '8px' }}>
        Predictions based on past data. Doesn't include real-time factors like weather or events.
      </div>
    </div>
  );
}
