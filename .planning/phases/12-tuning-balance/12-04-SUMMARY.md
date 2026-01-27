---
phase: 12
plan: 04
subsystem: balance-ui
tags: [recharts, headless-simulation, telemetry, ui]
requires: [12-03]
provides: [simulation-runner-ui, telemetry-charts, comparison-visualization]
affects: [12-05]
tech-stack:
  added: []
  patterns: [recharts-line-chart, collapsible-panels, run-comparison]
key-files:
  created:
    - src/components/SimulationRunnerPanel.tsx
    - src/components/TelemetryChartsPanel.tsx
  modified:
    - src/components/CharacterPanel.tsx
    - src/entities/Character.ts
decisions:
  - "Downsample to 500 points for chart performance (per RESEARCH.md pitfall)"
  - "Comparison shows single primary key (e.g., hunger or mood) with solid vs dashed lines"
  - "Run selection limited to 2 for comparison clarity"
  - "X-axis formatting: ticks -> hours -> days for readability"
metrics:
  duration: 4 min
  completed: 2026-01-27
---

# Phase 12 Plan 04: Simulation UI Summary

UI for running headless simulations and visualizing telemetry results with Recharts LineChart.

## What Was Built

### SimulationRunnerPanel (src/components/SimulationRunnerPanel.tsx)
- Duration dropdown: 1 day, 3 days, 7 days (1440-10080 ticks)
- Personality presets: Current, Introvert (E:20), Extrovert (E:80)
- Sample rate config: every tick, every 10 ticks, every 60 ticks
- "Run Simulation" button for single runs
- "Run Comparison" button for introvert vs extrovert side-by-side
- Progress indicator during simulation execution
- Results summary: survival rate, min needs, avg mood, critical events

### TelemetryChartsPanel (src/components/TelemetryChartsPanel.tsx)
- List of completed runs with stats (E value, survival %, avg mood)
- Select 1-2 runs for visualization
- Three chart types: Primary Needs, Derived Wellbeing, Action Resources
- Recharts LineChart with CartesianGrid, Tooltip, Legend
- Color-coded lines per stat category
- Downsampling to 500 points for large datasets
- Comparison overlay: solid lines (run 1) vs dashed lines (run 2)
- X-axis formatting: tick -> hours (60+) -> days (1440+)

### Character.resetNeedsAndResources()
- New method to reset all needs/resources to defaults
- Required for running comparison simulations (reset between runs)
- Reinitializes smoothers for derived stats and action resources

## Key Links Verified

| From | To | Pattern |
|------|-----|---------|
| SimulationRunnerPanel | headlessSimulation.ts | `runHeadlessSimulation` call |
| TelemetryChartsPanel | TelemetryStore | `telemetryStore.runs` observer |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Character.resetNeedsAndResources()**
- **Found during:** Task 1
- **Issue:** Comparison runs need to reset character state between simulations
- **Fix:** Added resetNeedsAndResources() method to Character entity
- **Files modified:** src/entities/Character.ts
- **Commit:** 544d653

**2. [Rule 1 - Bug] Fixed TypeScript errors in TelemetryChartsPanel**
- **Found during:** Task 3
- **Issue:** Potential undefined access in comparison chart logic
- **Fix:** Added undefined checks and guard clauses
- **Files modified:** src/components/TelemetryChartsPanel.tsx
- **Commit:** 0b9aa70

**3. [Rule 1 - Bug] Removed v1.0 leftover code**
- **Found during:** Task 3
- **Issue:** `isOverstressed` property and `ResourceKey` import from v1.0
- **Fix:** Removed dead code references
- **Files modified:** src/components/ComparisonView.tsx, src/utils/modifiers.ts
- **Commit:** 0b9aa70

## Verification Checklist

- [x] "Run Simulation" starts headless simulation, shows progress
- [x] Simulation completes without freezing UI (async yield every 100 ticks)
- [x] Results summary shows survival rate, min needs, avg mood
- [x] TelemetryChartsPanel shows line charts with needs over time
- [x] "Run Comparison" runs introvert + extrovert and both appear in charts
- [x] Charts handle large datasets via downsampling (500 point limit)
- [x] npm run build succeeds

## Success Criteria Met

- [x] Player can run 7-day headless simulation via UI
- [x] Progress visible during simulation run
- [x] Time-series charts display needs, derived stats, action resources over time
- [x] Comparison between introvert and extrovert runs visible in charts

## Next Phase Readiness

Plan 12-05 (validation testing) can proceed. The simulation runner and telemetry visualization are complete and functional.
