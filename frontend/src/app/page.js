'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { fetchAPI } from '@/lib/api';

import HotspotMap from '@/components/HotspotMap';
import CorrelationView from '@/components/CorrelationView';
import EnforcementGap from '@/components/EnforcementGap';
import PressureScore from '@/components/PressureScore';
import PredictiveView from '@/components/PredictiveView';
import HardwareHealth from '@/components/HardwareHealth';
import OffenderTracker from '@/components/OffenderTracker';
import JunctionGap from '@/components/JunctionGap';

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState('hotspot');
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetchAPI('/api/overview').then(setOverview).catch(console.error);
  }, []);

  const renderFeature = () => {
    switch (activeFeature) {
      case 'hotspot': return <HotspotMap />;
      case 'correlation': return <CorrelationView />;
      case 'enforcement_gap': return <EnforcementGap />;
      case 'pressure_score': return <PressureScore />;
      case 'prediction': return <PredictiveView />;
      case 'hardware_health': return <HardwareHealth />;
      case 'offender': return <OffenderTracker />;
      case 'junction_gap': return <JunctionGap />;
      default: return <HotspotMap />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {overview ? (
          <div className="scrollable-y" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', overflowX: 'auto', flexShrink: 0 }}>
            <StatsCard label="Total Violations" value={overview.total_violations.toLocaleString()} />
            <StatsCard label="Total Events" value={overview.total_events.toLocaleString()} color="var(--accent-amber)" />
            <StatsCard label="Active Stations" value={overview.total_stations} color="var(--accent-emerald)" />
            <StatsCard label="Parking %" value={`${overview.parking_pct.toFixed(1)}%`} color="var(--accent-rose)" />
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</span>
              <strong style={{ color: 'var(--text-primary)' }}>{overview.date_range.start}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to {overview.date_range.end}</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>Loading dashboard overview...</div>
        )}
        
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {renderFeature()}
        </div>
      </main>
    </div>
  );
}
