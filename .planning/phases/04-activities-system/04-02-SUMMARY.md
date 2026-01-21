---
phase: 04-activities-system
plan: 02
subsystem: state-management
tags: [mobx, observable-array, activity-queue, stores]

# Dependency graph
requires:
  - phase: 04-01
    provides: Activity entity with mastery system
  - phase: 01-02
    provides: RootStore pattern with React Context
provides:
  - ActivityStore with queue management
  - Queue operations (enqueue, dequeue, reorder, cancel)
  - canStartActivity check with narrative error messages
  - useActivityStore convenience hook
affects: [04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - observable.array for reactive queue
    - canStartActivity returns { canStart, reason } pattern

key-files:
  created:
    - src/stores/ActivityStore.ts
  modified:
    - src/stores/RootStore.ts

key-decisions:
  - "MIN_OVERSKUDD_TO_START = 20 as configurable constant"
  - "Narrative error messages include character name"
  - "Activity-specific startRequirements checked in addition to global threshold"

patterns-established:
  - "Queue operations use observable.array splice for reactivity"
  - "canStartActivity returns object with optional reason for UI messages"

# Metrics
duration: 1min
completed: 2026-01-22
---

# Phase 04 Plan 02: ActivityStore Summary

**MobX ActivityStore with observable queue and canStartActivity check returning narrative error messages**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-21T23:14:06Z
- **Completed:** 2026-01-21T23:15:19Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created ActivityStore with observable queue using MobX observable.array
- Implemented all queue operations (enqueue, dequeue, reorder, cancel, clearQueue)
- Added canStartActivity check with narrative error messages
- Wired ActivityStore to RootStore with convenience hook

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ActivityStore** - `fdf0cac` (feat)
2. **Task 2: Wire ActivityStore to RootStore** - `bdb5a1b` (feat)

## Files Created/Modified
- `src/stores/ActivityStore.ts` - Activity queue management store with observable state
- `src/stores/RootStore.ts` - Added activityStore property and useActivityStore hook

## Decisions Made
- MIN_OVERSKUDD_TO_START = 20 as a configurable constant at module level
- canStartActivity returns { canStart: boolean; reason?: string } pattern for UI flexibility
- Narrative error messages include character name for personalized feedback
- Activity-specific startRequirements are checked in addition to the global overskudd threshold

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- ActivityStore ready for integration with SimulationStore (04-03)
- Queue operations available for activity execution logic
- canStartActivity check ready for UI feedback

---
*Phase: 04-activities-system*
*Completed: 2026-01-22*
