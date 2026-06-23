import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = "Failed to load data.", onRetry }) {
  return (
    <div className="surface-card error-state">
      <div className="error-icon">
        <AlertCircle size={32} color="var(--rose)" />
      </div>
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="btn-secondary retry-btn" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
      <style jsx>{`
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          min-height: 300px;
          height: 100%;
        }
        .error-icon {
          background: #fff1f2;
          padding: 16px;
          border-radius: 50%;
          margin-bottom: 16px;
        }
        .error-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .error-message {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 400px;
          margin-bottom: 24px;
        }
        .retry-btn {
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
        .retry-btn:hover {
          background: var(--surface-soft);
          border-color: var(--border-strong);
        }
      `}</style>
    </div>
  );
}
