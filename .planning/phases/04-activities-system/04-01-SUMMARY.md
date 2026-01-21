---
phase: 04-activities-system
plan: 01
subsystem: entities
tags: [mobx, typescript, activity, mastery, duration-modes]

# Dependency graph
requires:
  - phase: 03-skills-system
    provides: SkillDomain type, entity class pattern
provides:
  - Activity entity class with mastery system
  - ActivityData, DurationMode, ActivityState, CapacityKey types
affects: [04-02-ActivityStore, 04-03-store-wiring, 04-05-activity-queue]

# Tech tracking
tech-stack:
  added: []
  patterns: [activity mastery system (1-10 levels), diminishing XP returns]

key-files:
  created: [src/entities/Activity.ts]
  modified: [src/entities/types.ts]

key-decisions:
  - "Polynomial mastery XP curve: 100 * (level+1)^1.5"
  - "Mastery caps at level 10 for bounded progression"
  - "Diminishing domain XP returns (100% at L1, 10% at L10) encourages variety"
  - "CapacityKey type enables type-safe capacity profile access"

patterns-established:
  - "Activity entity follows Character/Skill MobX pattern"
  - "DurationMode discriminated union for flexible activity durations"
  - "capacityProfile enables success calculation based on character capacities"

# Metrics
duration: 2min
completed: 2026-01-22
---

# Phase 04 Plan 01: Activity Entity Summary

**Activity entity class with mastery system (1-10) and discriminated union DurationMode types for flexible activity durations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-22
- **Completed:** 2026-01-22
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added activity type definitions (DurationMode, ActivityState, ActivityData, CapacityKey) to types.ts
- Created Activity entity class following established MobX pattern from Character/Skill
- Implemented mastery system with polynomial XP curve and diminishing domain XP returns

## Task Commits

Each task was committed atomically:

1. **Task 1: Add activity types to types.ts** - `e0f2391` (feat)
2. **Task 2: Create Activity entity class** - `d45174f` (feat)

## Files Created/Modified
- `src/entities/types.ts` - Added CapacityKey, DurationMode, ActivityState, ActivityData types
- `src/entities/Activity.ts` - Activity class with mastery calculations and makeAutoObservable

## Decisions Made
- Mastery XP formula uses polynomial curve `100 * (level+1)^1.5` for achievable progression
- Mastery level capped at 10 with Infinity returned for nextMasteryXPRequired at max
- Diminishing domain XP multiplier (100% at L1 down to 10% at L10) encourages trying new activities
- CapacityKey type added for type-safe access to capacity fields in capacityProfile

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Activity entity ready for ActivityStore queue management (04-02)
- Types ready for activity data seeding (04-03)
- capacityProfile field ready for success calculation logic (04-04)

---
*Phase: 04-activities-system*
*Completed: 2026-01-22*
