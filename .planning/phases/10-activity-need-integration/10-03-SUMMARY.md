---
phase: 10-activity-need-integration
plan: 03
subsystem: activity-execution
tags: [activity-store, needs-restoration, personality-alignment, escape-valve, resource-costs]

# Dependency graph
requires:
  - phase: 10-02
    provides: Activity.getResourceCosts() and starter activities with tags/needEffects
  - phase: 10-01
    provides: calculatePersonalityAlignment utility
provides:
  - ActivityStore.applyResourceEffects() extended with need restoration and personality-aligned costs
  - Escape valve mechanism (50% cost reduction when physiological needs < 20%)
  - Per-tick need restoration with personality alignment modifiers
affects: [autonomous-ai, activity-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Escape valve: 50% cost reduction when any physiological need < 20%"
    - "Per-tick alignment calculation for both resource costs and need restoration"
    - "Personality alignment affects drains (costMultiplier) and restores (gainMultiplier)"
    - "Need restoration is gradual, retained on interruption (no rollback)"

key-files:
  created: []
  modified:
    - src/stores/ActivityStore.ts

key-decisions:
  - "Calculate alignment once per tick for efficiency (reused for resources and needs)"
  - "Escape valve applies to resource drains only, not need restoration"
  - "Alignment modifiers stack with mastery bonuses (multiplicative)"
  - "Struggling patients (any physiological need < 20%) get automatic 50% cost reduction"

patterns-established:
  - "calculateEscapeValve: Character → cost multiplier (1.0 or 0.5)"
  - "Alignment calculation hoisted to applyResourceEffects start for reuse"
  - "Resource drains: mastery × alignment.costMultiplier × escapeValve"
  - "Resource restores: mastery × alignment.gainMultiplier"
  - "Need restoration: alignment.gainMultiplier × mastery bonus"

# Metrics
duration: 2.9min
completed: 2026-01-23
---

# Phase 10 Plan 03: Activity-Need Integration Summary

**ActivityStore.applyResourceEffects() now applies personality-aligned resource costs, gradual need restoration, and escape valve for struggling patients**

## Performance

- **Duration:** 2.9 min
- **Started:** 2026-01-23T22:51:47Z
- **Completed:** 2026-01-23T22:54:43Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Extended ActivityStore.applyResourceEffects() to restore needs per-tick with personality alignment
- Integrated personality alignment modifiers into resource drain and restore calculations
- Added escape valve mechanism: 50% cost reduction when any physiological need drops below 20%
- Need restoration is gradual (per-tick), retained on interruption (no state rollback)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend applyResourceEffects for need restoration** - `0301d43` (feat)
2. **Task 2: Integrate personality-aligned resource costs** - `3e566ce` (feat)

## Files Created/Modified

- `src/stores/ActivityStore.ts` - Extended applyResourceEffects with v1.1 need restoration, personality alignment, and escape valve

## Decisions Made

**Alignment calculation optimization:**
- Calculate alignment once at start of applyResourceEffects
- Reuse for both resource effects and need restoration
- Avoids redundant trait-to-modifier calculations

**Escape valve targeting:**
- Applies to resource drains only (not need restoration)
- Prevents total paralysis when patient is in crisis
- Threshold: ANY physiological need (hunger/energy/hygiene/bladder) below 20%
- Reduction: 50% of resource drain

**Effect stacking order:**
- Resource drains: base × speedMultiplier × (1 - masteryDrainReduction) × alignment.costMultiplier × escapeValve
- Resource restores: base × speedMultiplier × (1 + masteryBonus * 0.5) × alignment.gainMultiplier
- Need restoration: base × speedMultiplier × alignment.gainMultiplier × (1 + masteryBonus * 0.5)

**v1.0 backward compatibility:**
- Escape valve returns 1.0 (no reduction) if character.needs is undefined
- Need restoration block only executes if character.needs and activity.needEffects exist
- v1.0 mode unchanged: resource effects apply without alignment modifiers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 10 complete:**
- Activities restore needs gradually during execution ✓
- Interruption retains partial restoration (no state rollback) ✓
- Personality alignment affects resource costs and need restoration ✓
- Escape valve prevents paralysis for struggling patients ✓
- All existing mastery mechanics still function ✓

**Integration verified:**
- TypeScript compiles without errors
- Need restoration applies per-tick with gainMultiplier
- Resource drains apply costMultiplier and escape valve
- Alignment calculated once per tick for efficiency

**Ready for:**
- Autonomous AI activity selection (Phase 11+)
- Activity UI integration showing alignment effects
- Testing with v1.1 needs system enabled

**No blockers:**
- All v1.1 needs system integration complete
- Backward compatible with v1.0 mode
- No breaking changes to existing activity mechanics

---
*Phase: 10-activity-need-integration*
*Completed: 2026-01-23*
