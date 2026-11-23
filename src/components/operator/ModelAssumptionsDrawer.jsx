import React from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';

/**
 * Live Model Assumptions Drawer
 * Collapsible drawer allowing DTC transit planners to adjust:
 * 1. pass_multiplier slider (1.0x - 1.4x): Scales ticketing ground truth to account for student & daily pass holders
 * 2. bus_size selector (Auto / 12m / 9m): Sets denominator capacity for load ratio calculations
 * 3. day_type selector (weekday / weekend)
 * 4. peak_window selector (evening peak / morning peak / all day)
 * Triggers debounced live-refetch of /api/v1/operator/hotspots.
 * Clean, theme-safe monochrome styling with 12px/8px radii.
 */
export function ModelAssumptionsDrawer({
  isOpen,
  onClose,
  passMultiplier,
  onChangePassMultiplier,
  busSize,
  onChangeBusSize,
  dayType,
  onChangeDayType,
  hourRange,
  onChangeHourRange,
  onResetDefaults,
  isLoading
}) {
  const { formatTime } = useSettings();
  if (!isOpen) return null;

  return (
    <div
      className="model-assumptions-drawer ui-card"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '2px solid var(--border-line)',
        padding: '18px 24px',
        color: 'var(--text-primary)',
        animation: 'slideDown 0.2s ease-out',
        borderRadius: '0 0 var(--card-radius, 12px) var(--card-radius, 12px)',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Drawer Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Operational Model Assumptions &amp; Scenario Simulator
            </span>
            {isLoading && (
              <span style={{ fontSize: '11.5px', color: '#3B82F6', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite' }} />
                Recalculating corridor bottlenecks in DuckDB...
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onResetDefaults}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-line)',
                color: 'var(--text-primary)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              title="Reset parameters to DTC baseline (1.2x, Auto)"
            >
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '20px',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '2px 8px'
              }}
              aria-label="Close assumptions drawer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'start'
          }}
        >
          {/* 1. Passenger Multiplier Slider */}
          <div style={{ background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: 'var(--card-radius, 12px)', border: '1px solid var(--border-line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="pass-multiplier-slider" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Passenger Multiplier:
              </label>
              <span
                className="tabular-nums"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-line)'
                }}
              >
                {Number(passMultiplier).toFixed(2)}x
              </span>
            </div>
            <input
              id="pass-multiplier-slider"
              type="range"
              min="1.0"
              max="1.4"
              step="0.05"
              value={passMultiplier}
              onChange={(e) => onChangePassMultiplier(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', margin: '6px 0' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <span>1.0x (Raw Tickets)</span>
              <span>1.2x (DTC Standard)</span>
              <span>1.4x (High Surge)</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
              Scales ticketed boardings to account for Pink Pass holders, student passes, and un-ticketed transfers.
            </div>
          </div>

          {/* 2. Default Vehicle Capacity Selector */}
          <div style={{ background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: 'var(--card-radius, 12px)', border: '1px solid var(--border-line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="bus-size-select" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Fleet Composition / Vehicle Size:
              </label>
              <span
                style={{
                  background: 'var(--bg-card)',
                  color: '#16A34A',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-line)'
                }}
              >
                {busSize === '12m' ? '65 Passengers' : busSize === '9m' ? '42 Passengers' : '50 Passengers'}
              </span>
            </div>
            <select
              id="bus-size-select"
              value={busSize}
              onChange={(e) => onChangeBusSize(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-line)',
                borderRadius: 'var(--input-radius, 8px)',
                padding: '6px 10px',
                fontSize: '12.5px',
                marginTop: '4px',
                cursor: 'pointer'
              }}
            >
              <option value="auto">Auto (Default GTFS Mixed Fleet - 50 Passenger Capacity)</option>
              <option value="12m">12m Low-Floor Standard DTC (65 Passenger Capacity)</option>
              <option value="9m">9m Feeder / Midi Electric (42 Passenger Capacity)</option>
            </select>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
              {'Denominator used to calculate load ratio: Green (≤ 60%), Amber (60%-95%), Red (> 95%).'}
            </div>
          </div>

          {/* 3. Operational Day Type & Peak Window */}
          <div style={{ background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: 'var(--card-radius, 12px)', border: '1px solid var(--border-line)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Service Day &amp; Observation Window:
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => onChangeDayType('weekday')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: dayType === 'weekday' ? '1px solid var(--btn-bg)' : '1px solid var(--border-line)',
                  background: dayType === 'weekday' ? 'var(--btn-bg)' : 'var(--bg-card)',
                  color: dayType === 'weekday' ? 'var(--btn-text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
              >
                Weekday Pattern
              </button>
              <button
                type="button"
                onClick={() => onChangeDayType('weekend')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: dayType === 'weekend' ? '1px solid var(--btn-bg)' : '1px solid var(--border-line)',
                  background: dayType === 'weekend' ? 'var(--btn-bg)' : 'var(--bg-card)',
                  color: dayType === 'weekend' ? 'var(--btn-text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
              >
                Weekend Pattern
              </button>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { label: `Evening Peak (${formatTime('17:00', false)} - ${formatTime('20:00', false)})`, start: 17, end: 20 },
                { label: `Morning Peak (${formatTime('08:00', false)} - ${formatTime('11:00', false)})`, start: 8, end: 11 },
                { label: `Full Day (${formatTime('06:00', false)} - ${formatTime('22:00', false)})`, start: 6, end: 22 }
              ].map((opt, i) => {
                const isSelected = hourRange.start === opt.start && hourRange.end === opt.end;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChangeHourRange(opt.start, opt.end)}
                    style={{
                      flex: 1,
                      padding: '5px 6px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: isSelected ? 600 : 500,
                      border: isSelected ? '1px solid var(--btn-bg)' : '1px solid var(--border-line)',
                      background: isSelected ? 'var(--btn-bg)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--btn-text)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelAssumptionsDrawer;
