---
phase: 07-primary-needs-foundation
plan: 02
subsystem: ui
tags: [needs, mobx, toggle, components, daisyui, v1.1]

# Dependency graph
requires:
  - phase: 07-01
    provides: Needs interface, NeedsConfig, applyNeedsDecay, initializeNeeds
provides:
  - needsSystemEnabled toggle in RootStore
  - toggleNeedsSystem() action initializing needs on all characters
  - Character.applyTickUpdate() v1.0/v1.1 branching
  - NeedBar component with color-coded urgency
  - NeedsPanel component with Physiological/Social groupings
  - Toggle UI in SimulationControls
  - Conditional ResourcePanel/NeedsPanel rendering in CharacterPanel
affects: [07-03-recovery-activities, 08-derived-wellbeing, phase-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - v1.0/v1.1 toggle pattern for parallel system validation
    - color-threshold mapping for visual urgency (green > yellow > orange > red)
    - grouped need display (Physiological vs Social)

key-files:
  created:
    - src/components/NeedBar.tsx
    - src/components/NeedsPanel.tsx
  modified:
    - src/stores/RootStore.ts
    - src/entities/Character.ts
    - src/components/SimulationControls.tsx
    - src/components/CharacterPanel.tsx

key-decisions:
  - "RootStore marked specific stores as non-observable to avoid makeAutoObservable conflicts"
  - "Color thresholds: green >= 70, yellow >= 40, orange >= 20, red < 20"
  - "Critical needs use animate-pulse for visual urgency"

patterns-established:
  - "Toggle pattern: needsSystemEnabled controls which system runs in tick loop"
  - "Component conditional: {toggle && data ? NewPanel : OldPanel} for smooth UI switching"

# Metrics
duration: 3min
completed: 2026-01-23
---

# Phase 7 Plan 2: Toggle Integration Summary

**Global v1.0/v1.1 toggle with NeedBar and NeedsPanel components for color-coded urgency display**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-23T14:35:25Z
- **Completed:** 2026-01-23T14:37:47Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Global toggle in RootStore switches between v1.0 resources and v1.1 needs
- Character.applyTickUpdate branches based on toggle - only one system runs at a time
- NeedBar displays individual needs with green/yellow/orange/red color coding
- NeedsPanel groups 7 needs into Physiological (4) and Social (3) categories
- Toggle UI visible in SimulationControls, labeled "v1.1 Needs"
- CharacterPanel conditionally renders NeedsPanel or ResourcePanel

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Toggle to RootStore and Wire Character** - `1a076e9` (feat)
2. **Task 2: Create NeedBar and NeedsPanel Components** - `0a096d4` (feat)
3. **Task 3: Add Toggle UI and Integrate NeedsPanel** - `38f232f` (feat)

## Files Created/Modified

- `src/stores/RootStore.ts` - Added needsSystemEnabled observable and toggleNeedsSystem() action
- `src/entities/Character.ts` - applyTickUpdate now branches based on toggle
- `src/components/NeedBar.tsx` - Single need display with color-coded progress bar
- `src/components/NeedsPanel.tsx` - Grouped needs display (Physiological + Social)
- `src/components/SimulationControls.tsx` - Toggle checkbox for v1.1 Needs
- `src/components/CharacterPanel.tsx` - Conditional NeedsPanel/ResourcePanel rendering

## Decisions Made

1. **RootStore observable configuration** - Used makeAutoObservable with explicit false for child stores to avoid conflicts
2. **Color thresholds** - Green (>= 70), yellow (>= 40), orange (>= 20), red (< 20) provides clear visual hierarchy
3. **Critical indicator** - Used Tailwind animate-pulse for needs below criticalThreshold (20)
4. **Header label** - Changes between "Needs (v1.1)" and "Resources" to indicate active system

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Toggle working: v1.0 and v1.1 can be switched at runtime
- Needs decay when toggle enabled and simulation running
- Ready for 07-03: Recovery activities to restore needs
- UI shows urgency via colors - ready for player decision-making validation

---
*Phase: 07-primary-needs-foundation*
*Completed: 2026-01-23*
