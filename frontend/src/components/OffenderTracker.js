'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchAPI } from '@/lib/api';
import StatsCard from './StatsCard';
import ChartWrapper from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CircleMarker } from 'react-leaflet';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function OffenderTracker() {
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAPI('/api/offenders').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading Offenders...</div>;

  const vehicleTypes = data.repeat_offenders.reduce((acc, curr) => {
    acc[curr.vehicle_type] = (acc[curr.vehicle_type] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(vehicleTypes)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label="Vehicles with 5+ violations city-wide" value={data.summary.total_repeat.toLocaleString()} color="var(--accent-rose)" />
        <StatsCard label="% of Unique Vehicles" value={`${data.summary.pct_of_vehicles.toFixed(1)}%`} />
        <StatsCard label="% of Total Violations" value={`${data.summary.pct_of_violations.toFixed(1)}%`} />
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '400px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div className="scrollable-y" style={{ flex: 1 }}>
              <table>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
                  <tr>
                    <th>Vehicle No.</th>
                    <th>Count</th>
                    <th>Type</th>
                    <th>Top Station</th>
                  </tr>
                </thead>
                <tbody>
                  {data.repeat_offenders.map(d => (
                    <React.Fragment key={d.vehicle_number_masked}>
                      <tr 
                        onClick={() => setExpandedId(expandedId === d.vehicle_number_masked ? null : d.vehicle_number_masked)}
                        style={{ cursor: 'pointer', background: expandedId === d.vehicle_number_masked ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                      >
                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontWeight: 600 }}>{d.vehicle_number_masked}</td>
                        <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{d.count}</td>
                        <td>{d.vehicle_type}</td>
                        <td>{d.top_station}</td>
                      </tr>
                      {expandedId === d.vehicle_number_masked && (
                        <tr>
                          <td colSpan={4} style={{ padding: 0 }}>
                            <div style={{ height: '300px', width: '100%' }}>
                              <MapView center={d.locations[0] ? [d.locations[0].lat, d.locations[0].lng] : undefined} zoom={12}>
                                {d.locations.map((loc, i) => (
                                  <CircleMarker key={i} center={[loc.lat, loc.lng]} radius={4} pathOptions={{ fillColor: 'var(--accent-rose)', fillOpacity: 0.8, color: '#fff', weight: 1 }} />
                                ))}
                              </MapView>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <ChartWrapper title="Vehicle Type Distribution" subtitle="Among chronic offenders.">
            <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: '0.8rem' }} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="count">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-rose)' : 'var(--accent-blue)'} />
                ))}
              </Bar>
            </BarChart>
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}
