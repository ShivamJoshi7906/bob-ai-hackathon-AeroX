# Task Specification: Member 3 — Frontend UI/UX Engineer

**Git Branch:** `feat/frontend-dashboard`  
**Rubric Points Targeted:** Working Demo & Functionality (15/15 pts) + Innovation & Differentiation (5/25 pts)  
**Primary Peer Collaborators:**  
- Member 2 (Consumes their REST API endpoints for all data)  
- Member 4 (Connects to `POST /api/bob/query` for the Bob Copilot interactive view)

---

## 1. Role Overview & Objective

You are responsible for:
1. Creating a high-impact, state-of-the-art predictive maintenance operations dashboard using **React 18 + TypeScript + Vite + Tailwind CSS + Recharts**.
2. Ensuring the UI feels like a genuine aerospace/defense decision-support system (dark slate palette, glowing status badges, responsive charts, clean typography).
3. Implementing the **6 required pages** with zero placeholder screens.
4. Consuming Member 2's locked REST endpoints with graceful loading and error states.
5. Building the dedicated **IBM Bob Copilot conversational interface** with one-click sample query chips.
6. Ensuring `npm run build` succeeds cleanly without TypeScript or CSS errors.

---

## 2. Directory & File Ownership

You own and edit **ONLY** files inside `src/frontend/`:
```
src/frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                     # Dark aerospace theme tokens, custom scrollbars
│   ├── api/
│   │   └── client.ts                 # Typed fetch/axios wrapper connecting to backend
│   ├── types/
│   │   ├── asset.ts                  # Asset and fleet summary interfaces
│   │   ├── sensor.ts                 # Telemetry interfaces
│   │   ├── readiness.ts              # Readiness & evidence interfaces
│   │   ├── maintenance.ts            # Priority and action interfaces
│   │   └── bob.ts                    # Query & response interfaces
│   ├── components/
│   │   ├── Navbar.tsx                # App header, fleet status pill, current time
│   │   ├── Sidebar.tsx               # Navigation between all 6 pages
│   │   ├── MetricCard.tsx            # KPI cards with gradient borders
│   │   ├── StatusBadge.tsx           # READY (green), MONITORING (yellow), INSPECTION (orange), NOT READY (red)
│   │   ├── RiskBadge.tsx             # LOW, MEDIUM, HIGH, CRITICAL
│   │   └── LoadingState.tsx          # Clean skeleton/spinner states
│   └── pages/
│       ├── FleetDashboard.tsx        # Page 1: Overview, KPIs, readiness charts, asset table
│       ├── AssetDetails.tsx          # Page 2: Single asset drilldown, RUL gauge, evidence
│       ├── SensorAnalytics.tsx       # Page 3: Recharts multi-sensor degradation telemetry
│       ├── MaintenanceCenter.tsx     # Page 4: Prioritized P1-P3 action queue
│       ├── MissionWindows.tsx        # Page 5: Upcoming mission window compatibility
│       └── BobCopilot.tsx            # Page 6: Conversational Bob AI decision support
└── tests/frontend/                   # Basic component/route render tests
```

---

## 3. Visual Design & Theme Guidelines

- **Aesthetic**: Modern defense aerospace command center.
- **Backgrounds**: Deep slate/charcoal (`bg-slate-950`, card backgrounds `bg-slate-900/80`, borders `border-slate-800`).
- **Typography**: Clean sans-serif (Inter/system-ui) with mono numbers (`font-mono`) for cycles, RUL, and sensor readings.
- **Status Colors**:
  - `READY`: Emerald/Green (`#10B981`, `bg-emerald-500/10 text-emerald-400 border-emerald-500/30`)
  - `READY WITH MONITORING`: Amber/Yellow (`#F59E0B`, `bg-amber-500/10 text-amber-400 border-amber-500/30`)
  - `NEEDS INSPECTION`: Orange (`#F97316`, `bg-orange-500/10 text-orange-400 border-orange-500/30`)
  - `NOT READY`: Rose/Red (`#EF4444`, `bg-rose-500/10 text-rose-400 border-rose-500/30`)
- **Important**: NEVER use plain default HTML elements. Use polished cards, hover transitions, and rounded pill badges.

---

## 4. Page-by-Page Specifications

### Page 1 — Fleet Dashboard (`pages/FleetDashboard.tsx`)
- **KPI Grid**: Total Assets (38), Ready (green), Monitoring (amber), Needs Inspection (orange), Not Ready (red), Critical Risk Assets.
- **Visual Distribution**: Recharts pie/donut chart for Readiness breakdown and Risk distribution.
- **Asset Table**:
  - Columns: Asset ID, Criticality, Operating Hours, Predicted RUL, Risk Level, Readiness Status, Next Mission, Actions (View Details button).
  - Search input by Asset ID (`AC-003`) + status filter dropdown.
- **Top Alert Banner**: Highlights P1 Critical maintenance items requiring immediate action.

