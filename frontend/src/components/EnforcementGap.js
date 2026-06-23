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

  if (!data) return <div style={{ height: '100%' }}><SkeletonChart /></div>;

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
      label: 'Uneven Ticketing Score',
      render: (val) => {
        const isNull = val === null;
        const color = isNull ? 'var(--text-muted)' : val > 0.5 ? 'var(--rose)' : val > 0.3 ? 'var(--amber)' : 'var(--green)';
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
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ChartWrapper 
        title={`${isCityWide ? 'City-Wide' : selectedStation} Fines vs Incidents by Hour`} 
        subtitle="Shaded areas show amount. Dashed line shows accidents (city-wide)."
        extra={
          <select 
            className="filter-input" 
            value={selectedStation} 
            onChange={e => setSelectedStation(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="City-Wide">City-Wide</option>
            {data.per_station.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        }
        minChartWidth={640}
      >
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: 'var(--blue)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--rose)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <Area yAxisId="left" type="monotone" dataKey="violations" name="Violations" fill="var(--surface-tint)" stroke="var(--blue)" fillOpacity={0.6} strokeWidth={2} />
          <Area yAxisId="right" type="monotone" dataKey="incidents" name="Incidents" fill="#fff1f2" stroke="var(--rose)" fillOpacity={0.6} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="accidents" name="Accidents" stroke="var(--amber)" strokeDasharray="5 5" dot={false} strokeWidth={2} />
        </ComposedChart>
      </ChartWrapper>

      <div className="surface-card">
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: 'var(--text)' }}>Uneven Ticketing Score per Station</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Click a row to view the station's chart above.</p>
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
