'use client';
import { useState, useEffect } from 'react';

function getNumericMeta(value) {
  if (typeof value === 'number') {
    const decimals = Number.isInteger(value) ? 0 : 3;
    return { num: value, decimals, suffix: '' };
  }

  const strVal = String(value).trim();
  const match = strVal.match(/^(-?[\d,]+(?:\.\d+)?)(%)?$/);
  if (!match) return null;

  const numericPart = match[1];
  return {
    num: parseFloat(numericPart.replace(/,/g, '')),
    decimals: numericPart.includes('.') ? numericPart.split('.')[1].length : 0,
    suffix: match[2] || ''
  };
}

function formatNumeric(num, meta) {
  const formatted = meta.decimals === 0
    ? Math.round(num).toLocaleString()
    : num.toLocaleString(undefined, {
        minimumFractionDigits: meta.decimals,
        maximumFractionDigits: meta.decimals
      });
  return `${formatted}${meta.suffix}`;
}

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const meta = getNumericMeta(value);
    if (!meta || isNaN(meta.num)) {
      setIsAnimating(false);
      return;
    }

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsAnimating(false);
      return;
    }
    
    setIsAnimating(true);
    const duration = 700; // Finish within 700ms
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = meta.num * ease;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(meta.num);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  const meta = getNumericMeta(value);
  if (!meta || isNaN(meta.num)) return value;
  return formatNumeric(isAnimating ? displayValue : meta.num, meta);
}

export default function StatsCard({ label, value, icon, color = 'var(--blue)', trend, className = '' }) {
  return (
    <div className={`surface-card animate-enter ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px',
      borderLeft: `4px solid ${color}`,
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
        {icon && <span style={{ color }}>{icon}</span>}
        <span className="card-label">{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
        <span className="tabular-nums"><AnimatedNumber value={value} /></span>
        {trend && (
          <span style={{ 
            fontSize: '13px', 
            fontWeight: 600, 
            color: trend.direction === 'up' ? 'var(--green)' : 'var(--rose)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: trend.direction === 'up' ? '#ecfdf5' : '#fff1f2',
            padding: '2px 6px',
            borderRadius: '6px'
          }}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            {trend.label && <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>{trend.label}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
