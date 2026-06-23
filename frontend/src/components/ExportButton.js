'use client';
import { Download } from 'lucide-react';
export default function ExportButton({ data, filename = 'export', columns = null }) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const keys = columns || Object.keys(data[0]).filter(k => k !== '_key');
    const header = keys.join(',');
    const rows = data.map(row =>
      keys.map(k => {
        const val = row[k];
        if (val == null) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="export-btn" onClick={handleExport} title="Export as CSV">
      <Download size={16} />
      <span>Export CSV</span>
    </button>
  );
}
