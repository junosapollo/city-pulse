'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchAPI } from '@/lib/api';
import StatsCard from './StatsCard';
import ChartWrapper from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CircleMarker } from 'react-leaflet';
import SortableTable from './SortableTable';
import DataTableCard from './DataTableCard';
import { SkeletonTable } from './LoadingSkeleton';
import { Car, Hash, Percent } from 'lucide-react';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function OffenderTracker() {
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 25;

  useEffect(() => {
    fetchAPI('/api/offenders').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ height: '100%' }}><SkeletonTable rows={15} /></div>;

  const vehicleTypes = data.repeat_offenders.reduce((acc, curr) => {
    acc[curr.vehicle_type] = (acc[curr.vehicle_type] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(vehicleTypes)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const filtered = data.repeat_offenders.filter(d => d.vehicle_number_masked.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const columns = [
    { key: 'vehicle_number_masked', label: 'Vehicle No.', render: val => <span style={{ fontFamily: 'monospace', color: 'var(--blue)', fontWeight: 600 }}>{val}</span> },
    { key: 'count', label: 'Count', render: val => <span style={{ color: 'var(--rose)', fontWeight: 600 }} className="tabular-nums">{val}</span> },
    { key: 'vehicle_type', label: 'Type' },
    { key: 'top_station', label: 'Top Station' }
  ];

  return (
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label="Vehicles caught 5+ times" icon={<Car size={16} />} value={data.summary.total_repeat.toLocaleString()} color="var(--rose)" />
        <StatsCard label="% of Unique Vehicles" icon={<Hash size={16} />} value={`${data.summary.pct_of_vehicles.toFixed(1)}%`} color="var(--amber)" />
        <StatsCard label="% of Total Violations" icon={<Percent size={16} />} value={`${data.summary.pct_of_violations.toFixed(1)}%`} color="var(--blue)" />
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '400px' }}>
          <div className="desktop-table-view">
            <DataTableCard
              title="Repeat Offenders"
              data={paginated}
              columns={columns}
              defaultSortKey="count"
              rowIdKey="vehicle_number_masked"
              expandedRowId={expandedId}
              onRowClick={(row) => setExpandedId(expandedId === row.vehicle_number_masked ? null : row.vehicle_number_masked)}
              renderExpandedRow={(row) => (
                <div style={{ height: '300px', width: '100%', padding: '16px', background: 'var(--surface-soft)' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Locations mapped for {row.vehicle_number_masked}</h4>
                  <div style={{ height: 'calc(100% - 28px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <MapView center={row.locations[0] ? [row.locations[0].lat, row.locations[0].lng] : undefined} zoom={12}>
                      {row.locations.map((loc, i) => (
                        <CircleMarker key={i} center={[loc.lat, loc.lng]} radius={6} pathOptions={{ fillColor: 'var(--rose)', fillOpacity: 0.8, color: '#fff', weight: 2 }} />
                      ))}
                    </MapView>
                  </div>
                </div>
              )}
              extraActions={
                <input 
                  type="text" 
                  placeholder="Search vehicle number..." 
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); setExpandedId(null); }}
                  className="filter-input"
                  style={{ width: '100%', maxWidth: '300px' }} 
                />
              }
            />
          </div>

          <style jsx>{`
            .desktop-table-view {
              display: block;
            }
            .mobile-cards-view {
              display: none;
            }
            @media (max-width: 768px) {
              .desktop-table-view {
                display: none !important;
              }
              .mobile-cards-view {
                display: flex;
              }
            }
          `}</style>

          <div className="mobile-cards-view mobile-card-list">
            <div style={{ padding: '0 0 12px 0' }}>
              <input 
                type="text" 
                placeholder="Search vehicle number..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); setExpandedId(null); }}
                className="filter-input"
                style={{ width: '100%' }} 
              />
            </div>
            {paginated.map(row => (
              <div key={row.vehicle_number_masked} className="surface-card" onClick={() => setExpandedId(expandedId === row.vehicle_number_masked ? null : row.vehicle_number_masked)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--blue)' }}>{row.vehicle_number_masked}</strong>
                  <span className="badge badge-rose">{row.count} times</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div>Type: {row.vehicle_type}</div>
                  <div>Top: <span style={{ color: 'var(--text)' }}>{row.top_station}</span></div>
                </div>
                {expandedId === row.vehicle_number_masked && (
                  <div style={{ height: '250px', width: '100%', marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <MapView center={row.locations[0] ? [row.locations[0].lat, row.locations[0].lng] : undefined} zoom={11}>
                      {row.locations.map((loc, i) => (
                        <CircleMarker key={i} center={[loc.lat, loc.lng]} radius={6} pathOptions={{ fillColor: 'var(--rose)', fillOpacity: 0.8, color: '#fff', weight: 2 }} />
                      ))}
                    </MapView>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => { setPage(page - 1); setExpandedId(null); }}
                className="btn-secondary"
                style={{ cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span className="page-info" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages} 
                onClick={() => { setPage(page + 1); setExpandedId(null); }}
                className="btn-secondary"
                style={{ cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <ChartWrapper title="Vehicle Type Distribution" subtitle="Among repeat offenders.">
            <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
                cursor={{ fill: 'var(--surface-soft)' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--rose)' : 'var(--blue)'} />
                ))}
              </Bar>
            </BarChart>
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}
