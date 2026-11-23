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
      className="model-assumptions-drawer"
      style={{
        background: '#0F172A',
        borderBottom: '2px solid #3B82F6',
        padding: '18px 24px',
        color: '#F8FAFC',
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Drawer Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: '#2563EB',
              color: '#FFFFFF'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#F1F5F9' }}>
              Live Operational Model Assumptions & Scenario Simulator
            </span>
            {isLoading && (
              <span style={{ fontSize: '11px', color: '#60A5FA', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60A5FA', animation: 'pulse 1s infinite' }} />
                Recalculating corridor bottlenecks in DuckDB...
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onResetDefaults}
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                color: '#94A3B8',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
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
                color: '#94A3B8',
                fontSize: '18px',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '2px 6px'
              }}
              aria-label="Close assumptions drawer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}>
          {/* 1. Passenger Multiplier Slider */}
          <div style={{ background: '#1E293B', padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="pass-multiplier-slider" style={{ fontSize: '12.5px', fontWeight: 600, color: '#E2E8F0' }}>
                Passenger Multiplier (Pass / Un-ticketed):
              </label>
              <span style={{
                background: '#0F172A',
                color: '#38BDF8',
                fontWeight: 700,
                fontSize: '13px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
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
              style={{ width: '100%', accentColor: '#38BDF8', cursor: 'pointer', margin: '6px 0' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B' }}>
              <span>1.0x (Raw ETM Tickets)</span>
              <span>1.2x (DTC Standard)</span>
              <span>1.4x (High Peak Surge)</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', lineHeight: 1.4 }}>
              Scales ticketed boardings to account for Pink Pass holders, student passes, and un-ticketed transfers.
            </div>
          </div>

          {/* 2. Default Vehicle Capacity Selector */}
          <div style={{ background: '#1E293B', padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="bus-size-select" style={{ fontSize: '12.5px', fontWeight: 600, color: '#E2E8F0' }}>
                Fleet Composition / Vehicle Size:
              </label>
              <span style={{
                background: '#0F172A',
                color: '#4ADE80',
                fontWeight: 700,
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {busSize === '12m' ? '65 Passengers' : busSize === '9m' ? '42 Passengers' : '50 Passengers'}
              </span>
            </div>
            <select
              id="bus-size-select"
              value={busSize}
              onChange={(e) => onChangeBusSize(e.target.value)}
              style={{
                width: '100%',
                background: '#0F172A',
                color: '#F8FAFC',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12.5px',
                marginTop: '4px',
                cursor: 'pointer'
              }}
            >
              <option value="auto">Auto (Default GTFS Mixed Fleet - 50 Pax Capacity)</option>
              <option value="12m">12m Low-Floor Standard DTC (65 Pax Capacity)</option>
              <option value="9m">9m Feeder / Midi Electric (42 Pax Capacity)</option>
            </select>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px', lineHeight: 1.4 }}>
              Denominator used for calculate load ratio: Green (&le;60%), Amber (60%-95%), Red (&gt;95%).
            </div>
          </div>

          {/* 3. Operational Day Type & Peak Window */}
          <div style={{ background: '#1E293B', padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
              Service Day & Observation Window:
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => onChangeDayType('weekday')}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: dayType === 'weekday' ? '1px solid #3B82F6' : '1px solid #334155',
                  background: dayType === 'weekday' ? '#2563EB' : '#0F172A',
                  color: dayType === 'weekday' ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                Weekday Pattern
              </button>
              <button
                type="button"
                onClick={() => onChangeDayType('weekend')}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: dayType === 'weekend' ? '1px solid #3B82F6' : '1px solid #334155',
                  background: dayType === 'weekend' ? '#2563EB' : '#0F172A',
                  color: dayType === 'weekend' ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
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
                      padding: '4px 6px',
                      borderRadius: '4px',
                      fontSize: '10.5px',
                      fontWeight: 500,
                      border: isSelected ? '1px solid #38BDF8' : '1px solid #334155',
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0F172A',
                      color: isSelected ? '#38BDF8' : '#64748B',
                      cursor: 'pointer'
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
