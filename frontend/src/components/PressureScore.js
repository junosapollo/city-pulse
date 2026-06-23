'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import StatsCard from './StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { SkeletonChart } from './LoadingSkeleton';

export default function PressureScore() {
  const [data, setData] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAPI('/api/pressure-score').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ height: '100%' }}><SkeletonChart /></div>;

  const displayStations = showAll ? data.stations : data.stations.slice(0, 15);

  const chartData = displayStations.map(s => {
    const max_d = Math.max(...data.stations.map(x => x.device_count));
    const d_norm = s.device_count / (max_d || 1);
    const d_gap = 1 - d_norm;

    return {
      name: s.name,
      'Total Fines (40%)': s.violations_norm * 0.4,
      'Repeat Offenders (20%)': s.repeat_offender_ratio * 0.2,
      'Timing Differences (20%)': s.timing_divergence * 0.2,
      'Camera Blind Spots (20%)': d_gap * 0.2,
      total: s.score
    };
  });

  const bestStation = data.stations[data.stations.length - 1];
  const worstStation = data.stations[0];

  return (
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label={`Most Difficult: ${worstStation.name}`} icon={<TrendingUp size={16} />} value={worstStation.score.toFixed(3)} color="var(--rose)" />
        <StatsCard label={`Easiest Parking: ${bestStation.name}`} icon={<TrendingDown size={16} />} value={bestStation.score.toFixed(3)} color="var(--green)" />
      </div>

      <ChartWrapper 
        title="Parking Difficulty by Area" 
        subtitle="Overall score showing how difficult parking is in each area."
        height={showAll ? Math.max(500, displayStations.length * 25) : 500}
        extra={
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            {showAll ? 'Show Top 15' : 'Show All'}
          </button>
        }
        minChartWidth={760}
      >
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 1]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} width={100} />
          <Tooltip 
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
            itemStyle={{ color: 'var(--text)', fontSize: '13px' }}
            labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} iconType="circle" />
          <Bar dataKey="Total Fines (40%)" stackId="a" fill="var(--blue)" />
          <Bar dataKey="Repeat Offenders (20%)" stackId="a" fill="var(--amber)" />
          <Bar dataKey="Timing Differences (20%)" stackId="a" fill="var(--violet)" />
          <Bar dataKey="Camera Blind Spots (20%)" stackId="a" fill="var(--rose)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartWrapper>

      <div className="surface-card no-hover" style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Note:</strong> 
        <div>
          Repeat offender ratio = vehicles with ≥5 violations at this specific station / total vehicles at this station.<br/>
          Weights (40/20/20/20) are configurable policy parameters, not statistically derived.
        </div>
      </div>
    </div>
  );
}
