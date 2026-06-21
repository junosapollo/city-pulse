import React from 'react';

export const SkeletonCard = () => (
  <div className="glass-card p-6 skeleton skeleton-card"></div>
);

export const SkeletonChart = () => (
  <div className="glass-card p-6 skeleton skeleton-chart"></div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="glass-card p-6">
    <div className="skeleton skeleton-table-row" style={{ height: '24px', marginBottom: '16px' }}></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton skeleton-table-row"></div>
    ))}
  </div>
);

export const SkeletonMap = () => (
  <div className="glass-card p-4 h-full" style={{ minHeight: '500px' }}>
    <div className="skeleton skeleton-map"></div>
  </div>
);
