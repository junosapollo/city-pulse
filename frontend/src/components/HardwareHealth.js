'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import StatsCard from './StatsCard';

import SortableTable from './SortableTable';
import { SkeletonTable } from './LoadingSkeleton';

export default function HardwareHealth() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    fetchAPI('/api/hardware-health').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px', height: '100%' }}><SkeletonTable rows={15} /></div>;

  let filtered = data.devices.filter(d => d.device_id.toLowerCase().includes(search.toLowerCase()));
  if (filterTab === 'Flagged Only') filtered = filtered.filter(d => d.flagged);
  if (filterTab === 'Healthy Only') filtered = filtered.filter(d => !d.flagged);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const mappedData = paginated.map(d => ({
    ...d,
    approval_pct: d.total > d.unknown ? (d.approved / (d.total - d.unknown)) : -1,
    rowProps: { style: { borderLeft: d.flagged ? '4px solid var(--accent-rose)' : '4px solid transparent' } }
  }));

  const columns = [
    { key: 'device_id', label: 'Device ID', render: val => <span style={{ fontFamily: 'monospace' }}>{val}</span> },
    { key: 'total', label: 'Total Captures', render: val => val.toLocaleString() },
    { key: 'approval_pct', label: 'Clear Images %', render: val => val >= 0 ? (val * 100).toFixed(1) + '%' : '-' },
    { key: 'rejection_rate', label: 'Unclear Images %', render: val => <span style={{ color: val > data.thresholds.rejection_pct / 100 ? 'var(--accent-amber)' : 'inherit' }}>{val !== null ? (val * 100).toFixed(1) + '%' : '-'}</span> },
    { key: 'duplicate_rate', label: 'Repeat Images %', render: val => <span style={{ color: val > data.thresholds.duplicate_pct / 100 ? 'var(--accent-amber)' : 'inherit' }}>{val !== null ? (val * 100).toFixed(1) + '%' : '-'}</span> },
    { key: 'flagged', label: 'Status', render: val => val ? <span style={{ color: 'var(--accent-rose)' }}>🔴 Flagged</span> : <span style={{ color: 'var(--accent-emerald)' }}>🟢 Healthy</span> },
    { key: 'flag_reason', label: 'Flag Reason', render: val => <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{val || '-'}</span> }
  ];

  return (
    <div className="scrollable-y" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label="Total Devices" value={data.summary.total_devices.toLocaleString()} />
        <StatsCard label="Flagged Devices" value={data.summary.flagged_count.toLocaleString()} color="var(--accent-rose)" />
        <StatsCard label="Average Unclear Images" value={`${(data.summary.avg_rejection_rate * 100).toFixed(1)}%`} color="var(--accent-amber)" />
      </div>

      <div className="glass-card" style={{ padding: '16px', fontSize: '0.9rem' }}>
        <strong>Alert rule:</strong> devices above {data.thresholds.method} — unclear images &gt; {data.thresholds.rejection_pct.toFixed(1)}%, repeats &gt; {data.thresholds.duplicate_pct.toFixed(1)}%
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '400px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search device ID..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="filter-input"
            style={{ flex: 1, maxWidth: '300px' }} 
          />
          <div className="filter-tabs">
            {['All', 'Flagged Only', 'Healthy Only'].map(tab => (
              <button 
                key={tab}
                className={`filter-tab ${filterTab === tab ? 'active' : ''}`}
                onClick={() => { setFilterTab(tab); setPage(1); }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <SortableTable 
            columns={columns} 
            data={mappedData} 
            defaultSortKey="rejection_rate" 
          />
        </div>
        {totalPages > 1 && (
          <div className="pagination" style={{ borderTop: '1px solid var(--border)' }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
