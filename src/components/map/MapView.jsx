import React from 'react';

/**
 * Realistic Vector Transit Map Component
 * Renders street network, geographic waterway corridor, district zones,
 * active bus markers with smooth gliding transition, route paths, and interactive station nodes.
 */
export function MapView({
  buses = [],
  selectedBusId,
  onSelectBus,
  selectedRouteFilter = 'all',
  onSelectStation,
  layers = { buses: true, routes: true, traffic: true },
  zoomLevel = 1,
  className = ''
}) {
  const viewBoxWidth = 800 / zoomLevel;
  const viewBoxHeight = 550 / zoomLevel;
  const viewBoxX = (800 - viewBoxWidth) / 2;
  const viewBoxY = (550 - viewBoxHeight) / 2;

  // Route highlight calculation
  const getRouteOpacity = (routeNumber) => {
    if (selectedRouteFilter === 'all') return 0.85;
    return selectedRouteFilter === routeNumber ? 1.0 : 0.2;
  };

  const getRouteStrokeWidth = (routeNumber, baseWidth) => {
    if (selectedRouteFilter === 'all') return baseWidth;
    return selectedRouteFilter === routeNumber ? baseWidth + 1.5 : baseWidth - 1;
  };

  return (
    <div className={`live-map-canvas ${className}`.trim()} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        style={{ background: '#f8fafc', display: 'block' }}
      >
        <defs>
          {/* Subtle grid pattern for map coordinates */}
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="800" height="550" fill="url(#mapGrid)" />

        {/* Geographic Waterway / River Corridor */}
        <path
          d="M 0,210 C 180,240 260,180 420,220 C 560,260 680,210 800,230 L 800,275 C 680,255 560,305 420,265 C 260,225 180,285 0,255 Z"
          fill="#e2e8f0"
          opacity="0.6"
        />
        <text x="730" y="250" fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="2" textAnchor="end">
          METRO RIVER
        </text>

        {/* Urban District Labels */}
        <g fill="#94a3b8" fontSize="9" fontWeight="700" letterSpacing="1.5" textAnchor="middle">
          <text x="140" y="70">UNIVERSITY QUARTER</text>
          <text x="620" y="70">TECH CORRIDOR</text>
          <text x="210" y="490">CIVIC & FINANCIAL</text>
          <text x="660" y="490">HARBOR & LOGISTICS</text>
        </g>

        {/* Secondary Street Network */}
        <g stroke="#e2e8f0" strokeWidth="1.5" opacity="0.8">
          <line x1="40" y1="100" x2="760" y2="100" />
          <line x1="40" y1="220" x2="760" y2="220" />
          <line x1="40" y1="340" x2="760" y2="340" />
          <line x1="40" y1="460" x2="760" y2="460" />

          <line x1="60" y1="40" x2="60" y2="510" />
          <line x1="180" y1="40" x2="180" y2="510" />
          <line x1="320" y1="40" x2="320" y2="510" />
          <line x1="480" y1="40" x2="480" y2="510" />
          <line x1="680" y1="40" x2="680" y2="510" />
        </g>

        {/* Primary Arterials */}
        <g stroke="#cbd5e1" strokeWidth="2.5">
          <line x1="40" y1="160" x2="760" y2="160" />
          <line x1="40" y1="280" x2="760" y2="280" />
          <line x1="40" y1="400" x2="760" y2="400" />

          <line x1="120" y1="40" x2="120" y2="500" />
          <line x1="240" y1="40" x2="240" y2="500" />
          <line x1="400" y1="40" x2="400" y2="500" />
          <line x1="580" y1="40" x2="580" y2="500" />
        </g>

        {/* Street Names */}
        <g fill="#94a3b8" fontSize="8" fontWeight="600">
          <text x="50" y="154">NORTH EXPRESSWAY</text>
          <text x="50" y="274">CENTRAL BOULEVARD</text>
          <text x="50" y="394">HARBOR PARKWAY</text>
          <text x="124" y="485" transform="rotate(-90 124,485)">1ST AVE</text>
          <text x="244" y="485" transform="rotate(-90 244,485)">CIVIC AVE</text>
          <text x="404" y="485" transform="rotate(-90 404,485)">METRO AVE</text>
          <text x="584" y="485" transform="rotate(-90 584,485)">TECH PKWY</text>
        </g>

        {/* Traffic Congestion Corridors */}
        {layers.traffic && (
          <g>
            {/* Moderate congestion on Central Blvd */}
            <line x1="240" y1="280" x2="400" y2="280" stroke="#d97706" strokeWidth="6" strokeOpacity="0.45" strokeLinecap="round" />
            {/* Heavy delay on Metro Ave */}
            <line x1="400" y1="280" x2="400" y2="380" stroke="#dc2626" strokeWidth="6" strokeOpacity="0.5" strokeLinecap="round" />
            {/* Free flow sections */}
            <line x1="120" y1="400" x2="240" y2="400" stroke="#16a34a" strokeWidth="6" strokeOpacity="0.4" strokeLinecap="round" />
            <line x1="400" y1="160" x2="580" y2="160" stroke="#16a34a" strokeWidth="6" strokeOpacity="0.4" strokeLinecap="round" />
          </g>
        )}

        {/* Transit Route Alignments with Dynamic Highlighting */}
        {layers.routes && (
          <g>
            {/* Route 101 - Primary Spine */}
            <path
              d="M 120,400 L 240,400 L 240,280 L 400,280 L 400,160 L 580,160"
              fill="none"
              stroke="#2563eb"
              strokeWidth={getRouteStrokeWidth('101', 4)}
              strokeOpacity={getRouteOpacity('101')}
              strokeLinejoin="round"
            />
            {/* Route 204 - Civic Loop */}
            <path
              d="M 120,400 L 120,280 L 280,280 L 280,100 L 360,100"
              fill="none"
              stroke="#64748b"
              strokeWidth={getRouteStrokeWidth('204', 3.5)}
              strokeOpacity={getRouteOpacity('204')}
              strokeLinejoin="round"
            />
            {/* Route 305 - Harbor Feeder */}
            <path
              d="M 240,280 L 400,280 L 400,380 L 620,380"
              fill="none"
              stroke="#d97706"
              strokeWidth={getRouteStrokeWidth('305', 3.5)}
              strokeOpacity={getRouteOpacity('305')}
              strokeLinejoin="round"
            />
            {/* Route 402 - Ring Feeder (dashed) */}
            <path
              d="M 180,440 L 460,440 L 520,240 L 320,120 L 180,240 Z"
              fill="none"
              stroke="#16a34a"
              strokeWidth={getRouteStrokeWidth('402', 3)}
              strokeDasharray="8,5"
              strokeOpacity={getRouteOpacity('402')}
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Interactive Transit Stations & Transfer Hubs */}
        <g>
          {/* Central Station */}
          <g
            transform="translate(120, 400)"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectStation && onSelectStation('Central Station')}
          >
            <circle cx="0" cy="0" r="14" fill="#2563eb" fillOpacity="0.08" />
            <circle cx="0" cy="0" r="7" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="3" fill="#2563eb" />
            <text x="0" y="20" fontSize="10" fontWeight="700" fill="#111827" textAnchor="middle">
              Central Station
            </text>
            <text x="0" y="30" fontSize="8" fill="#64748b" textAnchor="middle">
              Hub (R101, R204)
            </text>
          </g>

          {/* Civic Center */}
          <g
            transform="translate(240, 280)"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectStation && onSelectStation('Civic Center')}
          >
            <circle cx="0" cy="0" r="12" fill="#111827" fillOpacity="0.06" />
            <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="2.5" fill="#111827" />
            <text x="0" y="19" fontSize="10" fontWeight="700" fill="#111827" textAnchor="middle">
              Civic Center
            </text>
          </g>

          {/* State Library */}
          <g
            transform="translate(400, 160)"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectStation && onSelectStation('State Library')}
          >
            <circle cx="0" cy="0" r="12" fill="#111827" fillOpacity="0.06" />
            <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="2.5" fill="#111827" />
            <text x="0" y="19" fontSize="10" fontWeight="700" fill="#111827" textAnchor="middle">
              State Library
            </text>
          </g>

          {/* Tech Park Gate */}
          <g
            transform="translate(580, 160)"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectStation && onSelectStation('Tech Park Gate')}
          >
            <circle cx="0" cy="0" r="14" fill="#2563eb" fillOpacity="0.08" />
            <circle cx="0" cy="0" r="7" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="3" fill="#2563eb" />
            <text x="0" y="20" fontSize="10" fontWeight="700" fill="#111827" textAnchor="middle">
              Tech Park Gate
            </text>
          </g>

          {/* Harbor Point */}
          <g
            transform="translate(620, 380)"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectStation && onSelectStation('Harbor Point')}
          >
            <circle cx="0" cy="0" r="12" fill="#111827" fillOpacity="0.06" />
            <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="2.5" fill="#111827" />
            <text x="0" y="19" fontSize="10" fontWeight="700" fill="#111827" textAnchor="middle">
              Harbor Point
            </text>
          </g>
        </g>

        {/* Active Bus Markers with Smooth Vector Transition */}
        {layers.buses &&
          buses.map((bus) => {
            const isSelected = bus.id === selectedBusId;
            const matchesRoute =
              selectedRouteFilter === 'all' || bus.routeNumber === selectedRouteFilter;
            const opacity = matchesRoute ? 1.0 : 0.3;

            const strokeColor =
              bus.statusType === 'error'
                ? '#dc2626'
                : bus.statusType === 'warning'
                ? '#d97706'
                : '#2563eb';

            return (
              <g
                key={bus.id}
                className="map-bus-marker"
                transform={`translate(${bus.x}, ${bus.y})`}
                opacity={opacity}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 250ms ease'
                }}
                onClick={() => onSelectBus && onSelectBus(bus.id)}
              >
                {/* Selection pulse ring */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="18"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                  />
                )}

                {/* Outer marker body */}
                <circle
                  cx="0"
                  cy="0"
                  r="11"
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                />

                {/* Inner center dot */}
                <circle cx="0" cy="0" r="4.5" fill={strokeColor} />

                {/* Bus identifier pill */}
                <rect
                  x="-25"
                  y="-25"
                  width="50"
                  height="16"
                  rx="4"
                  fill="#111827"
                  fillOpacity="0.92"
                />
                <text
                  x="0"
                  y="-14"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  letterSpacing="0.5"
                >
                  {bus.id}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
