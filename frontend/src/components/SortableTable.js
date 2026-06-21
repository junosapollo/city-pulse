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
    <div className="scrollable-y" style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', paddingRight: '16px' }}>
        <ExportButton data={data} columns={columns.map(c => c.key)} filename="table_export" />
      </div>
      <table style={{ minWidth: '600px' }}>
        <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                className={col.sortable !== false ? `sortable ${sortKey === col.key ? 'active' : ''}` : ''}
                onClick={() => col.sortable !== false && handleSort(col.key)}
              >
                {col.label}
                {col.sortable !== false && (
                  <span className="sort-icon">
                    {sortKey === col.key 
                      ? (sortDir === 'asc' ? '▲' : '▼') 
                      : '↕'}
                  </span>
                )}
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
                  style={{ ...((row.rowProps || {}).style || {}), cursor: onRowClick ? 'pointer' : 'default', background: isExpanded ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                >
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
                {isExpanded && renderExpandedRow && (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: 0 }}>
                      {renderExpandedRow(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
