'use client';
import { useState, useRef, useEffect } from 'react';

export default function StationFilter({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(item => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="filter-bar" style={{ position: 'relative' }} ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="filter-input"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px', justifyContent: 'space-between' }}
      >
        <span>
          {selected.length === options.length 
            ? 'All Stations' 
            : selected.length === 0 
              ? 'No Stations Selected'
              : `${selected.length} Stations Selected`}
        </span>
        <span style={{ fontSize: '0.8rem' }}>▼</span>
      </button>

      {isOpen && (
        <div className="glass-card" style={{ 
          position: 'absolute', 
          top: '100%', 
          left: '16px', 
          marginTop: '8px', 
          width: '300px', 
          zIndex: 1000,
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
            <input 
              type="text" 
              placeholder="Search stations..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="filter-input"
              style={{ width: '100%' }}
              autoFocus
            />
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={selected.length === options.length}
                onChange={toggleAll}
              />
              <strong>Select All</strong>
            </label>
          </div>
          <div className="scrollable-y" style={{ flex: 1, padding: '8px 0' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>No stations found</div>
            ) : (
              filteredOptions.map(opt => (
                <label key={opt} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer', 
                  padding: '8px 16px',
                  transition: 'background 0.2s ease'
                }} className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={selected.includes(opt)}
                    onChange={() => toggleOption(opt)}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        .filter-option:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
