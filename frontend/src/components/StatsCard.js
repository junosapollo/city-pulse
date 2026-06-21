'use client';
import { useState, useEffect } from 'react';

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const strVal = String(value);
    const numericMatch = strVal.match(/[\d.,]+/);
    
    if (!numericMatch) {
      setIsAnimating(false);
      return;
    }
    
    const numStr = numericMatch[0].replace(/,/g, '');
    const num = parseFloat(numStr);
    
    if (isNaN(num)) {
      setIsAnimating(false);
      return;
    }
    
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = num * ease;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(num);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  const strVal = String(value);
  const numericMatch = strVal.match(/[\d.,]+/);
  if (!numericMatch || !isAnimating) return value;
  
  const isInt = !strVal.includes('.');
  const formattedNum = isInt ? Math.round(displayValue).toLocaleString() : displayValue.toFixed(1);
  return strVal.replace(/[\d.,]+/, formattedNum);
}

export default function StatsCard({ label, value, icon, color = 'var(--accent-blue)', trend }) {
  return (
    <div className="glass-card animate-enter" style={{ 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px',
      borderLeft: `4px solid ${color}`,
      minWidth: '200px',
      flex: 1
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
        {icon && <span style={{ fontSize: '1.2rem', color }}>{icon}</span>}
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span className="stat-value"><AnimatedNumber value={value} /></span>
        {trend && (
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            color: trend.direction === 'up' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            {trend.label && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>{trend.label}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
