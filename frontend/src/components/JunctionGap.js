'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchAPI } from '@/lib/api';
import ChartWrapper from './ChartWrapper';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CircleMarker } from 'react-leaflet';
import SortableTable from './SortableTable';
import DataTableCard from './DataTableCard';
import { SkeletonChart } from './LoadingSkeleton';
import { Lightbulb } from 'lucide-react';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function JunctionGap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAPI('/api/junction-gap').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ height: '100%' }}><SkeletonChart /></div>;

  const pieData = [
    { name: 'No Junction', value: data.no_junction.count },
    { name: 'With Junction', value: data.with_junction.count }
  ];
  const COLORS = ['var(--amber)', 'var(--blue)'];

  const columns = [
    { key: 'name', label: 'Station', render: val => <strong style={{ color: 'var(--text)' }}>{val}</strong> },
    { key: 'no_junction_count', label: 'No Junction Count', render: val => <span style={{ color: 'var(--amber)', fontWeight: 600 }} className="tabular-nums">{val.toLocaleString()}</span> },
    { key: 'no_junction_pct', label: 'No Junction %', render: val => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '100px', height: '6px', background: 'var(--surface-soft)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${val}%`, background: 'var(--amber)' }} />
        </div>
        <span className="tabular-nums">{val.toFixed(1)}%</span>
      </div>
    )},
    { key: 'total_violations', label: 'Total Violations', render: val => <span className="tabular-nums">{val.toLocaleString()}</span> }
  ];

  return (
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="surface-card no-hover" style={{ borderLeft: '4px solid var(--amber)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '8px', color: 'var(--amber)' }}>
          <Lightbulb size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Insight</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '14px' }}>
            <strong style={{ color: 'var(--amber)' }}>{data.no_junction.pct.toFixed(1)}%</strong> of all violations lack junction tagging — these represent enforcement blind spots where spatial resolution is weakest.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <ChartWrapper title="Junction Data Breakdown">
            <PieChart>
              <Pie data={pieData} innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
                itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
            </PieChart>
          </ChartWrapper>
        </div>

        <div style={{ flex: 2, minWidth: '400px', height: '450px' }}>
          <div className="surface-card no-hover" style={{ height: '100%', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Where "No Junction" Violations Happen</h3>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <MapView>
                {data.no_junction.locations.map((loc, i) => (
                  <CircleMarker key={i} center={[loc.lat, loc.lng]} radius={3} pathOptions={{ fillColor: 'var(--amber)', fillOpacity: 0.4, stroke: false }} />
                ))}
              </MapView>
            </div>
          </div>
        </div>
      </div>

      <DataTableCard
        title="Per-Station Breakdown"
        data={data.by_station}
        columns={columns}
        defaultSortKey="no_junction_pct"
      />
    </div>
  );
}
