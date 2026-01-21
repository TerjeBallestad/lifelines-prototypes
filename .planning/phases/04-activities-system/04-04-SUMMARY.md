---
phase: 04-activities-system
plan: 04
subsystem: data
tags: [activities, seed-data, game-content]

# Dependency graph
requires:
  - phase: 04-01
    provides: ActivityData type with capacity profiles
provides:
  - STARTER_ACTIVITIES array with 8 activities
  - Activities across 4 domains (social, organisational, physical, creative)
  - Mix of duration modes (fixed, variable, threshold)
  - Restorative activities for resource recovery
affects: [04-05, 04-06, activity-ui, activity-queue]

# Tech tracking
tech-stack:
  added: []
  patterns: [seed-data-arrays]

key-files:
  created:
    - src/data/activities.ts
  modified: []

key-decisions:
  - "8 activities chosen to balance domains and showcase mechanics"
  - "Rest uses threshold mode for energy recovery demonstration"
  - "Solo hobby included as social battery restore activity"
  - "Capacity profiles range 35-60 (around average of 50)"

patterns-established:
  - "Seed data pattern: typed arrays exported from src/data/"
  - "Capacity profile values in realistic 35-60 range"

# Metrics
duration: 1min
completed: 2026-01-22
---

# Phase 04 Plan 04: Activities Seed Data Summary

**8 starter activities covering 4 domains with varied duration modes and capacity profiles for success calculation**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-21T23:19:20Z
- **Completed:** 2026-01-21T23:20:21Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created 8 activities spanning social, organisational, physical, and creative domains
- Implemented all 3 duration modes: 4 fixed, 3 variable, 1 threshold
- Added 2 restorative activities (rest, solo-hobby) that restore resources
- Capacity profiles with realistic values (35-60 range) for success calculation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create activities seed data** - `541d229` (feat)

## Files Created/Modified
- `src/data/activities.ts` - STARTER_ACTIVITIES array with 8 ActivityData objects

## Decisions Made
None - followed plan as specified. All activity data matches plan specification exactly.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Activities seed data ready for ActivityStore consumption
- Capacity profiles ready for success calculation implementation
- Duration modes ready for activity execution logic

---
*Phase: 04-activities-system*
*Completed: 2026-01-22*
