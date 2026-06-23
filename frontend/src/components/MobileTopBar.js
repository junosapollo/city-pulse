import React from 'react';

export default function MobileTopBar() {
  return (
    <div className="mobile-top-bar">
      <div className="logo-area">
        <span className="logo-text">CityPulse</span>
        <span className="logo-subtitle">Bengaluru Parking Intelligence</span>
      </div>

      <style jsx>{`
        .mobile-top-bar {
          display: none;
          height: 60px;
          padding: 0 20px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          align-items: center;
          justify-content: flex-start;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        @media (max-width: 1024px) {
          .mobile-top-bar {
            display: flex;
          }
        }

        .logo-area {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          min-width: 0;
        }

        .logo-text {
          font-weight: 700;
          font-size: 18px;
          color: var(--text);
        }

        .logo-subtitle {
          color: var(--text-muted);
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
