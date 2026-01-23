---
phase: 08-derived-wellbeing
plan: 01
subsystem: entities
tags: [types, config, curves, smoothing, sigmoid, ema]

# Dependency graph
requires:
  - phase: 07-primary-needs
    provides: Needs interface and NeedsConfig for need satisfaction values
provides:
  - DerivedStats interface (mood, purpose, nutrition)
  - FoodQuality enum for nutrition tracking
  - StatBreakdown interface for UI tooltips
  - DerivedStatsConfig with tunable smoothing/weight parameters
  - needToMoodCurve sigmoid function for need-to-mood mapping
  - SmoothedValue class for exponential moving average lag
affects: [08-02, 08-03, 09-action-resources, 10-autonomous-ai]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Sigmoid curves for non-linear stat derivation
    - Exponential moving average for natural stat lag
    - Soft bounds (asymptoticClamp) preventing exact min/max

key-files:
  created:
    - src/utils/curves.ts
    - src/utils/smoothing.ts
  modified:
    - src/entities/types.ts
    - src/config/balance.ts

key-decisions:
  - "Sigmoid steepness=2.0 for balanced curve (not too sharp, not too flat)"
  - "Mood floor=10, ceiling=95 to prevent extreme states"
  - "Hunger/energy weighted 1.5x for survival importance"
  - "Nutrition smoothing alpha=0.01 (very slow) vs mood alpha=0.1 (moderate)"

patterns-established:
  - "Curve utilities in src/utils/curves.ts for stat derivation math"
  - "SmoothedValue class for any stat needing lag/smoothing"
  - "DerivedStatsConfig extends BalanceConfig pattern from NeedsConfig"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 8 Plan 01: Foundation Types Summary

**Sigmoid curves and exponential smoothing utilities for need-to-mood derivation with configurable weights and soft bounds**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-23T16:00:00Z
- **Completed:** 2026-01-23T16:02:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- DerivedStats interface with mood/purpose/nutrition fields and factory function
- FoodQuality enum (Bad/OK/Good/Great) for nutrition tracking
- DerivedStatsConfig with tunable smoothing alphas, weights, and bounds
- needToMoodCurve sigmoid function converting 0-100 needs to mood contributions
- SmoothedValue class implementing exponential moving average for natural lag

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Derived Stats Types and FoodQuality Enum** - `5dfa3a8` (feat)
2. **Task 2: Add Derived Stats Configuration** - `9b6ec7d` (feat)
3. **Task 3: Create Curve and Smoothing Utilities** - `5c72512` (feat)

## Files Created/Modified
- `src/entities/types.ts` - Added DerivedStats, FoodQuality, StatBreakdown, defaultDerivedStats
- `src/config/balance.ts` - Added DerivedStatsConfig, DEFAULT_DERIVED_STATS_CONFIG, derivedStatsConfig getter
- `src/utils/curves.ts` - New file with needToMoodCurve and asymptoticClamp functions
- `src/utils/smoothing.ts` - New file with SmoothedValue class for EMA

## Decisions Made
- Used sigmoid formula x^lambda / (x^lambda + sigma^lambda) where sigma=0.5, lambda=2.0 for balanced curve response
- Mood contribution mapped to [-50, +50] * weight centered at 0 for neutral midpoint
- Soft bounds via asymptoticClamp with strength=0.9 default to prevent jarring hard caps
- SmoothedValue alpha clamped to [0,1] for safety

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Foundation types and utilities ready for Plan 02 Character integration
- needToMoodCurve ready to compute mood from weighted need values
- SmoothedValue ready to provide lag for mood/purpose/nutrition updates
- DerivedStatsConfig accessible via BalanceConfigStore.derivedStatsConfig

---
*Phase: 08-derived-wellbeing*
*Completed: 2026-01-23*
