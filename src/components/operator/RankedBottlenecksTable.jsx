import React, { useState } from 'react';

/**
 * Ranked Bottleneck Stretches Table
 * Lists high-congestion stretches from /api/v1/operator/hotspots
 * Clicking any table row zooms map to that stretch and opens popup.
 * Fully theme-safe: crisp in Light Mode and Dark Mode.
 */
export function RankedBottlenecksTable({
  hotspots = [],
  selectedStretch = null,
  onSelectStretch = () => {},
  passMultiplier = 1.2,
  isLoading = false
}) {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'RED' | 'AMBER' | 'GREEN'

  // Normalize and sort hotspots by load_ratio descending
  const normalizedHotspots = (hotspots || []).map((h, idx) => {
    const fromStop = h.from_stop || h.from_stop_name || h.start_stop_name || h.from || 'Origin';
    const toStop = h.to_stop || h.to_stop_name || h.end_stop_name || h.to || 'Destination';
    const route = h.route || h.route_id || 'Corridor';

    const rawRatio = h.load_ratio ?? (h.load_factor ?? ((h.capacity_pct || 50) / 100));
    const loadRatio = typeof rawRatio === 'number' && !isNaN(rawRatio) ? rawRatio : 0.5;

    const levelStr = String(h.crowding_level || '').toUpperCase();
    let level = 'GREEN';
    if (levelStr === 'CROWDED' || levelStr === 'RED' || loadRatio > 0.95) {
      level = 'RED';
    } else if (levelStr === 'STANDING_ROOM' || levelStr === 'AMBER' || (loadRatio > 0.60 && loadRatio <= 0.95)) {
      level = 'AMBER';
    }

    let extraBuses = 0;
    if (loadRatio > 1.25) {
      extraBuses = Math.min(6, Math.max(3, Math.ceil((loadRatio - 0.8) * 8)));
    } else if (loadRatio > 0.95) {
      extraBuses = Math.min(3, Math.max(2, Math.ceil((loadRatio - 0.7) * 4)));
    } else if (loadRatio > 0.60) {
      extraBuses = 1;
    }

    const passengerCount =
      h.adjusted_load ??
      (h.passenger_count
        ? Math.round(h.passenger_count * passMultiplier)
        : h.avg_passengers
          ? Math.round(h.avg_passengers * passMultiplier)
          : 1);

    return {
      ...h,
      tableId: h.id || `hotspot-${idx}`,
      fromStop,
      toStop,
      route,
      loadRatio,
      peakLoadPct: Math.round(loadRatio * 100),
      level,
      extraBuses,
      passengerCount
    };
  }).sort((a, b) => b.loadRatio - a.loadRatio);

  const filtered = normalizedHotspots.filter((item) => {
    if (statusFilter !== 'ALL' && item.level !== statusFilter) return false;
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      item.route.toLowerCase().includes(q) ||
      item.fromStop.toLowerCase().includes(q) ||
      item.toStop.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="ranked-bottlenecks-table-card ui-card"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--card-radius, 12px)',
        border: '1px solid var(--border-line)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        marginTop: '20px'
      }}
    >
      {/* Table Header & Filters */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-line)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-subtle)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Ranked Corridor Bottlenecks
            </h2>
            <span
              style={{
                background: 'var(--border-line)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 600
              }}
            >
              {filtered.length} Stretches
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Click any row to pan &amp; zoom Leaflet map to that corridor stretch.
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Status Buttons */}
          <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-card)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-line)' }}>
            {['ALL', 'RED', 'AMBER', 'GREEN'].map((st) => {
              const isActive = statusFilter === st;
              const label = st === 'ALL' ? 'All' : st === 'RED' ? 'Crowded' : st === 'AMBER' ? 'Moderate' : 'Low';
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '3px 9px',
                    fontSize: '11px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? 'var(--btn-bg)' : 'transparent',
                    color: isActive ? 'var(--btn-text)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 120ms ease'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <input
            type="text"
            placeholder="Filter route/stop..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              border: '1px solid var(--border-line)',
              borderRadius: 'var(--input-radius, 8px)',
              outline: 'none',
              width: '160px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-line)', position: 'sticky', top: 0, zIndex: 2 }}>
              <th style={{ padding: '10px 14px', fontWeight: 600, width: '45px' }}>#</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, width: '100px' }}>Route</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>From Stop</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>To Stop</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, width: '120px' }}>Peak Load</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, width: '130px' }}>Crowding Status</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, width: '130px' }}>Extra Buses/hr</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center', width: '90px' }}>Map Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', animation: 'ping 1s infinite' }} />
                    Querying DuckDB corridor bottlenecks...
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No bottlenecks matching current filters.
                </td>
              </tr>
            )}

            {!isLoading && filtered.map((row, index) => {
              const isSelected =
                selectedStretch &&
                ((selectedStretch.tableId && selectedStretch.tableId === row.tableId) ||
                  (selectedStretch.route === row.route &&
                    (selectedStretch.fromStop === row.fromStop || selectedStretch.start_stop_name === row.fromStop)));

              const badgeColor = row.level === 'RED' ? '#DC2626' : row.level === 'AMBER' ? '#D97706' : '#16A34A';
              const badgeBg =
                row.level === 'RED'
                  ? 'rgba(220, 38, 38, 0.12)'
                  : row.level === 'AMBER'
                    ? 'rgba(217, 119, 6, 0.12)'
                    : 'rgba(22, 163, 74, 0.12)';

              return (
                <tr
                  key={row.tableId || index}
                  onClick={() => onSelectStretch(row)}
                  style={{
                    borderBottom: '1px solid var(--border-line)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-subtle)' : 'transparent',
                    transition: 'background-color 100ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    #{index + 1}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {row.route}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {row.fromStop}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {row.toStop}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: badgeColor, minWidth: '38px' }} className="tabular-nums">
                        {row.peakLoadPct}%
                      </span>
                      <div style={{ flex: 1, height: '5px', background: 'var(--border-line)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, row.peakLoadPct)}%`,
                            background: badgeColor,
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: badgeColor,
                        background: badgeBg
                      }}
                    >
                      {row.level === 'RED' ? 'Crowded (>95%)' : row.level === 'AMBER' ? 'Standing Room' : 'Seats Available'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '11.5px',
                        color: row.extraBuses > 0 ? '#DC2626' : '#16A34A',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {row.extraBuses > 0 ? `+${row.extraBuses} buses/hr` : 'Adequate'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStretch(row);
                      }}
                      style={{
                        background: isSelected ? 'var(--btn-bg)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--btn-text)' : 'var(--text-primary)',
                        border: '1px solid var(--border-line)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? 'Viewing' : 'Zoom Map'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RankedBottlenecksTable;
