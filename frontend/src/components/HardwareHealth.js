'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import StatsCard from './StatsCard';
import SortableTable from './SortableTable';
import DataTableCard from './DataTableCard';
import { SkeletonTable } from './LoadingSkeleton';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

export default function HardwareHealth() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    fetchAPI('/api/hardware-health').then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ height: '100%' }}><SkeletonTable rows={15} /></div>;

  let filtered = data.devices.filter(d => d.device_id.toLowerCase().includes(search.toLowerCase()));
  if (filterTab === 'Flagged Only') filtered = filtered.filter(d => d.flagged);
  if (filterTab === 'Healthy Only') filtered = filtered.filter(d => !d.flagged);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const mappedData = paginated.map(d => ({
    ...d,
    approval_pct: d.total > d.unknown ? (d.approved / (d.total - d.unknown)) : -1,
    rowProps: { style: { borderLeft: d.flagged ? '4px solid var(--rose)' : '4px solid transparent' } }
  }));

  const columns = [
    { key: 'device_id', label: 'Device ID', render: val => <span style={{ fontFamily: 'monospace', color: 'var(--text)', fontWeight: 500 }}>{val}</span> },
    { key: 'total', label: 'Total Captures', render: val => <span className="tabular-nums">{val.toLocaleString()}</span> },
    { key: 'approval_pct', label: 'Clear Images %', render: val => val >= 0 ? <span className="tabular-nums">{(val * 100).toFixed(1)}%</span> : '-' },
    { key: 'rejection_rate', label: 'Unclear Images %', render: val => <span className="tabular-nums" style={{ color: val > data.thresholds.rejection_pct / 100 ? 'var(--amber)' : 'inherit', fontWeight: val > data.thresholds.rejection_pct / 100 ? 600 : 400 }}>{val !== null ? (val * 100).toFixed(1) + '%' : '-'}</span> },
    { key: 'duplicate_rate', label: 'Repeat Images %', render: val => <span className="tabular-nums" style={{ color: val > data.thresholds.duplicate_pct / 100 ? 'var(--amber)' : 'inherit', fontWeight: val > data.thresholds.duplicate_pct / 100 ? 600 : 400 }}>{val !== null ? (val * 100).toFixed(1) + '%' : '-'}</span> },
    { key: 'flagged', label: 'Status', render: val => val ? <span className="badge badge-rose">Flagged</span> : <span className="badge badge-green">Healthy</span> },
    { key: 'flag_reason', label: 'Flag Reason', render: val => <span style={{ color: 'var(--text-muted)' }}>{val || '-'}</span> }
  ];

  return (
    <div className="scrollable-y" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard label="Total Devices" icon={<Camera size={16} />} value={data.summary.total_devices.toLocaleString()} color="var(--blue)" />
        <StatsCard label="Flagged Devices" icon={<AlertCircle size={16} />} value={data.summary.flagged_count.toLocaleString()} color="var(--rose)" />
        <StatsCard label="Avg Unclear Images" icon={<RefreshCw size={16} />} value={`${(data.summary.avg_rejection_rate * 100).toFixed(1)}%`} color="var(--amber)" />
      </div>

      <div className="surface-card no-hover" style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Alert rule:</strong> devices above {data.thresholds.method} — unclear images &gt; {data.thresholds.rejection_pct.toFixed(1)}%, repeats &gt; {data.thresholds.duplicate_pct.toFixed(1)}%
      </div>

      <div className="desktop-table-view">
        <DataTableCard
          title="Hardware Health Data"
          data={mappedData}
          columns={columns}
          defaultSortKey="rejection_rate"
          extraActions={
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search device ID..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="filter-input"
                style={{ width: '200px' }} 
              />
              <div className="filter-tabs">
                {['All', 'Flagged Only', 'Healthy Only'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => { setFilterTab(tab); setPage(1); }}
                    className={`filter-tab ${filterTab === tab ? 'active' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </div>
      
      {/* Mobile Card List (hidden on desktop via CSS, or we can use a media query hook, but since it's server-rendered mostly, let's use CSS classes) */}
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
        {mappedData.map(d => (
          <div key={d.device_id} className="surface-card" style={{ borderLeft: d.flagged ? '4px solid var(--rose)' : '4px solid var(--green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <strong style={{ fontFamily: 'monospace', fontSize: '15px' }}>{d.device_id}</strong>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total: {d.total.toLocaleString()}</div>
              </div>
              {d.flagged ? <span className="badge badge-rose">Flagged</span> : <span className="badge badge-green">Healthy</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div>Clear: {d.approval_pct >= 0 ? (d.approval_pct * 100).toFixed(1) + '%' : '-'}</div>
              <div style={{ color: d.rejection_rate > data.thresholds.rejection_pct / 100 ? 'var(--amber)' : 'inherit' }}>
                Unclear: {d.rejection_rate !== null ? (d.rejection_rate * 100).toFixed(1) + '%' : '-'}
              </div>
              <div style={{ color: d.duplicate_rate > data.thresholds.duplicate_pct / 100 ? 'var(--amber)' : 'inherit' }}>
                Repeat: {d.duplicate_rate !== null ? (d.duplicate_rate * 100).toFixed(1) + '%' : '-'}
              </div>
            </div>
            {d.flag_reason && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--rose)' }}>
                Reason: {d.flag_reason}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            className="btn-secondary"
            style={{ cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <span className="page-info" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            className="btn-secondary"
            style={{ cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
