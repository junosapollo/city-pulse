import React from 'react';
import { Calendar } from 'lucide-react';
import { features } from '@/lib/config';

export default function DashboardHeader({ activeFeature, overview }) {
  const currentFeature = features.find(f => f.id === activeFeature);

  return (
    <div className="dashboard-header">
      <div className="header-title">
        <h1>{currentFeature?.label || 'CityPulse'}</h1>
        <p className="subtitle">Real-time Bengaluru Parking Intelligence</p>
      </div>

      <div className="header-actions">
        {overview && (
          <div className="date-badge">
            <Calendar size={14} />
            <span>{overview.date_range.start} - {overview.date_range.end}</span>
          </div>
        )}
      </div>
      <style jsx>{`
        .dashboard-header {
          padding: var(--content-pad);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
        }

        .header-title h1 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .date-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-bar input {
          padding: 8px 16px 8px 36px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          font-size: 14px;
          width: 200px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .search-bar input:focus {
          border-color: var(--blue);
        }

        .search-bar :global(.search-icon) {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: var(--surface-soft);
          border-color: var(--border-strong);
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .action-group {
            width: 100%;
          }
          .search-bar {
            flex: 1;
          }
          .search-bar input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
