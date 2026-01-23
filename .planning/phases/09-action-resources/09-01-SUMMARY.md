---
phase: 09-action-resources
plan: 01
subsystem: gameplay-resources
tags: [action-resources, overskudd, socialbattery, focus, willpower, mobx, personality, needs]

# Dependency graph
requires:
  - phase: 08-derived-wellbeing
    provides: Mood, Purpose, Nutrition stats computed from needs
provides:
  - ActionResources interface with 4 computed resources
  - ActionResourcesConfig with tuning constants
  - Character integration with smoothers and tick updates
  - Personality-inverted socialBattery for introvert/extrovert differentiation
affects: [09-02-action-difficulty, 10-autonomous-ai, ui-action-resources]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Personality-inverted resource targets (socialBattery)"
    - "Willpower-modified recovery rates (Overskudd)"
    - "Cross-resource penalties (zeroSocialBattery drains Willpower)"

key-files:
  created: []
  modified:
    - src/entities/types.ts
    - src/config/balance.ts
    - src/entities/Character.ts

key-decisions:
  - "Overskudd recovery rate boosted by Willpower (not target)"
  - "socialBattery drain/charge inverts based on Extraversion thresholds (40/60)"
  - "Ambivert neutral target (50) in both contexts"
  - "zeroSocialBattery drains Willpower to force breaks"
  - "Fun need boosts Willpower target (not recovery rate)"

patterns-established:
  - "Action resources computed from needs + derived stats + personality"
  - "Smoothers with per-resource alpha values for differentiated response"
  - "Breakdown getters return StatBreakdown for tooltip display"

# Metrics
duration: 5min
completed: 2026-01-23
---

# Phase 09 Plan 01: Action Resources Summary

**Four action resources (Overskudd, socialBattery, Focus, Willpower) computed from needs/personality with introvert/extrovert socialBattery inversion**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-23T18:05:00Z
- **Completed:** 2026-01-23T18:10:18Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- ActionResources interface with 4 resources on 0-100 scale
- ActionResourcesConfig with tuning constants for all resources
- Character integration with computed targets, smoothers, and tick updates
- Personality-inverted socialBattery (introverts charge solo, extroverts charge social)
- Overskudd recovery rate modified by Willpower (faster recovery when Willpower high)
- Cross-resource penalty (zeroSocialBattery drains Willpower)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ActionResources types and config** - `7ff7361` (feat)
2. **Task 2: Add Character action resources logic** - `556e0d7` (feat)

## Files Created/Modified
- `src/entities/types.ts` - ActionResources interface, SocialContext type, defaultActionResources factory
- `src/config/balance.ts` - ActionResourcesConfig with all tuning constants, getter in BalanceConfigStore
- `src/entities/Character.ts` - Action resources properties, smoothers, computed getters, applyActionResourcesUpdate, spend methods

## Decisions Made

**Overskudd recovery rate modified by Willpower:**
- Willpower affects the alpha (smoothing rate) not the target value
- effectiveAlpha = config.overskuddAlpha * (0.5 + (willpower / 100) * 0.5)
- This makes recovery 50%-100% speed based on Willpower level
- Rationale: Willpower represents mental strength to pull yourself out of low states

**socialBattery drain/charge inversion:**
- Introvert (E < 40): charges solo (target 100), drains social (target 20)
- Extrovert (E > 60): drains solo (target 30), charges social (target 100)
- Ambivert (40-60): neutral target (50) in both contexts
- Rationale: Creates personality-differentiated pressure patterns

**Fun need boosts Willpower target:**
- Base target 80, Fun adds up to +30 boost
- Rationale: Fun satisfaction provides mental resilience, not just recovery speed

**zeroSocialBattery drains Willpower:**
- Cost: 20 per tick when socialBattery at 0
- Rationale: Forces introverts to take breaks, extroverts to socialize
- Creates meaningful resource pressure that drives autonomous behavior

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed FoodQuality enum for erasableSyntaxOnly**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** FoodQuality enum not compatible with tsconfig erasableSyntaxOnly flag (pre-existing issue)
- **Fix:** Converted enum to const object with type alias
- **Files modified:** src/entities/types.ts
- **Verification:** Build passes
- **Committed in:** 7ff7361 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Pre-existing TypeScript config issue blocking build. Fix necessary to complete plan.

## Issues Encountered

None - plan executed smoothly after enum fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 09-02 (Activity Difficulty):**
- All 4 action resources computed and updating
- Targets respond to needs, personality, and derived wellbeing
- Breakdowns available for tooltip display
- spend methods (spendFocus, spendWillpower) ready for activity integration

**Ready for Phase 10 (Autonomous AI):**
- Action resources available as computed values
- Personality differentiation working (introvert/extrovert socialBattery)
- Cross-resource penalties implemented (socialBattery → Willpower)

**Next steps:**
- Phase 09-02: Add activity difficulty ratings and resource cost calculations
- Phase 10: Autonomous AI uses action resources to gate activity decisions

---
*Phase: 09-action-resources*
*Completed: 2026-01-23*
