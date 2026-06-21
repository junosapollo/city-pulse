'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import SortableTable from './SortableTable';
import { SkeletonChart } from './LoadingSkeleton';

export default function EnforcementGap() {
  const [data, setData] = useState(null);
  const [selectedStation, setSelectedStation] = useState('City-Wide');

  useEffect(() => {
    fetchAPI('/api/enforcement-gap').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px', height: '100%' }}><SkeletonChart /></div>;

  const isCityWide = selectedStation === 'City-Wide';
  const stationData = isCityWide 
    ? null 
    : data.per_station.find(s => s.name === selectedStation) || data.per_station[0];

  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    hour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
    violations: isCityWide ? data.city_wide.violation_hours[i] : (stationData?.violation_hours?.[i] || 0),
    incidents: isCityWide ? data.city_wide.incident_hours[i] : (stationData?.incident_hours?.[i] || 0),
    accidents: isCityWide ? data.city_wide.accident_hours[i] : 0 // accidents are only city-wide right now
  }));

  const formatHours = (hours) => hours.map(h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`).join(', ');

  const columns = [
    { key: 'name', label: 'Station' },
    { 
      key: 'divergence_score', 
      label: 'Divergence Score',
      render: (val) => {
        const isNull = val === null;
        const color = isNull ? 'var(--text-muted)' : val > 0.5 ? 'var(--accent-rose)' : val > 0.3 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
        return <span style={{ color, fontWeight: 600 }}>{isNull ? 'Insufficient Data' : val.toFixed(3)}</span>;
      }
    },
    { key: 'violation_peak_hours', label: 'Top Violation Hours', render: formatHours, sortable: false },
    { key: 'incident_peak_hours', label: 'Top Incident Hours', render: formatHours, sortable: false }
  ];

  const mappedData = data.per_station.map(s => ({
    ...s,
    // Provide a default sort value for nulls so it sorts cleanly
    divergence_score_sort: s.divergence_score === null ? -1 : s.divergence_score
  }));

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ChartWrapper 
        title={`${isCityWide ? 'City-Wide' : selectedStation} Enforcement vs Incidents by Hour`} 
        subtitle="Shaded areas represent volume. Dashed line represents accidents (city-wide)."
        extra={
          <select 
            className="filter-input" 
            value={selectedStation} 
            onChange={e => setSelectedStation(e.target.value)}
          >
            <option value="City-Wide">City-Wide</option>
            {data.per_station.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        }
      >
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
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Click a row to view the station's chart above.</p>
        <div onClick={(e) => {
          const tr = e.target.closest('tr');
          if (tr && tr.dataset.station) {
            setSelectedStation(tr.dataset.station);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}>
          <SortableTable 
            columns={columns} 
            data={mappedData.map(d => ({...d, rowProps: { 'data-station': d.name, style: { cursor: 'pointer' } }}))} 
            defaultSortKey="divergence_score" 
          />
        </div>
      </div>
    </div>
  );
}
