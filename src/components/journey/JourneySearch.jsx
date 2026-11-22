import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button.jsx';
import { searchStops } from '../../services/journeyService.js';

const POPULAR_DELHI_STOPS = [
  'Anand Vihar',
  'Connaught Place',
  'Kapashera Border',
  'Nehru Place Terminal',
  'Lajpat Nagar',
  'Rohini Sector 21'
];

/**
 * Journey Search Control Bar Component
 * Clean, accessible form with live stop autocomplete, 1-click Demo Preset,
 * Delhi station suggestion chips, and priority sorting pills.
 */
export function JourneySearch({
  origin,
  onOriginChange,
  destination,
  onDestinationChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  dayType = 'weekday',
  onDayTypeChange,
  onSwap,
  onSearch,
  onDemoPreset,
  priority = 'fastest',
  onPriorityChange
}) {
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  const originRef = useRef(null);
  const destRef = useRef(null);

  // Debounced search for origin stop
  useEffect(() => {
    if (!origin || origin.length < 2) {
      setOriginSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchStops(origin, 8);
      setOriginSuggestions(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [origin]);

  // Debounced search for destination stop
  useEffect(() => {
    if (!destination || destination.length < 2) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchStops(destination, 8);
      setDestSuggestions(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleChipClick = (station) => {
    if (!origin || origin === 'Central Station') {
      onOriginChange(station);
    } else if (!destination || destination === 'West Technology Park') {
      onDestinationChange(station);
    } else {
      onDestinationChange(station);
    }
  };

  return (
    <div className="ui-card journey-search-card" style={{ padding: '20px' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowOriginDrop(false);
          setShowDestDrop(false);
          if (onSearch) onSearch();
        }}
        className="journey-form-wrapper"
      >
        {/* Main Inputs Row */}
        <div className="journey-search-inputs">
          {/* Origin Input with Autocomplete Dropdown */}
          <div className="form-group" style={{ flex: 1.3, minWidth: '180px', position: 'relative' }} ref={originRef}>
            <label className="form-label" htmlFor="journey-origin">
              Origin Stop / Landmark
            </label>
            <div className="input-with-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-prefix-icon">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <input
                id="journey-origin"
                type="text"
                className="form-input"
                value={origin}
                onChange={(e) => {
                  onOriginChange(e.target.value);
                  setShowOriginDrop(true);
                }}
                onFocus={() => setShowOriginDrop(true)}
                placeholder="e.g. Anand Vihar, Rohini..."
                autoComplete="off"
              />
            </div>

            {showOriginDrop && originSuggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {originSuggestions.map((st, i) => (
                  <div
                    key={i}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      onOriginChange(st);
                      setShowOriginDrop(false);
                    }}
                  >
                    {st}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="swap-btn"
            onClick={onSwap}
            aria-label="Swap origin and destination"
            title="Swap locations"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
          </button>

          {/* Destination Input with Autocomplete Dropdown */}
          <div className="form-group" style={{ flex: 1.3, minWidth: '180px', position: 'relative' }} ref={destRef}>
            <label className="form-label" htmlFor="journey-dest">
              Destination Stop
            </label>
            <div className="input-with-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-prefix-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                id="journey-dest"
                type="text"
                className="form-input"
                value={destination}
                onChange={(e) => {
                  onDestinationChange(e.target.value);
                  setShowDestDrop(true);
                }}
                onFocus={() => setShowDestDrop(true)}
                placeholder="e.g. Connaught Place, Lajpat..."
                autoComplete="off"
              />
            </div>

            {showDestDrop && destSuggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {destSuggestions.map((st, i) => (
                  <div
                    key={i}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      onDestinationChange(st);
                      setShowDestDrop(false);
                    }}
                  >
                    {st}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Day Type Selector */}
          {onDayTypeChange && (
            <div className="form-group" style={{ flex: 0.8, minWidth: '110px' }}>
              <label className="form-label" htmlFor="journey-daytype">
                Day Type
              </label>
              <select
                id="journey-daytype"
                className="form-select"
                value={dayType}
                onChange={(e) => onDayTypeChange(e.target.value)}
              >
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
              </select>
            </div>
          )}

          <div className="form-group" style={{ flex: 0.8, minWidth: '100px' }}>
            <label className="form-label" htmlFor="journey-time">
              Departure (IST)
            </label>
            <input
              id="journey-time"
              type="time"
              className="form-input"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
            />
          </div>

          <div className="form-group search-btn-group" style={{ alignSelf: 'flex-end', minWidth: '110px' }}>
            <Button type="submit" variant="primary" style={{ width: '100%', height: '38px' }}>
              Find Routes
            </Button>
          </div>
        </div>

        {/* Secondary Strip: Demo Preset & Popular Stops */}
        <div className="journey-search-secondary">
          <div className="station-chips-group">
            {onDemoPreset && (
              <button
                type="button"
                className="ui-btn ui-btn-sm"
                onClick={onDemoPreset}
                style={{
                  background: 'var(--color-surface-muted)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '11px',
                  padding: '4px 10px',
                  height: '26px'
                }}
                title="1-click Demo Preset: Anand Vihar to Connaught Place (6 PM Weekday)"
              >
                1-Click Demo Preset
              </button>
            )}

            <span className="chips-label">Delhi Hubs:</span>
            <div className="station-chips-list">
              {POPULAR_DELHI_STOPS.map((station) => (
                <button
                  key={station}
                  type="button"
                  className={`station-chip ${origin === station ? 'chip-origin' : destination === station ? 'chip-dest' : ''}`}
                  onClick={() => handleChipClick(station)}
                  title={`Select ${station}`}
                >
                  {station}
                </button>
              ))}
            </div>
          </div>

          {onPriorityChange && (
            <div className="priority-pills-group">
              <span className="chips-label">Sort:</span>
              <div className="priority-pill-buttons">
                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'fastest' ? 'active' : ''}`}
                  onClick={() => onPriorityChange('fastest')}
                >
                  Fastest
                </button>
                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'direct' ? 'active' : ''}`}
                  onClick={() => onPriorityChange('direct')}
                >
                  Fewest Transfers
                </button>
                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'minWalk' ? 'active' : ''}`}
                  onClick={() => onPriorityChange('minWalk')}
                >
                  Least Walking
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
