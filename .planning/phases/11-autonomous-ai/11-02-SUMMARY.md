---
phase: 11-autonomous-ai
plan: 02
subsystem: ai
tags: [utility-ai, decision-making, autonomous-behavior, free-will]

# Dependency graph
requires:
  - phase: 11-01-utility-scoring
    provides: calculateUtilityScore, shouldOverrideToCriticalMode, scoreInCriticalMode, UtilityFactors, UtilityWeights, AIDecision types
  - phase: 10-activity-need-integration
    provides: ActivityStore.canStartActivity(), Activity.getResourceCosts(), calculatePersonalityAlignment
provides:
  - UtilityAIStore for autonomous activity selection
  - Character.freeWillEnabled toggle (default ON)
  - Decision logging with last 5 decisions
  - Critical mode survival override
  - Personality-based variety in activity selection
affects: [11-03-ai-components, 11-04-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [weighted-random-selection, personality-variety-multiplier, critical-mode-override]

key-files:
  created:
    - src/stores/UtilityAIStore.ts
  modified:
    - src/entities/Character.ts
    - src/stores/RootStore.ts

key-decisions:
  - "Free Will default ON: AI fills idle time by default, player can disable per-character"
  - "Critical mode picks highest scoring activity (no variety in survival mode)"
  - "Normal mode top 5 candidates filtered to >= 50% of best score"
  - "Personality variety: openness +1%/point, conscientiousness -0.5%/point"
  - "Decision log stores last 5 decisions for debugging and player insight"

patterns-established:
  - "processTick() pattern: check conditions before making decision (freeWill, idle, empty queue)"
  - "Variety multiplier via power function: Math.pow(score, 1/multiplier)"
  - "Top reason generation: identify dominant utility factor for human-readable explanation"

# Metrics
duration: 2.8min
completed: 2026-01-26
---

# Phase 11 Plan 02: UtilityAIStore Summary

**One-liner:** Autonomous activity selection via weighted utility scoring with personality-driven variety and critical survival override.

## What Was Built

### UtilityAIStore (`src/stores/UtilityAIStore.ts`)
The core AI decision-making system that:

1. **Scores all available activities** using utility functions from Plan 01:
   - needUrgency (30%)
   - personalityFit (20%)
   - resourceAvailability (15%)
   - willpowerMatch (15%)
   - moodDelta (20%)

2. **Implements critical mode** (survival override):
   - Triggers when hunger, bladder, or energy < 15%
   - Uses pure urgency scoring (ignores personality/mood)
   - Picks highest scoring activity (no variety in survival)

3. **Implements normal mode** (weighted selection):
   - Takes top 5 candidates
   - Filters out activities scoring < 50% of best
   - Applies personality-based variety multiplier
   - Uses weighted random selection

4. **Logs decisions** for debugging and player insight:
   - Last 5 decisions stored
   - Full factor breakdown per decision
   - Human-readable topReason

### Character.freeWillEnabled (`src/entities/Character.ts`)
- Property defaults to `true` (AI fills idle time)
- `setFreeWill(enabled: boolean)` action method
- When disabled, character only does player-queued activities

### RootStore Integration (`src/stores/RootStore.ts`)
- `utilityAIStore: UtilityAIStore` property
- Initialized in constructor after activityStore

## Key Implementation Details

### Variety Multiplier Formula
```typescript
const varietyMultiplier = 1.0 +
  (character.personality.openness - 50) * 0.01 -
  (character.personality.conscientiousness - 50) * 0.005;

const adjustedWeights = viable.map(({ score }) =>
  Math.pow(score, 1 / varietyMultiplier)
);
```

- High openness (creative personality): more variety (flatter distribution)
- High conscientiousness: less variety (prefer top choice)
- At 50/50: multiplier = 1.0 (no adjustment)

### processTick() Conditions
```typescript
processTick(): void {
  if (!character) return;
  if (!character.freeWillEnabled) return;
  if (!activityStore.isIdle) return;
  if (activityStore.queue.length > 0) return;
  // Make decision and enqueue
}
```

### topReason Generation
- Critical mode: "Rest because Energy critical (12%)"
- Normal mode (dominant factor):
  - needUrgency: "Rest because tired"
  - personalityFit: "Solo Hobby Time because it fits personality"
  - resourceAvailability: "Plan Tomorrow because resources available"
  - willpowerMatch: "Chat with Neighbor because it's easy enough"
  - moodDelta: "Go for a Walk because it would boost mood"

## Files Changed

| File | Change |
|------|--------|
| src/stores/UtilityAIStore.ts | Created (412 lines) |
| src/entities/Character.ts | Added freeWillEnabled + setFreeWill |
| src/stores/RootStore.ts | Added utilityAIStore property |

## Commits

| Hash | Message |
|------|---------|
| a2edc79 | feat(11-02): add freeWillEnabled toggle to Character |
| e7720b5 | feat(11-02): create UtilityAIStore for autonomous activity selection |
| b7f8300 | feat(11-02): integrate UtilityAIStore into RootStore |

## Deviations from Plan

None - plan executed exactly as written.

## Success Criteria Verification

- [x] UtilityAIStore scores activities using utility functions from Plan 01
- [x] Critical mode (any physiological need < 15%) triggers pure urgency scoring
- [x] Normal mode picks from top 5 candidates with weighted random selection
- [x] Decision log stores last 5 decisions with full breakdown
- [x] Free Will toggle on Character controls AI behavior

## Next Phase Readiness

Ready for Plan 03 (AI Components):
- UtilityAIStore exposes `decisionLog` for UI display
- `character.freeWillEnabled` ready for toggle UI
- `makeDecision()` returns full AIDecision for debugging view
- processTick() ready to be called from SimulationStore

**Integration note:** SimulationStore.tick() needs to call `utilityAIStore.processTick()` - this will be done in Plan 03 or 04.