### Page 2 — Asset Details (`pages/AssetDetails.tsx`)
- Triggered by selecting an asset (e.g. `/assets/AC-003`).
- **Header**: Asset ID, Type, Criticality, Service Age, Last Maintenance Cycle.
- **RUL & Risk Gauge**: Circular or bar display of Predicted RUL (cycles) vs Baseline life.
- **Mission Compatibility Banner**: Shows next mission date, required RUL, buffer margin ($\pm$ cycles), and pass/fail indicator.
- **Readiness Explanation Box (Core Innovation)**:
  - Displays actual evidence bullet points retrieved from `/api/assets/{id}/readiness`.
  - Recommended action pill (e.g. *"Ground asset; immediate teardown of HPC module"*).
- **Recent Telemetry Snapshot**: Mini table showing the latest cycle sensor readings.

### Page 3 — Sensor Analytics (`pages/SensorAnalytics.tsx`)
- **Interactive Multi-Sensor Chart (Recharts)**:
  - Multi-select dropdown or button tabs for sensors (`s2: HPC Outlet Temp`, `s3: Combustor Outlet Temp`, `s4: LPT Outlet Temp`, `s7: HPC Pressure`, `s8: Fan Speed`, `s9: Core Speed`, `s11: Static Pressure`, `s12: Fuel Ratio`, `s14: Bypass Ratio`, `s15: Bleed Enthalpy`, `s17: HP Turbine Speed`, `s20: HPT Coolant`, `s21: LPT Coolant`).
  - X-Axis: Operating Cycle. Y-Axis: Sensor Value.
  - Degradation zone markers (e.g. warning threshold lines).
  - Cycle slider/zoom to view recent 30 or 50 cycles.

### Page 4 — Maintenance Center (`pages/MaintenanceCenter.tsx`)
- **Prioritized Queue**:
  - Filter tabs: `All`, `P1 - CRITICAL`, `P2 - URGENT`, `P3 - SCHEDULED`.
  - Cards showing: Priority, Asset ID, Risk, Predicted RUL, Identified Issue, Mission Impact, Recommended Action.
  - Knowledge Base provenance tag: *"Recommended procedure derived from public aviation maintenance log knowledge base"*.

### Page 5 — Mission Windows (`pages/MissionWindows.tsx`)
- Synthetic upcoming mission scenarios timeline table.
- Shows for each scheduled asset:
  - Mission ID, Asset ID, Window Start & End Dates, Mission Priority.
  - Asset Current RUL vs Required Mission Cycles.
  - Buffer Margin (Positive = Safe; Negative = Mission Threat).
  - Readiness Status badge.

### Page 6 — IBM Bob Copilot (`pages/BobCopilot.tsx`)
- Dedicated conversational terminal interface for IBM Bob.
- **Preset Prompt Chips (Click to Send)**:
  - `Which assets are not ready?`
  - `Why is AC-003 not ready?`
  - `What should maintenance do first?`
  - `Which assets are at risk before the next mission?`
  - `Show me highest-risk assets.`
- **Chat Window**:
  - Displays user message and Bob's structured response.
  - Displays **Live Evidence Cards** (Predicted RUL, Risk, Mission Delta, Recommended Action).
  - Displays **Tools Used Pill** (e.g. `Tool: get_not_ready_assets()`).

---

## 5. TypeScript Interfaces (`src/frontend/src/types/`)

```typescript
export interface FleetSummary {
  total_assets: number;
  ready_count: number;
  monitoring_count: number;
  inspection_count: number;
  not_ready_count: number;
  critical_risk_count: number;
  high_risk_count: number;
  upcoming_missions_30d: number;
  urgent_maintenance_p1: number;
}

export interface AssetRow {
  asset_id: string;
  asset_type: string;
  total_operating_hours: number;
  mission_criticality: string;
  predicted_rul: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readiness_score: number;
  readiness_category: 'READY' | 'READY WITH MONITORING' | 'NEEDS INSPECTION' | 'NOT READY';
  next_mission_date?: string;
  next_mission_priority?: string;
}

export interface BobQueryResponse {
  answer: string;
  evidence: {
    asset_id?: string;
    predicted_rul?: number;
    mission_cycles_required?: number;
    buffer_cycles?: number;
    risk_level?: string;
    readiness_category?: string;
    recommended_action?: string;
  };
  tools_called: string[];
}
```

---

## 6. Step-by-Step Git Commands

```bash
# 1. Checkout your branch
git checkout -b feat/frontend-dashboard

# 2. Install dependencies and run Vite dev server
cd src/frontend
npm install
npm run dev

# 3. Test production build
npm run build

# 4. Commit and push
git add src/frontend/
git commit -m "feat(frontend): implement full 6-page aerospace operations dashboard and Bob copilot UI"
git push -u origin feat/frontend-dashboard
```
Notify **Member 4** once pushed!
