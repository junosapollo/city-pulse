'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import StatsCard from './StatsCard';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, BarChart, Bar, Legend, Cell } from 'recharts';
import { SkeletonChart } from './LoadingSkeleton';
import { Link2, ShieldCheck, X } from 'lucide-react';

export default function CorrelationView() {
  const [data, setData] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchAPI('/api/correlation').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ height: '100%' }}><SkeletonChart /></div>;

  const topStations = [...data.stations].sort((a, b) => b.incidents_raw - a.incidents_raw).slice(0, 5);
  
  const barData = topStations.map(s => ({
    name: s.name,
    ...s.incident_breakdown
  }));
  
  const causeKeys = Array.from(new Set(topStations.flatMap(s => Object.keys(s.incident_breakdown))));
  const colors = ['var(--blue)', 'var(--amber)', 'var(--green)', 'var(--rose)', 'var(--violet)', '#0ea5e9'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="surface-card no-hover" style={{ padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>{d.name}</strong>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Violations: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d.violations_raw}</span></div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Incidents: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d.incidents_raw}</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label="Link Strength" icon={<Link2 size={16} />} value={data.correlation_r.toFixed(3)} color="var(--amber)" />
        <StatsCard label="Data Reliability" icon={<ShieldCheck size={16} />} value={data.correlation_p < 0.001 ? '< 0.001' : data.correlation_p.toFixed(3)} color="var(--blue)" />
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '400px' }}>
          <ChartWrapper title="Traffic & Parking Issues" subtitle="Fines vs Incidents. Click a dot for details." minChartWidth={640}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" dataKey="violations_norm" name="Violations" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} domain={['auto', 'auto']} />
              <YAxis type="number" dataKey="incidents_norm" name="Incidents" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--border-strong)' }} />
              <ReferenceLine x={0.5} stroke="var(--border-strong)" strokeDasharray="3 3" />
              <ReferenceLine y={0.5} stroke="var(--border-strong)" strokeDasharray="3 3" />
              <Scatter 
                name="Stations" 
                data={data.stations} 
                fill="var(--blue)"
                onClick={(e) => setSelectedStation(e && e.payload ? e.payload : e)}
                style={{ cursor: 'pointer' }}
              >
                {data.stations.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedStation?.name === entry.name ? 'var(--amber)' : ((entry.violations_norm > 0.5 && entry.incidents_norm > 0.5) ? 'var(--rose)' : 'var(--blue)')} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartWrapper>
        </div>
        
        {selectedStation && (
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="surface-card animate-enter" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--amber)' }}>{selectedStation.name}</h3>
                <button onClick={() => setSelectedStation(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Violations (Raw):</span>
                  <strong style={{ fontSize: '18px' }} className="tabular-nums">{selectedStation.violations_raw.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Incidents (Raw):</span>
                  <strong style={{ fontSize: '18px' }} className="tabular-nums">{selectedStation.incidents_raw.toLocaleString()}</strong>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>Incident Breakdown</h4>
                  {Object.entries(selectedStation.incident_breakdown || {}).map(([cause, count]) => (
                    <div key={cause} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: 'var(--text)' }}>
                      <span>{cause}</span>
                      <strong className="tabular-nums">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChartWrapper title="Incident Details for Top 5 Areas" minChartWidth={760}>
        <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
            itemStyle={{ color: 'var(--text)', fontSize: '13px' }}
            labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} iconType="circle" />
          {causeKeys.map((k, i) => (
            <Bar key={k} dataKey={k} stackId="a" fill={colors[i % colors.length]} radius={i === causeKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ChartWrapper>
    </div>
  );
}
