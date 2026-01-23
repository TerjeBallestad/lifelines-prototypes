---
phase: 10-activity-need-integration
plan: 02
subsystem: activity-system
tags: [activity, personality-alignment, needs, resource-costs, mobx]

# Dependency graph
requires:
  - phase: 10-01
    provides: calculatePersonalityAlignment utility for tag-to-trait matching
provides:
  - Activity.getResourceCosts() method calculating costs from difficulty and personality
  - STARTER_ACTIVITIES enriched with tags and needEffects for personality/need integration
affects: [10-03, autonomous-ai]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ResourceCosts interface for activity cost breakdown"
    - "Linear difficulty-to-cost scaling (1:1, difficulty 1 = 5 cost base)"
    - "Personality alignment modifies both costs (cheaper) and gains (higher restoration)"

key-files:
  created: []
  modified:
    - src/entities/Activity.ts
    - src/data/activities.ts

key-decisions:
  - "Linear cost scaling from difficulty (1:1) - difficulty 4 costs 4x difficulty 1"
  - "No minimum cost floor - mastered activities can become nearly free"
  - "Cost distribution: overskudd (100%), willpower (50%), focus (30% if concentration), socialBattery (40% if social)"
  - "Both tags and needEffects stored in Activity for future integration"

patterns-established:
  - "ResourceCosts interface with alignment field for tooltip display"
  - "hasTag() helper method for tag checking"
  - "All 8 starter activities have personality tags and need restoration effects"

# Metrics
duration: 1.8min
completed: 2026-01-23
---

# Phase 10 Plan 02: Activity Resource Costs Summary

**Activity.getResourceCosts() calculates difficulty-scaled, personality-adjusted costs with 1:1 linear scaling and all 8 starter activities enriched with alignment tags and need restoration effects**

## Performance

- **Duration:** 1.8 min
- **Started:** 2026-01-23T22:41:48Z
- **Completed:** 2026-01-23T22:43:32Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Activity class calculates resource costs from effective difficulty with personality alignment modifiers
- All 8 starter activities have personality alignment tags (social, solo, routine, creative, stressful, concentration)
- Activities that restore needs have gradual needEffects defined (social, fun, energy, security, hygiene)
- Linear cost scaling established (difficulty 1 = 5 base cost, difficulty 5 = 25 base cost)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getResourceCosts method to Activity** - `7c6b4b9` (feat)
2. **Task 2: Update STARTER_ACTIVITIES with tags and needEffects** - `bd14236` (feat)

## Files Created/Modified
- `src/entities/Activity.ts` - Added ResourceCosts interface, getResourceCosts() method, tags/needEffects storage
- `src/data/activities.ts` - Added tags and needEffects to all 8 STARTER_ACTIVITIES

## Decisions Made

**Cost scaling model:**
- Linear difficulty-to-cost scaling (1:1 mapping)
- Base cost = effectiveDifficulty * 5 (difficulty 1 → 5 cost, difficulty 5 → 25 cost)
- No minimum cost floor (mastered activities become nearly free)

**Cost distribution across resources:**
- overskudd: baseCost * 1.0 (full scaling)
- willpower: baseCost * 0.5
- focus: baseCost * 0.3 (only if 'concentration' tag)
- socialBattery: baseCost * 0.4 (only if 'social' tag)

**Tag assignments:**
- Social activities: chat-with-neighbor, phone-call-practice (+ stressful, concentration), visit-store (+ stressful)
- Solo activities: go-for-walk, rest, solo-hobby (+ creative)
- Routine activities: plan-tomorrow (+ concentration), tidy-room
- All tags align with Big Five personality traits for cost/gain modifiers

**Need restoration effects:**
- Social activities restore social need (+1.5 to +2 per tick)
- Solo hobbies restore fun need (+2 per tick)
- Rest restores energy need (+3 per tick)
- Planning/tidying restore security/hygiene needs
- Visiting store has no immediate need restoration (buying food ≠ eating food)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Ready for Plan 10-03:**
- Activity.getResourceCosts() available for ActivityStore integration
- All starter activities have tags for personality alignment calculation
- needEffects defined for gradual need restoration during activity execution
- ResourceCosts interface includes alignment breakdown for tooltip display

**Implementation notes for next phase:**
- Costs calculated at activity start (check minOverskudd requirement)
- Costs consumed during activity execution (not all at start)
- needEffects applied per-tick during activity (gradual restoration)
- Alignment.gainMultiplier applies to needEffects restoration rates

---
*Phase: 10-activity-need-integration*
*Completed: 2026-01-23*
