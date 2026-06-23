'use client';
import { ResponsiveContainer } from 'recharts';

export default function ChartWrapper({ title, subtitle, height = 400, minChartWidth = '100%', children, extra }) {
  return (
    <div className="surface-card animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div className="chart-scroll scrollable-x" style={{ width: '100%', height, minHeight: height }}>
        <div style={{ width: '100%', height: '100%', minWidth: minChartWidth }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
