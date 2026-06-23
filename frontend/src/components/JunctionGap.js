'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CircleMarker } from 'react-leaflet';
import SortableTable from './SortableTable';
import { SkeletonChart } from './LoadingSkeleton';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function JunctionGap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/junction-gap').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px', height: '100%' }}><SkeletonChart /></div>;

  const pieData = [
    { name: 'No Junction', value: data.no_junction.count },
    { name: 'With Junction', value: data.with_junction.count }
  ];
  const COLORS = ['var(--accent-amber)', 'var(--accent-blue)'];

  const columns = [
    { key: 'name', label: 'Station', render: val => <strong>{val}</strong> },
    { key: 'no_junction_count', label: 'No Junction Count', render: val => <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{val.toLocaleString()}</span> },
    { key: 'no_junction_pct', label: 'No Junction %', render: val => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '100px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${val}%`, background: 'var(--accent-amber)' }} />
        </div>
        <span>{val.toFixed(1)}%</span>
      </div>
    )},
    { key: 'total_violations', label: 'Total Violations', render: val => val.toLocaleString() }
  ];

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-amber)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Insight</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--accent-amber)' }}>{data.no_junction.pct.toFixed(1)}%</strong> of all violations lack junction tagging — these represent enforcement blind spots where spatial resolution is weakest.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <ChartWrapper title="Junction Data Breakdown">
            <PieChart>
              <Pie data={pieData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ChartWrapper>
        </div>

        <div style={{ flex: 2, minWidth: '400px', height: '450px' }}>
          <div className="glass-card" style={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Where "No Junction" Violations Happen</h3>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
              <MapView>
                {data.no_junction.locations.map((loc, i) => (
                  <CircleMarker key={i} center={[loc.lat, loc.lng]} radius={2} pathOptions={{ fillColor: 'var(--accent-amber)', fillOpacity: 0.2, stroke: false }} />
                ))}
              </MapView>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card scrollable-y" style={{ flex: 1, minHeight: '400px', padding: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Per-Station Breakdown</h3>
        <SortableTable 
          columns={columns} 
          data={data.by_station} 
          defaultSortKey="no_junction_pct" 
        />
      </div>
    </div>
  );
}
