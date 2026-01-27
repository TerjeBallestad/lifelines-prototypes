---
phase: 11-autonomous-ai
plan: 04
subsystem: verification
tags: [utility-ai, human-verification, balance-fixes]

# Dependency graph
requires:
  - phase: 11-03-ai-components
    provides: AI processTick, DecisionLogPanel, Free Will toggle
provides:
  - Phase 11 success criteria verified
  - Utility scoring balance fixes
  - Survival activities personality-neutral
affects: [phase-12-tuning]

# Tech tracking
tech-stack:
  added: []
  patterns: [satiation-penalty, neutral-cap-scoring]

key-files:
  created: []
  modified:
    - src/utils/utilityScoring.ts
    - src/data/activities.ts

key-decisions:
  - "Satiation penalty: needs > 80% get negative urgency to prevent wasteful activities"
  - "Resource availability capped at 50 (neutral) - affordability doesn't boost selection"
  - "Difficulty match capped at 50 (neutral) - easy activities don't get bonus"
  - "Survival activities have no personality tags - eating/bathroom are universal needs"

patterns-established:
  - "Neutral cap pattern: utility factors that answer 'can I?' should cap at 50, not boost"
  - "Satiation penalty: negative scores for already-satisfied needs"

# Metrics
duration: ~15min (including 4 bug fixes)
completed: 2026-01-27
---

# Phase 11 Plan 04: Human Verification Summary

**All Phase 11 success criteria verified after fixing utility scoring balance issues**

## Performance

- **Duration:** ~15 min (including iterative bug fixes)
- **Completed:** 2026-01-27
- **Bug fixes during verification:** 4

## Verification Results

All 5 Phase 11 success criteria verified:

1. ✓ Patient in autonomous mode evaluates all available activities and picks based on current needs and personality
2. ✓ Patient with critical Hunger (below 15%) prioritizes eating over personality-preferred activities
3. ✓ Patient doesn't always pick the #1 scored activity, shows variety by choosing randomly from top 3-5 options
4. ✓ Player can toggle patient between autonomous (AI-controlled) and manual (player-controlled) modes at any time
5. ✓ Player can observe patient's autonomous behavior and identify emergent patterns based on personality

## Bug Fixes During Verification

Human testing revealed utility scoring balance issues that were fixed iteratively:

### Fix 1: Satiation Penalty (`aa74832`)
**Issue:** AI selected eating when hunger was 100% because urgency was 0 (not negative)
**Fix:** When need > 80%, apply negative urgency (-50 at 100%) to actively discourage

### Fix 2: Resource Availability Cap (`aa74832`)
**Issue:** Cheap activities scored 100 on resource availability ("because resources available")
**Fix:** Cap at 50 (neutral) - affordability answers "can I?" not "should I?"

### Fix 3: Difficulty Match Cap (`d0f701c`)
**Issue:** Easy activities scored 100 on difficulty match ("because it's easy enough")
**Fix:** Cap at 50 (neutral) - easy activities don't get a bonus for being easy

### Fix 4: Survival Activity Tags (`69b4aa3`)
**Issue:** Survival activities tagged 'solo' gave introverts personality bonus for eating/bathroom
**Fix:** Remove personality tags from survival activities - they're universal human needs

## Files Modified

- `src/utils/utilityScoring.ts` - Satiation penalty, resource cap, difficulty cap
- `src/data/activities.ts` - Remove personality tags from survival activities

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Negative urgency for satiated needs | Zero urgency wasn't enough to prevent selection |
| Neutral cap (50) for affordability factors | Cheap/easy shouldn't be a reason TO DO something |
| Personality-neutral survival activities | Everyone eats regardless of introversion |

## Deviations from Plan

Plan expected straightforward verification. Instead, discovered 4 balance issues that required iterative fixes. All fixes committed atomically.

## Next Phase Readiness

- Phase 11 complete with balanced utility scoring
- Ready for Phase 12: Tuning & Balance
- Key insight: "can I?" factors should cap at neutral, "should I?" factors can vary

---
*Phase: 11-autonomous-ai*
*Completed: 2026-01-27*
