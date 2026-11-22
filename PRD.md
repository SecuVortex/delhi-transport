# Product Requirements Document (PRD)
## Smart Public Transport & Bus Traffic Platform (MetroTransit)
### Document Version: 1.0.0 | Status: Approved for Implementation

---

## 1. Document Control & Executive Summary

### 1.1 Product Identification
- **Product Name:** MetroTransit (Smart Public Transport & Bus Traffic Platform)
- **Document Type:** Product Requirements Document (Frontend UI/UX Specification)
- **Target Release:** Production Prototype / Hackathon Demonstration
- **Primary Codebase:** `C:\Users\ayush\.gemini\antigravity\scratch\smart-transit-platform`
- **Application Shell:** Single-Page Web Application (HTML5, Clean CSS, Vanilla ES6+ State Architecture)
- **Zero Build Requirement:** Runs natively in any browser without npm install or build tooling

### 1.2 Purpose & Scope
This PRD defines the comprehensive functional and design specifications for the frontend user interface of MetroTransit. The application provides an intuitive, accessible, high-performance web interface for commuter journey planning, real-time bus telemetry tracking, network corridor congestion monitoring, and incident management.

### 1.3 Out of Scope (Non-Goals)
- Backend database persistence, authentication infrastructure, and server-side APIs are strictly out of scope for this deliverable.
- Real-world proprietary AVL/GPS hardware integration (all telemetry in this deliverable is powered by a simulated client-side feed clearly labeled as demonstration telemetry).

---

## 2. Product Objectives & User Personas

### 2.1 Core Problem Statement
Urban transit commuters and dispatchers face information friction:
1. **Commuter Friction:** Commuters struggle with unclear route alternatives, unpredictable transfer waiting times, vague delay information, and lack of verified step-free accessibility details.
2. **Operator Friction:** Transit operators and dispatchers often lack consolidated, single-pane-of-glass corridor visibility to detect bottlenecks and broadcast detour notices before headways degrade.

### 2.2 Target User Personas
1. **The Daily Commuter (Elena):**
   - Goal: Quickly find the fastest or most convenient transit option between two points with minimum walking distance and zero transfer uncertainty.
   - Behavior: Needs 1-second glanceable route comparisons, clear stop sequence lists, and real-time delay indicators.
2. **The Municipal Transit Dispatcher (Marcus):**
   - Goal: Monitor active fleet adherence, detect corridor bottlenecks, and inspect specific bus telemetry (speed, occupancy, next stop).
   - Behavior: Uses the Live Map and Traffic Analytics dashboard to monitor delays and publish service alerts.

---

## 3. Strict Design Rules & Constraints

The interface must strictly adhere to the following 30 design rules:

