import React from 'react';
import StatsCard from './StatsCard';

export default function MetricStrip({ overview }) {
  if (!overview) {
    return (
      <div className="metric-strip" style={{ padding: '0 var(--content-pad)' }}>
        Loading overview...
      </div>
    );
  }

  return (
    <div className="metric-strip">
      <StatsCard label="Total Violations" value={overview.total_violations.toLocaleString()} color="var(--blue)" />
      <StatsCard label="Total Events" value={overview.total_events.toLocaleString()} color="var(--amber)" />
      <StatsCard label="Active Stations" value={overview.total_stations} color="var(--green)" />
      <StatsCard label="Parking %" value={`${overview.parking_pct.toFixed(1)}%`} color="var(--rose)" />
      
      <style jsx>{`
        .metric-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(160px, 1fr));
          gap: 16px;
          padding: 0 var(--content-pad);
        }

        @media (max-width: 1024px) {
          .metric-strip {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 8px; /* Room for scrollbar */
          }
          
          .metric-strip > :global(*) {
            flex: 0 0 240px;
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  );
}
