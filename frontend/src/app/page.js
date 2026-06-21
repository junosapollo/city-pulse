'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { fetchAPI } from '@/lib/api';
import CommandCenter from '@/components/CommandCenter';

const LoadingFallback = () => (
  <div style={{ padding: '24px', height: '100%' }}>
    <div className="skeleton skeleton-map"></div>
  </div>
);

const HotspotMap = dynamic(() => import('@/components/HotspotMap'), { ssr: false, loading: LoadingFallback });
const CorrelationView = dynamic(() => import('@/components/CorrelationView'), { ssr: false, loading: LoadingFallback });
const EnforcementGap = dynamic(() => import('@/components/EnforcementGap'), { ssr: false, loading: LoadingFallback });
const PressureScore = dynamic(() => import('@/components/PressureScore'), { ssr: false, loading: LoadingFallback });
const PredictiveView = dynamic(() => import('@/components/PredictiveView'), { ssr: false, loading: LoadingFallback });
const HardwareHealth = dynamic(() => import('@/components/HardwareHealth'), { ssr: false, loading: LoadingFallback });
const OffenderTracker = dynamic(() => import('@/components/OffenderTracker'), { ssr: false, loading: LoadingFallback });
const JunctionGap = dynamic(() => import('@/components/JunctionGap'), { ssr: false, loading: LoadingFallback });

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState('command_center');
  const [overview, setOverview] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchAPI('/api/overview').then(setOverview).catch(console.error);
    
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const keyMap = {
        '0': 'command_center',
        '1': 'hotspot',
        '2': 'correlation',
        '3': 'enforcement_gap',
        '4': 'pressure_score',
        '5': 'prediction',
        '6': 'hardware_health',
        '7': 'offender',
        '8': 'junction_gap'
      };
      
      if (keyMap[e.key]) {
        setActiveFeature(keyMap[e.key]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderFeature = () => {
    switch (activeFeature) {
      case 'command_center': return <CommandCenter setActiveFeature={setActiveFeature} />;
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
      <Sidebar 
        activeFeature={activeFeature} 
        setActiveFeature={setActiveFeature} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'margin 0.3s ease' }}>
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
        
        <div key={activeFeature} className="feature-view" style={{ flex: 1, overflow: 'hidden' }}>
          {renderFeature()}
        </div>
      </main>
    </div>
  );
}
