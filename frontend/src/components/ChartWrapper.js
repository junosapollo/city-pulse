'use client';
import { ResponsiveContainer } from 'recharts';

export default function ChartWrapper({ title, subtitle, children }) {
  return (
    <div className="glass-card animate-enter" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
