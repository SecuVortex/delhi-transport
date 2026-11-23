import React from 'react';

/**
 * Running Yellow Bus Project Logo
 * Minimalist, classy Delhi DTC-inspired yellow bus with subtle suspension bounce,
 * rotating wheels, and animated road speed dashes.
 * Respects `prefers-reduced-motion: reduce`.
 */
export function RunningBusLogo({ size = 32, animated = true, className = '' }) {
  // Compute dimensions preserving aspect ratio (48x32 = 1.5 : 1)
  const width = typeof size === 'number' ? size * 1.5 : size;
  const height = size;

  return (
    <div
      className={`running-bus-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        verticalAlign: 'middle',
        flexShrink: 0
      }}
      aria-label="MetroTransit Yellow Bus Logo"
      role="img"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 54 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="headlight-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>{`
            @keyframes busBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-1px); }
            }
            @keyframes wheelSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes roadSlide {
              0% { transform: translateX(0); }
              100% { transform: translateX(-16px); }
            }

            .bus-animated-body {
              animation: ${animated ? 'busBounce 0.45s ease-in-out infinite' : 'none'};
              transform-origin: center bottom;
            }
            .bus-animated-wheel {
              animation: ${animated ? 'wheelSpin 0.5s linear infinite' : 'none'};
            }
            .bus-animated-road {
              animation: ${animated ? 'roadSlide 0.4s linear infinite' : 'none'};
            }

            @media (prefers-reduced-motion: reduce) {
              .bus-animated-body,
              .bus-animated-wheel,
              .bus-animated-road {
                animation: none !important;
              }
            }
          `}</style>
        </defs>

        {/* Animated Speed / Road Track Dashes underneath */}
        {animated && (
          <g className="bus-animated-road" opacity="0.38">
            <line x1="0" y1="31" x2="10" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="31" x2="28" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="31" x2="48" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="54" y1="31" x2="66" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* Bus Chassis (Bouncing Body) */}
        <g className="bus-animated-body">
          {/* Main Bus Body */}
          <rect x="4" y="6" width="44" height="18" rx="4" fill="#FACC15" />
          
          {/* Dark Roof Trim Line */}
          <path d="M4 10C4 7.79086 5.79086 6 8 6H44C46.2091 6 48 7.79086 48 10V11H4V10Z" fill="#CA8A04" />

          {/* Lower Aerodynamic Accent Stripe */}
          <rect x="4" y="21" width="44" height="2" fill="#EAB308" />

          {/* Front Windshield (curved edge) */}
          <path
            d="M36 9H43C44.6569 9 46 10.3431 46 12V17H36V9Z"
            fill="#18181B"
          />

          {/* Passenger Windows */}
          <rect x="8" y="9" width="6.5" height="8" rx="1.5" fill="#18181B" />
          <rect x="17" y="9" width="6.5" height="8" rx="1.5" fill="#18181B" />
          <rect x="26" y="9" width="7.5" height="8" rx="1.5" fill="#18181B" />

          {/* Destination Header Display ("DTC") */}
          <rect x="36" y="7.2" width="7" height="1.4" rx="0.5" fill="#18181B" />

          {/* Glowing Front Headlight */}
          <circle cx="47" cy="19.5" r="1.5" fill="#FEF08A" filter="url(#headlight-glow)" />

          {/* Rear Taillight */}
          <rect x="3.5" y="18" width="1.5" height="3" rx="0.5" fill="#EF4444" />

          {/* Front Bumper / Grill Accent */}
          <rect x="46.5" y="21" width="1.5" height="2.5" rx="0.5" fill="#71717A" />

          {/* Wheel Arch Cutouts */}
          <path d="M11 24C11 21.7909 12.7909 20 15 20C17.2091 20 19 21.7909 19 24H11Z" fill="#CA8A04" />
          <path d="M33 24C33 21.7909 34.7909 20 37 20C39.2091 20 41 21.7909 41 24H33Z" fill="#CA8A04" />

          {/* Rear Wheel Assembly */}
          <g transform="translate(15, 24)">
            <circle cx="0" cy="0" r="4.2" fill="#18181B" />
            <circle cx="0" cy="0" r="2.2" fill="#71717A" stroke="#E4E4E7" strokeWidth="0.8" />
            <g className="bus-animated-wheel">
              <line x1="-2" y1="0" x2="2" y2="0" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="0" y1="-2" x2="0" y2="2" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          </g>

          {/* Front Wheel Assembly */}
          <g transform="translate(37, 24)">
            <circle cx="0" cy="0" r="4.2" fill="#18181B" />
            <circle cx="0" cy="0" r="2.2" fill="#71717A" stroke="#E4E4E7" strokeWidth="0.8" />
            <g className="bus-animated-wheel">
              <line x1="-2" y1="0" x2="2" y2="0" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="0" y1="-2" x2="0" y2="2" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
