'use client';
import React, { useState, useMemo } from 'react';
import ExportButton from './ExportButton';

export default function SortableTable({ 
  columns, 
  data, 
  defaultSortKey = null, 
  defaultSortDir = 'desc',
  renderExpandedRow = null,
  expandedRowId = null,
  onRowClick = null,
  rowIdKey = 'id'
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    
    return [...data].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="table-container scrollable-x" style={{ flex: 1, overflowX: 'auto', width: '100%' }}>
      <table style={{ minWidth: '600px', width: '100%', margin: 0 }}>
        <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1, boxShadow: '0 1px 0 var(--border)' }}>
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                className={col.sortable !== false ? `sortable ${sortKey === col.key ? 'active' : ''}` : ''}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px', borderBottom: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {col.label}
                  {col.sortable !== false && (
                    <span className="sort-icon" style={{ fontSize: '10px' }}>
                      {sortKey === col.key 
                        ? (sortDir === 'asc' ? '▲' : '▼') 
                        : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => {
            const rowId = row[rowIdKey] || i;
            const isExpanded = expandedRowId === rowId;
            return (
              <React.Fragment key={rowId}>
                <tr 
                  {...(row.rowProps || {})}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ 
                    ...((row.rowProps || {}).style || {}), 
                    cursor: onRowClick ? 'pointer' : 'default', 
                    background: isExpanded ? 'var(--surface-tint)' : 'var(--surface)' 
                  }}
                  className="table-row"
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }} className="table-text">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
                {isExpanded && renderExpandedRow && (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: 0, borderBottom: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
                      {renderExpandedRow(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <style jsx>{`
        .table-row {
          transition: background 0.2s ease;
        }
        .table-row:hover {
          background: var(--surface-soft) !important;
        }
      `}</style>
    </div>
  );
}
