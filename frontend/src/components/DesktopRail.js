import React from 'react';
import { features } from '@/lib/config';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function DesktopRail({ activeFeature, setActiveFeature, alerts, expanded = false, onToggle }) {
  return (
    <div className={`desktop-rail ${expanded ? 'expanded' : ''}`}>
      <div className="rail-header">
        <button
          type="button"
          className="rail-toggle"
          onClick={onToggle}
          aria-label={expanded ? 'Collapse navigation panel' : 'Expand navigation panel'}
          title={expanded ? 'Collapse navigation' : 'Expand navigation'}
        >
          {expanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
        {expanded && (
          <div className="rail-brand">
            <strong>CityPulse</strong>
            <span>Parking Intelligence</span>
          </div>
        )}
      </div>
      <div className="rail-icons">
        {features.map(f => {
          const Icon = f.icon;
          const isActive = activeFeature === f.id;
          const hasAlert = alerts[f.alertKey];

          return (
            <button
              key={f.id}
              onClick={() => setActiveFeature(f.id)}
              className={`rail-btn ${isActive ? 'active' : ''}`}
              title={`${f.label} (${f.shortcut})`}
              aria-label={f.label}
            >
              <div className="icon-wrapper">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {hasAlert && <span className="alert-dot" />}
              </div>
              {expanded && (
                <>
                  <span className="rail-label">{f.shortLabel}</span>
                  <span className="rail-shortcut">{f.shortcut}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .desktop-rail {
          width: 100%;
          background: #111827; /* Dark rail inside the white shell */
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 18px 12px;
          gap: 24px;
          border-right: 1px solid var(--border);
          z-index: 10;
          min-width: 0;
        }

        @media (max-width: 1024px) {
          .desktop-rail {
            display: none;
          }
        }

        .rail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 48px;
        }

        .desktop-rail:not(.expanded) .rail-header {
          justify-content: center;
        }

        .rail-toggle {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.06);
          color: #dbeafe;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
          flex: 0 0 auto;
        }

        .rail-toggle:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .rail-brand {
          display: flex;
          flex-direction: column;
          min-width: 0;
          line-height: 1.2;
        }

        .rail-brand strong {
          color: #ffffff;
          font-size: 16px;
          letter-spacing: 0.01em;
        }

        .rail-brand span {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 3px;
        }

        .rail-icons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          align-items: stretch;
        }

        .rail-btn {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0 12px;
          transition: all 0.2s ease;
          min-width: 0;
        }

        .desktop-rail.expanded .rail-btn {
          justify-content: flex-start;
        }

        .rail-btn:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.1);
        }

        .rail-btn.active {
          color: var(--blue);
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .icon-wrapper {
          position: relative;
          display: flex;
          flex: 0 0 auto;
        }

        .rail-label {
          flex: 1;
          min-width: 0;
          text-align: left;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 13px;
          font-weight: 600;
        }

        .rail-shortcut {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .rail-btn.active .rail-shortcut {
          background: rgba(23, 136, 232, 0.1);
          color: var(--blue);
        }

        .alert-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          background: var(--rose);
          border-radius: 50%;
          border: 2px solid #111827;
        }

        .rail-btn.active .alert-dot {
          border-color: #ffffff;
        }
      `}</style>
    </div>
  );
}
