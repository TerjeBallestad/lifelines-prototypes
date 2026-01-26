---
phase: 11-autonomous-ai
plan: 01
subsystem: ai
tags: [utility-scoring, decision-making, autonomous-ai, needs-system]

# Dependency graph
requires:
  - phase: 10-activity-need-integration
    provides: Activity.needEffects, Activity.getResourceCosts(), calculatePersonalityAlignment
  - phase: 08-derived-wellbeing
    provides: needToMoodCurve from curves.ts
provides:
  - UtilityFactors type with 5 scoring factors (needUrgency, personalityFit, resourceAvailability, willpowerMatch, moodDelta)
  - UtilityWeights type with configurable factor weights
  - AIDecision type for decision logging and debugging
  - 8 utility scoring functions for activity selection
  - DEFAULT_UTILITY_WEIGHTS constant (balanced defaults summing to 1.0)
affects: [11-02-utility-ai-store, 11-03-ai-components]

# Tech tracking
tech-stack:
  added: []
  patterns: [utility-scoring, critical-mode-override, hysteresis-bonus]

key-files:
  created:
    - src/types/autonomy.ts
    - src/utils/utilityScoring.ts
  modified: []

key-decisions:
  - "5 utility factors: needUrgency, personalityFit, resourceAvailability, willpowerMatch, moodDelta"
  - "Critical mode threshold: 15% for hunger/bladder/energy"
  - "Hysteresis bonus: 25% for current activity to prevent constant switching"
  - "Willpower match scoring: ratio * 50 (100 at 2x margin, 50 at 1x)"

patterns-established:
  - "Utility scoring: all factors normalized to 0-100, weights sum to 1.0"
  - "Critical mode: override normal scoring when physiological needs < 15%"
  - "Hysteresis: apply bonus to current activity to reduce switching"

# Metrics
duration: 2.4min
completed: 2026-01-26
---

# Phase 11 Plan 01: Utility Scoring Foundation Summary

**5-factor utility scoring system with critical mode override and 25% hysteresis bonus for autonomous activity selection**

## Performance

- **Duration:** 2.4 min (145 seconds)
- **Started:** 2026-01-26T13:22:48Z
- **Completed:** 2026-01-26T13:25:13Z
- **Tasks:** 2/2
- **Files created:** 2

## Accomplishments

- Created autonomy types: UtilityFactors (5 factors), UtilityWeights, AIDecision, DecisionLog
- Implemented 8 utility scoring functions for the AI decision system
- Established critical mode override for survival-focused decisions when needs < 15%
- Added hysteresis bonus (25%) to prevent constant activity switching

## Task Commits

Each task was committed atomically:

1. **Task 1: Create autonomy types** - `7b59fd2` (feat)
2. **Task 2: Create utility scoring functions** - `1a82fea` (feat)

## Files Created

- `src/types/autonomy.ts` - UtilityFactors, UtilityWeights, AIDecision, DecisionLog types + DEFAULT_UTILITY_WEIGHTS constant
- `src/utils/utilityScoring.ts` - 8 scoring functions: shouldOverrideToCriticalMode, calculateNeedUrgency, calculateResourceAvailability, calculatePersonalityFitScore, calculateWillpowerDifficultyMatch, calculateMoodDelta, scoreInCriticalMode, calculateUtilityScore

## Decisions Made

1. **5 utility factors chosen:** needUrgency (30%), personalityFit (20%), resourceAvailability (15%), willpowerMatch (15%), moodDelta (20%) - weights sum to 1.0
2. **Inverted sigmoid for urgency:** Used `50 - needToMoodCurve(value)` to create high urgency when needs are low
3. **Willpower match formula:** `ratio * 50` where ratio = willpower / cost, giving 50 at exact match, 100 at 2x margin
4. **Mood delta scaling:** Multiplied by 2 to normalize to 0-100 range
5. **Critical mode check:** Uses only physiological needs (hunger, bladder, energy) with 15% threshold

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All scoring functions ready for UtilityAIStore integration (Plan 02)
- Types exported for consumption by store and components
- Critical mode and hysteresis patterns established for consistent behavior

---
*Phase: 11-autonomous-ai*
*Completed: 2026-01-26*
