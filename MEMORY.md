# MEMORY.md: Project Long-Term Memory and Recovery Document

## A. Project identity

- Project name: MetroTransit (Smart Public Transport & Bus Traffic Platform)
- Project purpose: Provide a production-quality, accessible, data-dense web application for urban commuter journey planning, real-time bus fleet telemetry monitoring, network corridor congestion analysis, and transit incident coordination.
- Problem being solved: Urban transit commuters struggle with route uncertainty, transfer friction, unclear walking connections, and unexpected delays. Transit dispatchers lack unified, real-time corridor monitoring to detect bottlenecks, adjust headways, and publish detour notices before network degradation occurs.
- Target users: 
  1. Everyday public transit commuters seeking fast, reliable route planning with walking links and step-free accessibility details.
  2. Municipal transit operators, dispatchers, and transport planners monitoring corridor congestion, fleet telemetry, and service disruptions.
- Project type: Modular React Single-Page Web Application (SPA) powered by Vite.
- Current development stage: Phase 4 Complete (Connected to Live FastAPI Backend at http://192.168.0.103:8000 for Delhi Transport Stack Hackathon: Problem 2: Crowdedness-Aware Bus Journey Planner. Grounded in DuckDB querying 2.55M October 2026 Delhi ticket transactions, interactive Leaflet Delhi map, sub-second glanceable Green/Amber/Red crowding pills, confidence badges, segmented per-stretch crowding bars, and operator model assumptions drawer).
- Primary objective: Deliver a clean, minimal, distraction-free interface where users can plan journeys and monitor transit networks without visual clutter, heavy marketing decorations, or unnecessary complexity.
- Main differentiator: Zero decorative bloat; 100% functional data presentation; pure white base canvas (#FFFFFF); restrained status colors; sub-second glanceable route comparisons; integrated vector SVG maps and telemetry inspectors; highly readable, maintainable React codebase designed for easy manual extension; dedicated mobile layouts with 48px touch targets and bottom sheet drawer.

---

## B. Project overview

MetroTransit is a dedicated public transit intelligence and journey coordination web application. It combines commuter trip discovery with operator-grade network surveillance in a unified, professional interface.

Why it exists:
Commercial map tools often bury public bus transit beneath private vehicle navigation, while agency internal tools are often dated, non-responsive, and visually cluttered. MetroTransit demonstrates a modern, accessible interface adhering strictly to minimal visual design principles.

How users interact with it:
- Commuters enter origins and destinations in the Overview or Journey Planner, swap stations with a single click, compare ranked route alternatives (fastest vs. direct vs. minimal walking), review step-by-step stop timelines with platform assignments, and view synchronized SVG journey maps.
- Dispatchers and planners navigate to the Live Map to observe real-time simulated bus markers, inspect individual vehicle telemetry (speed, passenger occupancy, next stop, arrival ETA, schedule variance), toggle traffic congestion heatlines, analyze hourly bottleneck trends on the Analytics page, and manage detour notices on the Alerts page.

Major features:
1. Overview Dashboard: Quick journey search, network overview metrics, interactive SVG map preview, recent service alerts, and key station departure boards.
2. Journey Planner: Origin/destination search, preference filters, ranked route comparison cards, detailed stop progression timeline, and interactive journey alignment map.
3. Live Map & Fleet Tracking: Full-canvas SVG transit network, pan/zoom controls, layer toggles (buses, routes, traffic congestion), clickable bus markers, floating vehicle telemetry panel, and simulated telemetry pause/resume control.
4. Bus Routes Directory: Filterable route directory by corridor type (Radial, Crosstown, Circulator, Express, Feeder), sorting by frequency or duration, and expandable stop sequence timeline with accessibility badges.
5. Traffic Analytics: Average delay KPIs, hourly congestion trend bar chart, route delay distribution chart, and bottleneck hotspot table with primary delay causes.
6. Service Alerts: Tab-filtered incident table (All, Severe, Moderate, Advisory) with an incident detail inspection modal.
7. Platform Settings: High-contrast mode toggle, compact density switch, delay threshold alerts, map overlay defaults, and walking speed calibration.
8. Help & Documentation: Quick-start commuter handbook, keyboard shortcut index, and interactive FAQ accordion.

---

## C. Project technology stack

### Implemented technologies

- Frontend framework: React 18 (`react`, `react-dom`).
- Programming language: JavaScript (ES6+), JSX, HTML5, CSS3.
- Build tool: Vite 5 (`vite`, `@vitejs/plugin-react`).
- Styling system: Custom CSS with CSS variables / design tokens defined in `src/styles/variables.css` and `src/styles/global.css`. Strictly follows an 8px modular spacing system.
- UI component architecture: Modular functional React components with hooks. Clean separation between layout, common UI, feature components, and pages.
- Icon library: Lucide icons (`lucide-react` declared in dependencies; inline SVG fallbacks included for standalone offline execution).
- Routing: Single-page tab state routing managed in `src/App.jsx` using `activePage` state, activating corresponding page view components cleanly.
- Maps: Custom interactive vector SVG maps in `src/components/map/MapView.jsx` providing coordinate scaling, zoom controls, pan offsets, traffic density strokes, and clickable bus/stop nodes without external tile server dependencies.
- Charts: Custom data-driven SVG bar charts for hourly congestion trends and route delay comparisons in `src/pages/TrafficAnalyticsPage.jsx`.
- Data management: Separated into `src/data/` (`demoRoutes.js`, `demoBuses.js`, `demoAlerts.js`) and service layers in `src/services/` (`journeyService.js`, `busService.js`, `trafficService.js`).
- Hooks: Custom React hooks in `src/hooks/` (`useJourneyPlanner.js`, `useMapFilters.js`) for clear separation of UI and business logic.
- Standalone fallback: `standalone.html` and `app.js` are preserved for zero-dependency execution directly via file://.

### Live Backend Integration (Implemented)

- Backend API: FastAPI backend running at `http://192.168.0.103:8000` (OpenAPI: `/openapi.json`).
- Central API client: `src/services/apiClient.js` with 8000ms timeout, URL parameter formatting, error handling, and support for all 11 endpoints.
- Database & Ground truth: DuckDB in-memory analytical query engine operating on October 2026 Delhi Ticketing records (`tickets.parquet`, 2,559,899 tickets, 2,259 routes, 7,552 stops).
- Mapping library: Leaflet (`leaflet` and `leaflet/dist/leaflet.css`) integrated via `src/components/map/DelhiLeafletMap.jsx`, centered on Delhi [28.61, 77.22] with real geographic coordinates.
- Transport: REST only: strictly NO WebSockets and NO 3-5s polling loops.
- Decision pill visualization: Sub-second glanceable Green/Amber/Red crowding badges, confidence indicators (dashed border for LOW), and per-stretch segmented crowding bars.
- Operator features: Dynamic model assumptions drawer (`pass_multiplier` 1.0x-1.4x, `bus_size` auto/12m/9m), 4 live KPI cards from `/api/v1/health`, corridor heatmap from `/crowding/heatmap`, and stretch hotspots from `/crowding/stretch`.
- Proof Modal: `src/components/common/ProofModal.jsx` displaying data grounding, methodology, and documented SQL bug on `/api/v1/operator/hotspots`.

---

## D. Project directory structure

The project follows a standard, highly maintainable modular React architecture:

```
smart-transit-platform/
├── package.json              # Project dependencies and Vite build scripts
├── vite.config.js            # Vite configuration with React plugin
├── index.html                # Vite HTML entrypoint mounting #root
├── standalone.html           # Standalone offline-executable entrypoint (file:// compatible)
├── app.js                    # Standalone state engine and renderer (for standalone.html)
├── styles.css                # Standalone design stylesheet
├── PRD.md                    # Product Requirements Document
├── README.md                 # Technical system documentation and WCAG 2.2 AA audit
├── MEMORY.md                 # Project long-term memory and session recovery document (This file)
└── src/
    ├── main.jsx              # React application DOM entrypoint
    ├── App.jsx               # Root layout coordinator and page view switcher
    ├── constants/
    │   ├── navigation.js     # Page identifiers, labels, badges, and icon keys
    │   └── theme.js          # Design system color and spacing constants
    ├── styles/
    │   ├── variables.css     # CSS custom properties and design tokens
    │   └── global.css        # Reset, focus rings, base cards, tables, layout classes
    ├── utils/
    │   ├── formatTime.js     # Time, duration, and delay formatting helpers
    │   ├── formatDistance.js # Pedestrian distance and walking time calculators
    │   └── formatCurrency.js # Transit fare formatting helpers
    ├── data/
    │   ├── demoRoutes.js     # Route alignments, frequencies, and stop sequences
    │   ├── demoBuses.js      # Active vehicle telemetry data (simulated)
    │   └── demoAlerts.js     # Incidents, hotspots, nearby stops, and journey options
    ├── services/
    │   ├── journeyService.js # Itinerary calculation and alternative ranking
    │   ├── busService.js     # Fleet telemetry query service
    │   └── trafficService.js # Alerts and corridor congestion query service
    ├── hooks/
    │   ├── useJourneyPlanner.js # Custom hook managing search state and routing
    │   └── useMapFilters.js     # Custom hook managing map layers, zoom, and selection
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx    # Persistent collapsible left navigation sidebar
    │   │   ├── Header.jsx     # Top utility bar with search, notifications, profile
    │   │   └── PageLayout.jsx # Standardized page wrapper with title and action bar
    │   ├── common/
    │   │   ├── Button.jsx          # Accessible button with primary/secondary variants
    │   │   ├── Input.jsx           # Form input with label and focus states
    │   │   ├── Modal.jsx           # Accessible modal with Escape key dismiss
    │   │   ├── StatusIndicator.jsx # Contextual status pill badge
    │   │   ├── LoadingState.jsx    # Accessible loading indicator
    │   │   └── EmptyState.jsx      # Clean zero-result fallback container
    │   ├── map/
    │   │   ├── MapView.jsx     # Vector SVG transit map canvas
    │   │   ├── MapControls.jsx # Floating search, layer toggles, and zoom controls
    │   │   └── MapLegend.jsx   # Traffic condition threshold indicator
    │   ├── journey/
    │   │   ├── JourneySearch.jsx # Trip origin, destination, swap, and date/time inputs
    │   │   ├── RouteResult.jsx   # Selectable alternative route card
    │   │   ├── RouteList.jsx     # Ranked list of route alternatives
    │   │   └── RouteDetails.jsx  # Vertical stop sequence and transfer timeline
    │   └── dashboard/
    │       ├── OverviewMetrics.jsx # 4-column KPI metric summary grid
    │       ├── TrafficSummary.jsx  # Key station departure boards
    │       └── RecentAlerts.jsx    # Recent service incidents table
    └── pages/
        ├── OverviewPage.jsx         # Primary dashboard with quick search & map preview
        ├── JourneyPlannerPage.jsx   # 2-panel multimodal itinerary planner
        ├── LiveMapPage.jsx          # Full-screen vehicle tracking & telemetry inspector
        ├── BusRoutesPage.jsx        # Searchable route directory & timetable timeline
        ├── TrafficAnalyticsPage.jsx # Hourly congestion trends & hotspot analytics
        ├── AlertsPage.jsx           # Incident management table & detail modal
        ├── SettingsPage.jsx         # Preferences, accessibility, and routing toggles
        └── HelpPage.jsx             # Commuter handbook, FAQ accordion, keyboard index
```

---

## E. Strict UI/UX design rules

These constraints are mandatory across all existing and future modifications.

### Strictly prohibited

1. NO harsh gradients in buttons, cards, headers, charts, maps, or backgrounds.
2. NO rainbow color schemes.
3. NO emojis anywhere in the interface, code, or documentation.
4. NO liquid glass or glassmorphism (no `backdrop-filter: blur()`).
5. NO em dash character (U+2014). Strictly use standard hyphens (-), colons (:), or parentheses.
6. NO sparkle icons or decorative stars.
7. NO colored left-border stripes on cards, modals, or tables.
8. NO fake testimonials.
9. NO bento grids.
10. NO decorative terminal windows.
11. NO cliché copywriting patterns such as "It's not X, it's Y".
12. NO animated arrows.
13. NO hover animations (no `transform: translateY()`, no bounce, no scale transitions).
14. NO neon colors.
15. NO basic pastel color palettes.
16. NO excessive drop shadows (use flat surfaces or subtle 1px border with `box-shadow: 0 1px 2px rgba(0,0,0,0.05)`).
17. NO decorative motion effects.
18. NO generic repeated three-feature-card layouts.
19. NO unnecessary decorative illustrations.
20. NO fake statistics presented as real data.
21. NO fake live data presented as real (always explicitly label demonstration telemetry as simulated).
22. NO unnecessary Privacy Policy pages or links.
23. NO Terms of Service (TOs) links.
24. NO unnecessary decorative badges.
25. NO unnecessary colorful backgrounds.
26. NO oversized marketing typography (maximum heading is 20px, metric value is 24px).
27. NO excessive rounded containers (corner radii strictly between 6px and 10px).
28. NO visual clutter.
29. NO excessive empty space (adhere strictly to the 8px modular scale).
30. NO unnecessary gradients in any UI element.

### Required UI standards

- Pure white main background: #FFFFFF.
- Lucide icons only (clean vector line art, stroke width 2).
- Inter as the primary font (system fallbacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`). Geist is preferred if loaded; Space Grotesk is permitted.
- Clean, modern, minimal UI with functional visual hierarchy.
- Spacing strictly based on an 8px grid: 8px, 16px, 24px, 32px, 48px.
- Subtle 1px borders (#E5E7EB) on all four sides of cards and containers.
- WCAG 2.2 AA accessibility compliance (contrast > 4.5:1, visible focus indicators, skip-links, semantic ARIA landmarks).
- Predictable, instant user interactions without decorative delays.

### Approved base colors

- Background: #FFFFFF (`--color-background`)
- Muted surface: #F8FAFC (`--color-surface-muted`)
- Surface hover: #F1F5F9 (`--color-surface-hover`)
- Primary text: #111827 (`--color-text`)
- Secondary text: #64748B (`--color-text-secondary`)
- Muted text: #94A3B8 (`--color-text-muted`)
- Border: #E5E7EB (`--color-border`)
- Focus border: #2563EB (`--color-border-focus`)
- Primary action: #2563EB (`--color-primary`)
- Primary action hover: #1D4ED8 (`--color-primary-hover`)
- Success (On time / Low congestion): #16A34A (`--color-success`), Background #F0FDF4
- Warning (Moderate delay / Detour): #D97706 (`--color-warning`), Background #FFFBEB
- Error (Severe delay / Road closure): #DC2626 (`--color-error`), Background #FEF2F2
- Info (Notice): #2563EB (`--color-info`), Background #EFF6FF

---

## F. UI architecture and page structure

The application manages 8 dedicated views toggled dynamically in `src/App.jsx`:

### 1. Overview Dashboard (`src/pages/OverviewPage.jsx`)
- Purpose: Primary landing screen providing instant network status and quick journey lookup.
- Main components:
  - Header with simulation indicator and quick refresh button.
  - Quick Journey Search box with origin, destination, location swap button, date, time, and search trigger.
  - `OverviewMetrics` component (Active Buses, Monitored Routes, Active Incidents, On-Time Adherence).
  - Transit network SVG preview map showing active routes and bus markers.
  - `RecentAlerts` component with recent service incidents.
  - `TrafficSummary` component with key station departures.
- Status: Fully implemented in React and verified.

### 2. Journey Planner (`src/pages/JourneyPlannerPage.jsx`)
- Purpose: Multimodal trip planning and comparative route analysis for commuters.
- Main components:
  - `JourneySearch` bar with origin, destination, swap button, date/time pickers, and preference pills (Fastest, Direct, Min Walk).
  - Left panel: `RouteList` (ranked route option cards with duration, transfer counts, walking distance, fare, and tags) and `RouteDetails` (step-by-step stop progression timeline).
  - Right panel: Interactive SVG route map highlighting the selected alignment, transfer points, and dashed walking paths.
- Status: Fully implemented in React with `useJourneyPlanner` hook and verified.

### 3. Live Map & Fleet Tracking (`src/pages/LiveMapPage.jsx`)
- Purpose: Full-screen geospatial vehicle tracking and congestion monitoring.
- Main components:
  - `MapView` component rendering vector city streets and route paths.
  - `MapControls` component with search input, layer checkboxes (Buses, Routes, Traffic Overlay), zoom in/out controls.
  - Clickable bus markers with directional indicators and status rings.
  - Floating Bus Telemetry Panel: Bus ID, route, direction, speed, next stop, ETA, passenger load, and last ping timestamp.
  - `MapLegend` component.
  - Telemetry pause/resume button.
- Status: Fully implemented in React with `useMapFilters` hook and verified.

### 4. Bus Routes Directory (`src/pages/BusRoutesPage.jsx`)
- Purpose: Comprehensive corridor catalog and timetable schedule inspector.
- Main components:
  - Search and filter bar: text search, corridor dropdown (Radial, Crosstown, Circulator, Express, Feeder), sort selector.
  - Master route table: Line number, route name, origin, destination, frequency, duration, status, and detail button.
  - Selected route detail card: Operating hours, average delay, on-time rate, and vertical stop sequence timeline with transfer connections and wheelchair accessibility indicators.
- Status: Fully implemented in React and verified.

### 5. Traffic Analytics (`src/pages/TrafficAnalyticsPage.jsx`)
- Purpose: Network intelligence dashboard for transport planners.
- Main components:
  - Key performance indicators: Average delay (3.2 min), congestion index (36%), impacted corridors (3 of 42), daily passenger volume (84,200).
  - Hourly Congestion Trend bar chart (06:00 to 22:00) with peak hour identification.
  - Delay Distribution by Route bar chart comparing schedule adherence variance.
  - Congestion Bottlenecks & Hotspots table with delay causes and active monitoring status.
- Status: Fully implemented in React and verified.

### 6. Service Alerts & Incidents (`src/pages/AlertsPage.jsx`)
- Purpose: Incident management, road closure tracking, and detour coordination.
- Main components:
  - Severity tab navigation: All Incidents (5), Severe (1), Moderate (2), Advisories (2).
  - Incidents table: Type, Corridor, Affected lines, Severity pill, Reported time, Status, and "View Details" trigger.
  - `Modal` component displaying narrative description, transit impact analysis, affected corridors, and expected clearance time.
- Status: Fully implemented in React and verified.

### 7. Platform Settings (`src/pages/SettingsPage.jsx`)
- Purpose: Interface customization, accessibility switches, and routing preferences.
- Main components:
  - Interface preferences: High-contrast mode toggle, compact table density switch.
  - Notification triggers: Severe incident push alerts, delay threshold alerts (> 5 min).
  - Map display defaults: Default congestion overlay toggle, vehicle smoothing toggle.
  - Routing calibration: Walking speed selector (Relaxed 3.0 km/h, Standard 4.5 km/h, Brisk 6.0 km/h), step-free access priority toggle.
  - Actions: "Restore Defaults" and "Save Configuration" buttons with accessible feedback toast.
- Status: Fully implemented in React and verified.

### 8. Help & Documentation (`src/pages/HelpPage.jsx`)
- Purpose: Operational guide, commuter handbook, and accessibility shortcuts reference.
- Main components:
  - Quick-start guide cards (Journey Planning, Live Tracking, Alerts).
  - Accessible keyboard shortcuts table (`/` for search, `Esc` for dialogs, `Tab` for focus).
  - Interactive FAQ accordion with expandable answers explaining telemetry refresh rates, delay indicators, and walking calculations.
- Status: Fully implemented in React and verified.

---

## G. Navigation structure

- Sidebar structure (`src/components/layout/Sidebar.jsx`):
  - Fixed width 260px (`--sidebar-width`), collapsible to 72px (`--sidebar-collapsed-width`).
  - Header: MetroTransit logo, "Mobility Intelligence" subtitle, collapse toggle button.
  - Primary navigation links: Overview, Journey Planner, Live Map, Bus Routes (badge "42"), Traffic Analytics, Alerts (badge "3", warning colored).
  - Footer navigation links: Settings, Help, Operator Profile session badge.
  - Active state: Muted background (`#F8FAFC`), primary blue text (`#2563EB`), semi-bold weight (600), subtle border (`#E5E7EB`). Strictly NO colored left-border stripes.
  - Mobile behavior: Hidden off-canvas on screens < 768px; slides into view with `.mobile-open` class.
- Top navigation (`src/components/layout/Header.jsx`):
  - Fixed height 64px (`--header-height`), sticky position (`top: 0`, `z-index: 30`).
  - Left region: Mobile hamburger trigger, contextual breadcrumb navigation, persistent "Simulated Telemetry Feed" status badge.
  - Right region: Global search input with `/` shortcut indicator, notification trigger button with unread badge, and user profile dropdown button.
  - Popovers: Click-outside dismissible popovers for system notifications and operator profile menu.

---

## H. Frontend coding standards

1. Simplicity and Readability:
   - Functional React components with hooks.
   - Code is clean, well-formatted, and easy for student developers to understand and modify manually.
2. Naming Conventions:
   - Components: PascalCase (e.g. `JourneySearch`, `OverviewMetrics`, `MapView`).
   - Functions and hooks: camelCase (e.g. `useJourneyPlanner`, `planJourney`, `formatMinutes`).
   - Constants: UPPER_SNAKE_CASE (e.g. `THEME_COLORS`, `NAV_PAGES`, `DEMO_ROUTES`).
   - CSS variables: kebab-case with `--color-` or `--spacing-` prefixes.
3. State and Data Management:
   - State is kept close to the component that needs it.
   - Complex state is abstracted into custom hooks (`useJourneyPlanner`, `useMapFilters`).
   - Pure functional data formatting utilities in `src/utils/`.
4. Error Handling and Defensive Coding:
   - Default props and fallback values for missing array elements or route parameters.
   - Controlled form inputs with explicit change handlers.

---

## I. Component architecture

- Layout Components:
  - `Sidebar.jsx`: Navigation links, logo, collapse button, mobile drawer.
  - `Header.jsx`: Breadcrumbs, search input, simulation badge, popovers.
  - `PageLayout.jsx`: Page container, header title, action buttons.
- Common UI Components:
  - `Button.jsx`: Primary and secondary buttons with size variants.
  - `Input.jsx`: Form inputs with labels and focus styling.
  - `Modal.jsx`: Centered focus-trapped dialog with Escape dismissal.
  - `StatusIndicator.jsx`: Status pills with semantic color mapping.
  - `LoadingState.jsx`: Accessible loading indicator.
  - `EmptyState.jsx`: Clean zero-result fallback.
- Feature Components:
  - `MapView.jsx`, `MapControls.jsx`, `MapLegend.jsx`: Vector SVG map rendering and controls.
  - `JourneySearch.jsx`, `RouteResult.jsx`, `RouteList.jsx`, `RouteDetails.jsx`: Itinerary planning components.
  - `OverviewMetrics.jsx`, `TrafficSummary.jsx`, `RecentAlerts.jsx`: Dashboard KPI and departure components.

---

## J. Styling architecture

- CSS Strategy: Modular CSS with centralized CSS variables in `src/styles/variables.css` and base layout in `src/styles/global.css`.
- Reset: Box-sizing reset, font smoothing, and focus ring definitions.
- Typography: Inter with Geist preference, strict scale from 11px to 24px.
- Spacing: 8px modular scale (`--spacing-1` through `--spacing-8`).
- Radii: Strictly 6px to 10px (`--radius-sm`, `--radius-md`, `--radius-lg`).
- Zero Gradients / Zero Glassmorphism / Zero Hover Bounce Animations enforced globally.

---

## K. Design tokens

Documented in `src/styles/variables.css`:

```css
:root {
  --color-background: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-surface-hover: #f1f5f9;
  --color-text: #111827;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  --color-border: #e5e7eb;
  --color-border-focus: #2563eb;
  
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  
  --color-success: #16a34a;
  --color-success-bg: #f0fdf4;
  --color-warning: #d97706;
  --color-warning-bg: #fffbeb;
  --color-error: #dc2626;
  --color-error-bg: #fef2f2;
  --color-info: #2563eb;
  --color-info-bg: #eff6ff;

  --font-family: 'Inter', 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;

  --sidebar-width: 260px;
  --sidebar-collapsed-width: 72px;
  --header-height: 64px;

  --shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

---

## L. Data architecture

- Separated Data Modules:
  - `src/data/demoRoutes.js`: 6 full transit corridors with stop sequences and timetable attributes.
  - `src/data/demoBuses.js`: Active bus fleet telemetry coordinates and speeds.
  - `src/data/demoAlerts.js`: Service disruptions, congestion hotspots, station departures, and journey alternatives.
- Clear Simulation Labeling:
  - All real-time telemetry is explicitly identified as simulated demonstration telemetry in the header and UI panels.

---

## M. API and backend integration

- Status: Not implemented (Frontend is fully functional with client-side services in `src/services/`).
- Service Files:
  - `src/services/journeyService.js`: Prepares journey options and applies sorting priorities.
  - `src/services/busService.js`: Queries bus fleet and route timetables.
  - `src/services/trafficService.js`: Queries alerts, hotspots, and station departures.
- Planned Environment Variables:
  - `VITE_TRANSIT_API_URL`: Backend API base URL.
  - `VITE_MAP_TILE_URL`: Map tile service endpoint.
  - `VITE_TELEMETRY_REFRESH_MS`: Polling interval in milliseconds.

---

## N. Current project status

### Completed

- [x] Full modular React application in `src/` adhering strictly to human-readable maintainability requirements.
- [x] Layout components: `Sidebar.jsx`, `Header.jsx`, `PageLayout.jsx`.
- [x] Common UI components: `Button.jsx`, `Input.jsx`, `Modal.jsx`, `StatusIndicator.jsx`, `LoadingState.jsx`, `EmptyState.jsx`.
- [x] Map components: `MapView.jsx`, `MapControls.jsx`, `MapLegend.jsx`.
- [x] Journey components: `JourneySearch.jsx`, `RouteResult.jsx`, `RouteList.jsx`, `RouteDetails.jsx`.
- [x] Dashboard components: `OverviewMetrics.jsx`, `TrafficSummary.jsx`, `RecentAlerts.jsx`.
- [x] All 8 page components: `OverviewPage.jsx`, `JourneyPlannerPage.jsx`, `LiveMapPage.jsx`, `BusRoutesPage.jsx`, `TrafficAnalyticsPage.jsx`, `AlertsPage.jsx`, `SettingsPage.jsx`, `HelpPage.jsx`.
- [x] Custom hooks: `useJourneyPlanner.js`, `useMapFilters.js`.
- [x] Services: `journeyService.js`, `busService.js`, `trafficService.js`.
- [x] Utilities: `formatTime.js`, `formatDistance.js`, `formatCurrency.js`.
- [x] Constants & Theme: `navigation.js`, `theme.js`.
- [x] CSS Variables & Global Styles: `variables.css`, `global.css`.
- [x] Application root & entrypoint: `App.jsx`, `main.jsx`, `index.html`, `vite.config.js`, `package.json`.
- [x] Preserved standalone fallback: `standalone.html` and `app.js`.
- [x] 100% compliance with strict rules: 0 em dashes, 0 emojis, 0 gradients, 0 glassmorphism, 0 bento grids.

### In progress

- None.

### Pending

- [ ] Production backend API connection.
- [ ] Tiled map provider integration (Leaflet or MapLibre GL).
- [ ] LocalStorage persistence for user settings.

### Known issues

- In-memory simulation: Vehicle coordinates jitter along demonstration paths; page reloads reset fleet positions to defaults.

---

## O. Recent development changes

- 2026-11-22: Engineered the initial prototype in `index.html`, `styles.css`, and `app.js`.
- 2026-11-22: Created `PRD.md` and `README.md` defining requirements, tokens, and WCAG 2.2 AA audit.
- 2026-11-22: Authored `MEMORY.md` as the project recovery document.
- 2026-11-22: Refactored the entire frontend into a modular React architecture in `src/`, with dedicated components, hooks, services, utils, data, and constants.
- 2026-11-22: Phase 3 Realistic, Responsive and High-Quality UI Implementation:
  - Created dedicated mobile bottom navigation bar (`src/components/layout/BottomNav.jsx`) with 48px touch targets for smartphones (320px to 768px).
  - Created touch-friendly mobile bottom sheet drawer (`src/components/map/BottomSheet.jsx`) for bus telemetry inspection on small screens.
  - Enhanced native vector transit map (`MapView.jsx`) with Metro River waterway corridor, district zoning labels, secondary streets, and smooth 1.2s cubic-bezier bus position gliding.
  - Added station suggestion quick chips and departure mode options to `JourneySearch.jsx`.
  - Added browser `localStorage` persistence and dynamic `.high-contrast` mode toggling to `SettingsPage.jsx`.
  - Updated standalone distribution files (`standalone.html`, `styles.css`, `app.js`) to stay in 100% feature parity.
- 2026-11-22: Phase 4 Advanced Operational & Commuter Features:
  - Created interactive Station Departure Board modal (`src/components/map/StationModal.jsx` and `standalone.html`), opening upon clicking station hubs (`Central Station`, `Civic Center`, `State Library`, `Tech Park Gate`, `Harbor Point`) with platform bays, scheduled departures, delay variance, and 1-click "Plan Journey from Here".
  - Implemented Corridor Route Alignment Filtering on the Live Map (`MapControls.jsx`, `MapView.jsx`, `app.js`). When a line is selected (e.g. Line 101, 204, 305, 402), that route path is highlighted with boosted stroke width and opacity, while other paths and non-matching buses are dimmed.
  - Engineered client-side CSV Report Export for operations and traffic analytics (`TrafficAnalyticsPage.jsx`, `app.js`), downloading clean structured CSV files of bottleneck delays and monitoring status.
  - Added Recent Searches history persistence to `JourneyPlannerPage.jsx` with 1-click re-search tags backed by browser `localStorage`.
  - Implemented print-optimized media styles (`@media print`) across `styles.css` and `global.css` allowing commuters to print clean, paper-ready itineraries without UI shell clutter.
- 2026-11-22: Verified compliance across all project files with automated Python audits (0 em dashes, 0 emojis, 0 gradients, 0 glassmorphism).

---

## P. Important development decisions

1. Modular React Architecture with Zero Build Lock-in:
   - Decision: Built out the full `src/` React architecture with Vite while preserving `standalone.html` for direct browser execution.
   - Reason: Gives student developers an idiomatic React structure to study and extend, while maintaining 100% offline hackathon demonstration portability.
2. Component Decoupling:
   - Decision: Separated UI components (`src/components/`) from business logic hooks (`src/hooks/`) and data services (`src/services/`).
   - Reason: Allows modifying visual styling or layout without touching data processing or route calculation logic.
3. Native Vector SVG Maps:
   - Decision: Built interactive transit maps using scalable vector graphics (`MapView.jsx`) rather than external map SDKs.
   - Reason: Zero external API keys required, zero tile-loading latency, completely offline and predictable.
4. Mobile-First Bottom Navigation and Bottom Sheet:
   - Decision: Replaced desktop floating cards with fixed bottom navigation and sliding bottom sheet drawer on screens under 768px.
   - Reason: Standard modern transit mobile pattern (Google Maps / Apple Maps style) providing thumb-reachable touch targets without screen clutter.

---

## Q. Manual modification guidelines

- Modifying Theme Tokens: Edit `src/styles/variables.css` or `src/constants/theme.js`.
- Modifying Navigation Links: Edit `src/constants/navigation.js`.
- Modifying Demo Routes: Edit `src/data/demoRoutes.js`.
- Modifying Demo Buses: Edit `src/data/demoBuses.js`.
- Modifying Journey Routing Logic: Edit `src/services/journeyService.js` or `src/hooks/useJourneyPlanner.js`.
- Modifying Map Appearance: Edit `src/components/map/MapView.jsx`.
- Adding a New Page:
  1. Add page ID to `src/constants/navigation.js`.
  2. Create `src/pages/<PageName>Page.jsx` using `PageLayout`.
  3. Mount it conditionally in `src/App.jsx`.

---

## R. Development and execution instructions

### Running via Vite

```bash
cd "C:\Users\ayush\.gemini\antigravity\scratch\smart-transit-platform"
npm run dev
```

### Running the Standalone Version

Double-click `standalone.html` or open in any browser:
`file:///C:/Users/ayush/.gemini/antigravity/scratch/smart-transit-platform/standalone.html`

### Verifying Compliance

```bash
python -c "import os; [print(fn, 'EM-DASH:', '\u2014' in open(fn, encoding='utf-8').read(), 'EMOJI:', any(0x1F300 <= ord(c) <= 0x1FAFF for c in open(fn, encoding='utf-8').read())) for fn in ['PRD.md', 'README.md', 'MEMORY.md', 'standalone.html', 'src/App.jsx']]"
```

---

## S. Deployment information

- Deployment platform: Vercel, Netlify, GitHub Pages, or static web hosting.
- Build command: `npm run build` (outputs to `dist/`) or static serving of `standalone.html`.
- Status: Production prototype ready for deployment.

---

## T. Recovery instructions for a new AI session

1. Read `MEMORY.md` completely.
2. Inspect the `src/` directory to understand the modular React structure.
3. Compare `src/App.jsx` and components with `MEMORY.md`.
4. Respect all 30 strict design rules (0 em dashes, 0 emojis, 0 gradients, pure white #FFFFFF canvas).
5. Keep components small, human-readable, and well-typed.
6. Verify modifications with compliance scripts before completing turns.
7. Update `MEMORY.md` whenever significant changes are made.

---

## U. Next development priorities

1. Backend API integration: Replace mock services with live GTFS Realtime feeds.
2. Route line filtering on map: Highlight specific route alignment on click.
3. Export capability: CSV export for traffic analytics hotspots.
4. Push notification service worker: Real browser web push notifications for severe detour alerts.
