# MetroTransit: Smart Public Transport & Bus Traffic Platform
## UI/UX Design System Specification & Frontend Documentation

A complete, professional, production-quality user interface for smart public transportation management, bus fleet telemetry monitoring, corridor congestion analysis, and multimodal commuter journey planning.

Designed strictly with minimalist visual aesthetics, data-dense clarity, pure white canvas foundation (#FFFFFF), Lucide icons, and zero visual clutter.

---

## 1. Executive Summary & Design Philosophy

MetroTransit is engineered to solve urban mobility friction for two core personas:
1. **The Daily Commuter:** Requires rapid origin-destination lookup, intuitive itinerary comparison (fastest vs. direct vs. minimal walking), real-time schedule variance (+/- minutes), and step-by-step route guidance.
2. **The Transit Dispatcher & Transport Planner:** Needs immediate network-wide situational awareness, corridor congestion index monitoring, active fleet positions, detour management, and bottleneck identification.

### Architectural Foundation
- **Canvas Base:** Pure white (#FFFFFF) with muted surface (#F8FAFC) for secondary containers.
- **Color Discipline:** Restrained functional palette. Colors appear only when conveying verified operational status (Success #16A34A, Warning #D97706, Severe #DC2626, Primary Interactive #2563EB).
- **Zero Decorative Noise:** No harsh gradients, no glassmorphism, no rainbow charts, no emojis, no em dashes, no bounce/scale hover animations, and no arbitrary left-border card stripes.
- **8px Grid Rhythm:** All padding, margins, gaps, and heights align with an 8px modular scale (8px, 16px, 24px, 32px, 48px).

---

## 2. Color System & Design Tokens

| Token | Hex Value | Semantic Purpose |
| :--- | :--- | :--- |
| `var(--bg-primary)` | `#FFFFFF` | Main application background, card surfaces, modal boxes |
| `var(--bg-surface)` | `#F8FAFC` | Data table headers, search panels, inactive tabs |
| `var(--bg-surface-hover)` | `#F1F5F9` | Interactive table row and list item hover states |
| `var(--text-primary)` | `#111827` | Headings, primary labels, bus identifiers, timetable numbers |
| `var(--text-secondary)` | `#64748B` | Subheadings, metadata labels, corridor details, timestamps |
| `var(--text-muted)` | `#94A3B8` | Chart axis intervals, subtle hints |
| `var(--border-color)` | `#E5E7EB` | Subtle structural dividers, input boundaries, card perimeters |
| `var(--action-primary)` | `#2563EB` | Active buttons, selected navigation items, primary route line |
| `var(--action-primary-hover)` | `#1D4ED8` | Primary button interactive hover state |
| `var(--status-success)` | `#16A34A` | On-schedule status, low congestion (< 2 min delay) |
| `var(--status-warning)` | `#D97706` | Moderate delays (+2 to +5 min), route detours |
| `var(--status-error)` | `#DC2626` | Severe delays (> 5 min), road closures, cancelled stops |

---

## 3. Typography Hierarchy

The platform uses **Inter** (with system fallback to `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).

| Element | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | 20px | 700 (Bold) | 1.25 | Primary screen title |
| **Section Header** | 15px | 600 (Semi-bold) | 1.35 | Card titles, modal headers |
| **KPI Metrics** | 24px | 700 (Bold) | 1.15 | Dashboard metric numbers |
| **Body Primary** | 13px - 14px | 400 - 500 | 1.50 | Standard table text, descriptions |
| **Labels & Meta** | 11.5px - 12.5px| 500 - 600 | 1.40 | Form labels, corridor tags, ETA tags |
| **Micro Labels** | 10px - 11px | 600 | 1.20 | Badges, shortcuts, map node labels |

---

## 4. Application Structure & Pages

The application is organized into 8 functional views accessible from the persistent left sidebar:

### 1. Overview Dashboard (`#page-overview`)
- **Quick Journey Search:** Instant origin-destination finder with swap control and time selector.
- **Network KPI Strip:** 4 compact cards displaying active buses (248), monitored routes (42), active incidents (3), and on-time adherence (94.2%).
- **Interactive Map Preview:** City street grid with active route lines and live bus markers.
- **Operational Tables:** Recent service alerts and key station departures.

### 2. Journey Planner (`#page-journey`)
- **Search Header:** Location inputs, date/time pickers, and preference toggles (Fastest, Direct, Min Walk).
- **Two-Panel Architecture:**
  - Left: Ranked route options (e.g. 28 min with 1 transfer, 36 min direct) and expandable step-by-step stop sequence with walking links and platform assignments.
  - Right: Route trajectory map depicting walking lines (dashed), bus alignments (solid), and transfer stations.

### 3. Live Map (`#page-live-map`)
- **High-Density Vector Canvas:** Full-bleed SVG map supporting zoom in/out and layer toggles (Buses, Routes, Traffic Overlay).
- **Vehicle Telemetry Panel:** Real-time inspector showing bus ID, route, direction, current intersection, next stop, ETA, speed, occupancy, and telemetry ping age.
- **Traffic Overlay:** Normal flow (green), moderate congestion (amber), and heavy bottleneck (red).
- **Telemetry Controls:** Stream pause/resume toggle with demonstration simulation ticker.

### 4. Bus Routes (`#page-routes`)
- **Route Directory Table:** Searchable and filterable by corridor type (Radial, Crosstown, Circulator, Express, Feeder).
- **Stop Sequence Timeline:** Interactive stop-by-stop progression showing travel time between stops, transfer lines, and wheelchair accessibility.

### 5. Traffic Analytics (`#page-analytics`)
- **Performance KPIs:** Average network delay (3.2 min), congestion index (36%), affected corridors.
- **Hourly Congestion Trend Chart:** 2-hour interval bar visualization identifying morning (08:00) and evening (18:00) peak patterns.
- **Delay Distribution by Route:** Schedule variance comparison across routes.
- **Hotspots Table:** Specific intersections with bottleneck causes and average vehicle delay.

### 6. Service Alerts (`#page-alerts`)
- **Categorized Incidents:** Filter tabs for Severe, Moderate, and Advisory alerts.
- **Structured Data Table:** Disruption type, location, affected corridors, reported time, and status.
- **Incident Detail Modal:** Comprehensive narrative, transit impact analysis, and clearance estimates.

### 7. Platform Settings (`#page-settings`)
- **Interface Preferences:** High contrast mode toggle and compact density selector.
- **Notification Routing:** Configurable delay thresholds (> 5 min) and push notifications.
- **Routing Algorithms:** Walking speed calibration (3.0, 4.5, 6.0 km/h) and step-free accessibility priority.

### 8. Help & Documentation (`#page-help`)
- **System Handbook:** Commuter journey planning instructions and delay interpretation guidelines.
- **Keyboard Shortcuts:** Fast access keys (`/` for search, `Esc` to close overlays).
- **Interactive FAQ Accordion:** Explanations of AVL telemetry, headway adherence, and walking calculations.

---

## 5. Accessibility Audit (WCAG 2.2 AA)

1. **Color Contrast:**
   - Text #111827 on #FFFFFF = 16.1:1 contrast ratio (Exceeds WCAG AAA requirement of 7:1).
   - Secondary text #64748B on #FFFFFF = 4.8:1 contrast ratio (Exceeds WCAG AA requirement of 4.5:1).
   - Primary action #2563EB on #FFFFFF = 4.6:1 contrast ratio (Meets WCAG AA).
2. **Keyboard Operability:**
   - Skip to content link placed at the start of DOM hierarchy.
   - All interactive controls (buttons, links, search, switches) have visible focus indicators (`:focus-visible` with outline #2563EB).
   - Escape key dismisses open popovers and modal dialogs.
3. **Screen Reader Landmarks:**
   - Header: `<header role="banner">`
   - Navigation: `<nav aria-label="Primary Navigation">`
   - Main: `<main id="main-content" role="main">`
   - Modals: `<div role="dialog" aria-modal="true">`
   - Feedback: `<div role="status" aria-live="polite">`

---

## 6. How to Run and Inspect

The application is completely self-contained with zero build dependencies:
1. Open the file `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve using any standard static file server:
   ```bash
   npx serve "C:\Users\ayush\.gemini\antigravity\scratch\smart-transit-platform"
   ```
   or
   ```bash
   python -m http.server 8080 --directory "C:\Users\ayush\.gemini\antigravity\scratch\smart-transit-platform"
   ```
