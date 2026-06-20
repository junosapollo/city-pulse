export default function StatsCard({ label, value, icon, color = 'var(--accent-blue)' }) {
  return (
    <div className="glass-card animate-enter" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
        {icon && <span style={{ fontSize: '1.2rem', color }}>{icon}</span>}
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}
