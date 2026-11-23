import React, { useState } from 'react';

/**
 * Ranked Bottleneck Stretches Table
 * Lists high-congestion stretches from /api/v1/operator/hotspots
 * Clicking any table row zooms map to that stretch and opens popup.
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

    const passengerCount = h.adjusted_load ?? (h.passenger_count ? Math.round(h.passenger_count * passMultiplier) : (h.avg_passengers ? Math.round(h.avg_passengers * passMultiplier) : 1));

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
    <div className="ranked-bottlenecks-table-card" style={{
      background: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      marginTop: '20px'
    }}>
      {/* Table Header & Filters */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        background: '#F8FAFC'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Ranked Corridor Bottlenecks (/api/v1/operator/hotspots)
            </h2>
            <span style={{
              background: '#E2E8F0',
              color: '#334155',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 600
            }}>
              {filtered.length} Stretches
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
            Click any row to automatically pan and zoom the Leaflet map to that critical stretch.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Level Filter Pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'ALL', label: 'All Stretches' },
              { id: 'RED', label: 'Crowded (>95%)', color: '#DC2626' },
              { id: 'AMBER', label: 'Standing Room', color: '#D97706' },
              { id: 'GREEN', label: 'Seats Available', color: '#16A34A' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: statusFilter === f.id ? '1px solid #3B82F6' : '1px solid #CBD5E1',
                  background: statusFilter === f.id ? '#2563EB' : '#FFFFFF',
                  color: statusFilter === f.id ? '#FFFFFF' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search route or stop..."
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              outline: 'none',
              width: '180px'
            }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', color: '#475569', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 2 }}>
              <th style={{ padding: '9px 14px', fontWeight: 600, width: '45px' }}>#</th>
              <th style={{ padding: '9px 14px', fontWeight: 600, width: '110px' }}>Route</th>
              <th style={{ padding: '9px 14px', fontWeight: 600 }}>From Stop (Origin)</th>
              <th style={{ padding: '9px 14px', fontWeight: 600 }}>To Stop (Destination)</th>
              <th style={{ padding: '9px 14px', fontWeight: 600, width: '120px' }}>Peak Load</th>
              <th style={{ padding: '9px 14px', fontWeight: 600, width: '130px' }}>Crowding Status</th>
              <th style={{ padding: '9px 14px', fontWeight: 600, width: '140px' }}>Extra Buses/hr</th>
              <th style={{ padding: '9px 14px', fontWeight: 600, textAlign: 'center', width: '90px' }}>Map Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', animation: 'ping 1s infinite' }} />
                    Querying DuckDB corridor bottlenecks...
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                  No bottlenecks matching current filters.
                </td>
              </tr>
            )}

            {!isLoading && filtered.map((row, index) => {
              const isSelected = selectedStretch && (
                (selectedStretch.tableId && selectedStretch.tableId === row.tableId) ||
                (selectedStretch.route === row.route && (selectedStretch.fromStop === row.fromStop || selectedStretch.start_stop_name === row.fromStop))
              );

              const badgeColor = row.level === 'RED' ? '#DC2626' : row.level === 'AMBER' ? '#D97706' : '#16A34A';
              const badgeBg = row.level === 'RED' ? '#FEE2E2' : row.level === 'AMBER' ? '#FEF3C7' : '#DCFCE7';

              return (
                <tr
                  key={row.tableId || index}
                  onClick={() => onSelectStretch(row)}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    background: isSelected ? '#EFF6FF' : index % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    transition: 'background-color 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F1F5F9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#64748B' }}>
                    #{index + 1}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#2563EB' }}>
                    {row.route}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1E293B' }}>
                    {row.fromStop}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>
                    {row.toStop}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: badgeColor, minWidth: '40px' }}>
                        {row.peakLoadPct}%
                      </span>
                      <div style={{ flex: 1, height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, row.peakLoadPct)}%`,
                          background: badgeColor,
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: badgeColor,
                      background: badgeBg
                    }}>
                      {row.level === 'RED' ? 'Crowded (>95%)' : row.level === 'AMBER' ? 'Standing Room' : 'Seats Available'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '12px',
                      color: row.extraBuses > 0 ? '#DC2626' : '#16A34A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
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
                        background: isSelected ? '#2563EB' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#2563EB',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
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
