import React, { useRef, useEffect } from 'react';
import { features } from '@/lib/config';

export default function FeatureTabs({ activeFeature, setActiveFeature, alerts }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll active tab into view horizontally without affecting page scroll
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('.active');
      if (activeEl) {
        const container = scrollRef.current;
        const scrollLeft = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeFeature]);

  return (
    <div className="feature-tabs-container">
      <div className="feature-tabs" ref={scrollRef}>
        {features.map(f => {
          const Icon = f.icon;
          const isActive = activeFeature === f.id;
          const hasAlert = alerts[f.alertKey];

          return (
            <button
              key={f.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveFeature(f.id)}
            >
              <div className="icon-wrapper">
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {hasAlert && <span className="alert-dot" />}
              </div>
              <span className="tab-label">{f.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .feature-tabs-container {
          display: none;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 60px; /* Below mobile top bar */
          z-index: 40;
        }

        @media (max-width: 1024px) {
          .feature-tabs-container {
            display: block;
          }
        }

        .feature-tabs {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          padding: 12px 20px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .feature-tabs::-webkit-scrollbar {
          display: none;
        }

        .tab-btn {
          scroll-snap-align: center;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--surface-soft);
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: var(--surface-tint);
          border-color: var(--blue);
          color: var(--blue);
        }

        .icon-wrapper {
          position: relative;
          display: flex;
        }

        .alert-dot {
          position: absolute;
          top: -2px;
          right: -4px;
          width: 6px;
          height: 6px;
          background: var(--rose);
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
