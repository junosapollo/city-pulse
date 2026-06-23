'use client';
import React from 'react';
import ExportButton from './ExportButton';
import SortableTable from './SortableTable';

export default function DataTableCard({ 
  title, 
  subtitle, 
  data, 
  columns, 
  defaultSortKey, 
  rowIdKey, 
  expandedRowId, 
  onRowClick, 
  renderExpandedRow,
  extraActions
}) {
  return (
    <div className="surface-card table-card">
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid var(--border)', 
        background: 'var(--surface)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        <div>
          {title && <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {extraActions}
          {data && data.length > 0 && (
            <ExportButton data={data} columns={columns.map(c => c.key)} filename={`${title || 'data'}_export`} />
          )}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <SortableTable 
          columns={columns} 
          data={data} 
          defaultSortKey={defaultSortKey}
          rowIdKey={rowIdKey}
          expandedRowId={expandedRowId}
          onRowClick={onRowClick}
          renderExpandedRow={renderExpandedRow}
        />
      </div>
    </div>
  );
}
