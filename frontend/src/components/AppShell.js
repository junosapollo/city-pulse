import React, { useState } from 'react';
import DesktopRail from './DesktopRail';
import MobileTopBar from './MobileTopBar';
import FeatureTabs from './FeatureTabs';

export default function AppShell({ activeFeature, setActiveFeature, alerts, children }) {
  const [railExpanded, setRailExpanded] = useState(false);

  return (
    <div className={`dashboard-frame ${railExpanded ? 'rail-expanded' : ''}`}>
      <DesktopRail
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        alerts={alerts}
        expanded={railExpanded}
        onToggle={() => setRailExpanded(prev => !prev)}
      />
      <div className="shell-content">
        <MobileTopBar />
        <FeatureTabs activeFeature={activeFeature} setActiveFeature={setActiveFeature} alerts={alerts} />
        <main className="main-content scrollable-y">
          {children}
        </main>
      </div>
      <style jsx>{`
        .dashboard-frame {
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr);
          overflow-x: clip;
          transition: grid-template-columns 0.22s ease;
        }

        .dashboard-frame.rail-expanded {
          grid-template-columns: 248px minmax(0, 1fr);
        }

        @media (max-width: 1024px) {
          .dashboard-frame {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .shell-content {
          display: flex;
          flex-direction: column;
          height: 100vh;
          min-width: 0;
        }

        @media (min-width: 1025px) {
          .shell-content {
            height: calc(100vh - 48px);
          }
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