| Rule Category | Strict Prohibition | Mandatory Implementation |
| :--- | :--- | :--- |
| **Color Palette** | NO harsh gradients. NO rainbow color schemes. NO neon colors. NO basic pastels. NO unnecessary colorful backgrounds. | Pure white background (#FFFFFF). Restrained functional palette: Primary text #111827, Secondary text #64748B, Border #E5E7EB, Muted surface #F8FAFC, Primary action #2563EB, Success #16A34A, Warning #D97706, Severe #DC2626. |
| **Icons & Imagery**| NO emojis anywhere in the interface. NO sparkle icons or decorative stars. NO unnecessary illustrations. | Inlined Lucide SVG icons only (stroke-width 2, clean line art). |
| **Copywriting** | NO em dash character (strict prohibition). NO cliché copywriting patterns like "It's not X, it's Y". NO fake statistics. | Hyphens (-), colons (:), or parentheses only. Professional, data-driven terminology. All demonstration data clearly identified as simulated. |
| **Layout & Surfaces** | NO liquid glass or glassmorphism. NO colored left-border stripes on cards. NO bento grids. NO unnecessary rounded containers. | Flat solid surfaces. Uniform 1px #E5E7EB borders on all four sides. Traditional structured dashboard grids. Radii strictly between 6px and 10px. |
| **Interaction & Motion** | NO hover scale/translate animations. NO animated arrows. NO decorative motion effects. | Instant or subtle color-only hover transitions. Static crisp Lucide arrows. |
| **Compliance & Links** | NO fake testimonials. NO unnecessary Privacy Policy page or link. NO Terms of Service (TOs) links. | Zero unneeded legal boilerplate. Direct access to operational tools. |
| **Grid System** | NO excessive section spacing. NO visual clutter. | Strict 8px modular spacing system (8px, 16px, 24px, 32px). |

---

## 4. Information Architecture & Navigation Structure

The platform uses a persistent left sidebar (260px wide, collapsible to 72px) paired with a sticky top navigation bar (64px high) and a dynamic main content viewport.

```
+-----------------------------------------------------------------------------------+
|  MetroTransit Logo   | Top Header: Breadcrumbs | Simulated Telemetry Feed | Search | Notif | Profile |
+----------------------+------------------------------------------------------------+
|  NAVIGATION          |                                                            |
|  - Overview          |                                                            |
|  - Journey Planner   |                                                            |
|  - Live Map          |                 ACTIVE PAGE VIEWPORT                       |
|  - Bus Routes        |                                                            |
|  - Traffic Analytics |          (8 Dedicated Functional Screens)                  |
|  - Alerts            |                                                            |
|  ------------------  |                                                            |
|  - Settings          |                                                            |
|  - Help              |                                                            |
|  - Operator Profile  |                                                            |
+----------------------+------------------------------------------------------------+
```

### 4.1 Global Controls
1. **Sidebar Collapse Button:** Toggles the sidebar between expanded (260px) and icon-only collapsed (72px) state.
2. **Mobile Drawer Toggle:** Hamburger menu button visible on screens < 768px for responsive drawer access.
3. **Simulated Telemetry Pill:** Persistent status badge in the header indicating active simulated data stream.
4. **Global Search Input:** Instant keyboard access via `/` shortcut with live search filtering across routes and stops.
5. **Notifications Popover:** Click-activated panel listing unread operational alerts with severity tags.
6. **User Profile Menu:** Compact operator context menu with direct links to settings and help documentation.

---

## 5. Detailed Functional Page Specifications

### 5.1 Page 1: Overview Dashboard (`#page-overview`)
- **Primary Function:** Central operational hub providing an instant high-level snapshot of network health and a quick-entry journey planner.
- **Components:**
  1. **Quick Journey Search Bar:**
     - Starting location input (default: "Central Station").
     - Destination input (default: "West Technology Park").
     - Location swap button (reverses origin and destination instantly).
     - Departure date picker and departure time picker.
     - "Find Routes" button (navigates directly to the Journey Planner with query pre-filled).
  2. **Network Overview KPI Strip (4 structured metric cards):**
     - Active Buses: 248 vehicles (+12 in peak service).
     - Routes Monitored: 42 routes (100% network tracking).
     - Active Incidents: 3 disruptions (2 moderate, 1 severe).
     - Network On-Time Rate: 94.2% (+0.8% compared to yesterday).
  3. **Transit Network Map Preview:**
     - Scalable SVG map showing city street grid, Route 101, Route 104 detour alignment, active bus markers, and major station nodes.
     - "Open Full Map" shortcut button to jump directly to Page 3.
  4. **Recent Service Incidents Table:**
     - Columns: Incident, Corridor, Severity (High, Moderate, Advisory), Reported Time, Status.
  5. **Key Station Departures Table:**
     - Columns: Station Name, Connecting Lines, Next Departure ETA, Status.

### 5.2 Page 2: Journey Planner (`#page-journey`)
- **Primary Function:** Multimodal itinerary planning and comparative route analysis for commuters.
- **Components:**
  1. **Journey Search & Filter Bar:**
     - Origin, Destination, Swap button, Departure Date, Departure Time.
     - Preference filter pills: "Fastest", "Direct", "Min Walk".
     - "Update Search" button to trigger routing recalculation.
  2. **Two-Panel Layout:**
     - **Left Panel (Route Options & Step-by-Step Itinerary):**
       - Route Option 1 (Recommended - Fastest): 28 min total travel time, 1 transfer, Bus 101 to Bus 205, Fare $2.75, 350m walk.
       - Route Option 2 (Direct Service): 36 min, 0 transfers, Bus 104 direct, Fare $2.25, 580m walk.
       - Route Option 3 (Least Walking / Accessible): 34 min, 1 transfer, Bus 102 to Bus 205, Fare $2.75, 160m walk with step-free tactile path.
       - Detailed Step Timeline: Visual vertical timeline showing walking departure, bus boarding platform, intermediate stop count, connection buffer windows, and destination arrival.
     - **Right Panel (Interactive Route Map):**
       - SVG canvas displaying the selected itinerary alignment.
       - Solid blue/green transit lines, dashed grey pedestrian links, origin pin, destination pin, and transfer station node.

### 5.3 Page 3: Live Map & Fleet Tracking (`#page-live-map`)
- **Primary Function:** Real-time geospatial tracking of the active bus fleet, traffic congestion layers, and individual vehicle telemetry.
- **Components:**
  1. **Full-Bleed Map Canvas:**
     - Interactive SVG municipal grid with pan and zoom controls (+ / - buttons).
     - Route lines color-coded by corridor alignment.
  2. **Floating Control Bar (Solid white, 1px border #E5E7EB, no glassmorphism):**
     - Bus ID / stop search input.
     - Layer checkboxes: Buses, Routes, Traffic Congestion Overlay.
     - Zoom in and Zoom out buttons.
  3. **Interactive Bus Markers:**
     - Circular nodes with directional arrows and bus ID badges.
     - Status-coded rings: Green (On Schedule), Amber (Delayed), Red (Severe Delay).
     - Clicking any bus marker selects it and updates the Telemetry Panel.
  4. **Selected Bus Telemetry Panel:**
     - Bus identifier: Bus #101A (Route 101 Downtown Express).
     - Operational status badge: Delayed (+3 min).
     - Direction, current intersection, next stop, and arrival ETA.
     - Passenger occupancy percentage, current speed, and last telemetry ping timestamp.
     - "View Route" and "Follow Bus" action buttons.
  5. **Map Legend:**
     - Normal Flow (< 2 min delay, Green).
     - Moderate Congestion (2 to 5 min delay, Amber).
     - Heavy Congestion (> 5 min delay, Red).
  6. **Telemetry Stream Control:**
     - "Pause Stream" / "Resume Stream" toggle to control the live simulated coordinate ticker.

### 5.4 Page 4: Bus Routes Directory (`#page-routes`)
- **Primary Function:** Comprehensive transit catalog for inspecting operating schedules, corridor types, and stop sequences.
- **Components:**
  1. **Filter & Search Toolbar:**
     - Search input (filters route number, terminal, and via streets).
     - Corridor type filter dropdown (Radial, Crosstown, Circulator, Express, Feeder).
     - Sort dropdown (Route Number, Travel Time, Operating Frequency).
  2. **Split Master-Detail View:**
     - **Left Master Table:** Route Line badge, Route Name, Origin, Destination, Frequency, Duration, Status, and "Details" action button.
     - **Right Detail Card:** Selected route overview, operating hours, on-time adherence rate, and complete vertical stop sequence timeline with transfer links and wheelchair accessibility indicators.

### 5.5 Page 5: Traffic Analytics & Intelligence (`#page-analytics`)
- **Primary Function:** Analytical dashboard for transport planners to identify network bottlenecks and assess schedule adherence.
- **Components:**
  1. **Analytics KPI Row:**
     - Network Average Delay: 3.2 min (-0.4 min improvement).
     - Congestion Index: 36% (Nominal range).
     - Impacted Corridors: 3 of 42 routes.
     - Daily Passengers Monitored: 84,200 (Simulated).
  2. **Hourly Congestion Trend Chart:**
     - SVG bar chart tracking network congestion from 06:00 to 22:00 in 2-hour intervals.
     - Single functional color palette (Blue #2563EB with peak bars highlighted in Warning #D97706; zero rainbow colors).
  3. **Average Delay by Route Chart:**
     - Bar chart comparing schedule variance across lines R-101, R-102, R-104, R-205, R-310, and R-412.
  4. **Congestion Bottlenecks & Hotspots Table:**
     - Columns: Location / Intersection, Congestion Level, Affected Lines, Mean Delay, Primary Cause, and Monitoring Status.

### 5.6 Page 6: Service Alerts & Incidents (`#page-alerts`)
- **Primary Function:** Incident management and detour communication center.
- **Components:**
  1. **Severity Tab Filters:**
     - All Incidents (5), Severe (1), Moderate (2), Advisories (2).
  2. **Structured Incidents Table:**
     - Columns: Alert Type, Location, Affected Corridors, Severity, Reported Time, Status, and "View Details" trigger.
  3. **Incident Detail Modal Dialog:**
     - Accessible pop-up modal displaying full narrative, corridor impact, detour instructions, affected stop list, and estimated clearance time.

### 5.7 Page 7: Platform Settings (`#page-settings`)
- **Primary Function:** User and dispatcher configuration portal.
- **Components:**
  1. **Interface & Appearance:** High-contrast mode toggle (WCAG AAA) and compact table density switch.
  2. **Incident Notifications:** Push alerts for severe road closures and delay alert threshold switch (> 5 min).
  3. **Map Display Preferences:** Default congestion overlay visibility toggle and position smoothing toggle.
  4. **Routing Algorithms:** Walking speed calibration (Relaxed 3.0 km/h, Standard 4.5 km/h, Brisk 6.0 km/h) and step-free accessibility prioritization.
  5. **Actions:** "Restore Defaults" and "Save Configuration" buttons with feedback toast confirmation.

### 5.8 Page 8: Help & Documentation (`#page-help`)
- **Primary Function:** Operational manual, commuter guidance, and accessibility documentation.
- **Components:**
  1. **Quick Start Handbook:** Clear 3-step guide explaining journey search, live vehicle tracking, and alert severity interpretation.
  2. **Keyboard Shortcuts Guide:** Cheatsheet documenting `/` for global search, `Esc` for modal dismissal, and `Tab` for focus traversal.
  3. **Interactive FAQ Accordion:** Expandable questions addressing telemetry refresh intervals, delay calculations, and walking path algorithms.

---

## 6. Accessibility & Compliance Requirements (WCAG 2.2 AA)

MetroTransit is designed to meet strict WCAG 2.2 AA accessibility standards:

1. **Color Contrast Compliance:**
   - Primary text (`#111827`) on white canvas (`#FFFFFF`): 16.1:1 ratio (Exceeds WCAG AAA requirement of 7:1).
   - Secondary text (`#64748B`) on white canvas (`#FFFFFF`): 4.8:1 ratio (Exceeds WCAG AA requirement of 4.5:1).
   - Interactive blue (`#2563EB`) on white canvas: 4.6:1 ratio (Meets WCAG AA standard).
   - Color is never used as the only visual indicator; shapes, text tags, and icons always accompany status.
2. **Keyboard Operability:**
   - Skip to main content link (`.skip-link`) present at DOM root.
   - Visible 2px focus ring (`:focus-visible`) on all interactive buttons, inputs, and toggles.
   - Modal focus trapping with `Escape` key dismissal.
3. **Semantic Markup & ARIA:**
   - Semantic landmarks: `<header role="banner">`, `<aside role="navigation">`, `<main role="main">`, `<div role="dialog">`, `<div role="status">`.
   - All icon buttons feature descriptive `aria-label` attributes.

---

## 7. Responsive Breakpoint Specifications

| Viewport | Screen Width | Layout Adjustments |
| :--- | :--- | :--- |
| **Desktop** | ≥ 1200px | Persistent 260px sidebar. 4-column KPI grid. 2-column overview grid. 460px left panel journey planner. Full analytics charts. |
| **Laptop / Tablet Landscape**| 768px - 1199px | Sidebar collapsible. 2-column KPI grid. Single column overview. 380px journey planner left panel. |
| **Mobile** | < 768px | Sidebar hidden off-canvas (accessible via mobile hamburger button). Stacked single-column layouts. Full-width inputs. Floating panels adapt to full screen width. |

---

## 8. Verification & Acceptance Criteria

| ID | Test Scenario | Expected Outcome |
| :--- | :--- | :--- |
| **TC-01** | Initial Page Load | Application loads instantly at `index.html`. Overview Dashboard is active. Zero console errors. |
| **TC-02** | Sidebar Page Navigation | Clicking any navigation item displays the corresponding view and updates the active breadcrumb. |
| **TC-03** | Quick Search to Journey Planner | Entering origin/dest in Overview and clicking "Find Routes" switches to Journey Planner with inputs populated. |
| **TC-04** | Route Alternative Selection | Clicking a route option in the Journey Planner highlights the card, updates the itinerary timeline, and redraws the map. |
| **TC-05** | Live Map Bus Selection | Clicking any bus node on the Live Map opens the Telemetry Panel with bus ID, speed, next stop, and ETA. |
| **TC-06** | Telemetry Stream Pause | Clicking "Pause Stream" halts coordinate updates; clicking "Resume Stream" restarts the ticker. |
| **TC-07** | Incident Detail Modal | Clicking "View Details" on an alert opens the modal dialog. Pressing `Escape` closes the modal. |
| **TC-08** | Global Search Shortcut | Pressing `/` key immediately focuses the global search input. |
| **TC-09** | Strict Prohibitions Audit | Zero gradients, zero emojis, zero em dashes, zero glassmorphism, zero colored left stripes across all files. |
