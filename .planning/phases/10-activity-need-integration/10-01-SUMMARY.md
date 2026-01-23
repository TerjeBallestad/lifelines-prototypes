---
phase: 10-activity-need-integration
plan: 01
subsystem: activities
tags: [personality, big-five, activity-system, alignment, needs]

# Dependency graph
requires:
  - phase: 09.1-activity-difficulty
    provides: ActivityData.baseDifficulty and skillRequirements fields
  - phase: 08-derived-wellbeing
    provides: DerivedStats (mood, purpose, nutrition)
  - phase: 07-primary-needs
    provides: Needs system and NeedKey type
provides:
  - ActivityData.tags field for personality alignment matching
  - ActivityData.needEffects field for need restoration
  - calculatePersonalityAlignment utility (Big Five → cost/gain modifiers)
  - ActivityAlignment interface with breakdown support
affects: [10-02, 10-03, autonomous-ai]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tag-based personality alignment (declarative activity metadata)"
    - "Cost/gain multipliers computed from Big Five traits (0.6-1.4 range)"
    - "Alignment breakdown for tooltip display"

key-files:
  created:
    - src/utils/personalityFit.ts
  modified:
    - src/entities/types.ts

key-decisions:
  - "Activities declare alignment via tags, not hardcoded trait mappings"
  - "Modifier strength 25-40% (0.3 max) to balance meaningful impact without dominating choices"
  - "Inverse tags (solo vs social) enable introverts to benefit from solo activities"
  - "Alignment affects both costs (cheaper) and gains (higher restoration)"

patterns-established:
  - "calculatePersonalityAlignment: tags + personality → ActivityAlignment"
  - "ActivityAlignment.breakdown provides trait contribution details for debugging"
  - "Optional fields (tags?, needEffects?) maintain backward compatibility"

# Metrics
duration: 1.4min
completed: 2026-01-23
---

# Phase 10 Plan 01: Activity Tagging & Alignment Foundation Summary

**Activity personality alignment via tags and Big Five traits, producing cost/gain multipliers (0.6-1.4 range) for activity mechanics**

## Performance

- **Duration:** 1.4 min
- **Started:** 2026-01-23T22:37:51Z
- **Completed:** 2026-01-23T22:39:14Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Extended ActivityData type with tags and needEffects fields for personality alignment and need restoration
- Created calculatePersonalityAlignment utility that maps Big Five traits to activity cost/gain modifiers
- Established tag-to-trait mapping system (social/solo, creative, routine, cooperative, stressful, concentration)
- All code compiles without errors and ready for Activity.getResourceCosts integration

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ActivityData with tags and needEffects** - `43d885b` (feat)
2. **Task 2: Create personality alignment utility** - `8fe8a18` (feat)

## Files Created/Modified

- `src/entities/types.ts` - Added tags?: string[] and needEffects?: Partial<Record<NeedKey, number>> to ActivityData
- `src/utils/personalityFit.ts` - Created calculatePersonalityAlignment function with ActivityAlignment interface

## Decisions Made

**Tag-based alignment system:**
- Activities declare personality fit via tags (e.g., ['social', 'cooperative'])
- calculatePersonalityAlignment maps tags to Big Five traits
- Result: costMultiplier (aligned = cheaper) and gainMultiplier (aligned = more restoration)

**Modifier strength calibration:**
- Trait contribution formula: (trait - 50) / 100 * 0.3
- Maximum 40% modifier total, clamped to 0.6-1.4 multiplier range
- Example: Extraversion 80 on 'social' activity → 9% cheaper, 9% more restoration

**Inverse tag handling:**
- 'solo' tag inverts Extraversion effect (introverts benefit)
- 'stressful' tag inverts Neuroticism effect (high neuroticism penalized)

**Optional fields:**
- tags? and needEffects? are optional for backward compatibility
- Existing activities work without modification
- New activities can opt into alignment system

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02:**
- ActivityData has tags and needEffects fields
- calculatePersonalityAlignment utility available
- Next: Integrate alignment into Activity.getResourceCosts
- Next: Apply needEffects during activity execution

**No blockers:**
- All types compile
- Utility function tested via TypeScript type checking
- Alignment breakdown ready for tooltip display

---
*Phase: 10-activity-need-integration*
*Completed: 2026-01-23*
