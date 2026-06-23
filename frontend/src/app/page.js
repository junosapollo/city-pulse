'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppShell from '@/components/AppShell';
import DashboardHeader from '@/components/DashboardHeader';
import MetricStrip from '@/components/MetricStrip';
import { fetchAPI } from '@/lib/api';
import CommandCenter from '@/components/CommandCenter';

const LoadingFallback = () => (
  <div style={{ padding: 'var(--content-pad)', height: '100%' }}>
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
  const [alerts, setAlerts] = useState({});

  useEffect(() => {
    fetchAPI('/api/overview').then(setOverview).catch(console.error);
    fetchAPI('/api/command-center').then(data => {
      if (data) {
        setAlerts({
          hardware_health: data.flagged_devices_count > 0,
          offender: data.active_offenders_count > 0,
          pressure_score: data.top_pressure_stations && data.top_pressure_stations.some(s => s.pressure_score > 0.7)
        });
      }
    }).catch(console.error);
    
    const handleKeyDown = (e) => {
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
      default: return <CommandCenter setActiveFeature={setActiveFeature} />;
    }
  };

  return (
    <AppShell activeFeature={activeFeature} setActiveFeature={setActiveFeature} alerts={alerts}>
      <DashboardHeader activeFeature={activeFeature} overview={overview} />
      
      {activeFeature === 'command_center' && (
        <div style={{ marginBottom: '24px' }}>
          <MetricStrip overview={overview} />
        </div>
      )}
      
      <div key={activeFeature} className="feature-view" style={{ flex: 1, padding: '0 var(--content-pad) var(--content-pad)' }}>
        {renderFeature()}
      </div>
    </AppShell>
  );
}
