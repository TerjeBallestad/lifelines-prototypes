---
phase: 07-primary-needs-foundation
plan: 01
subsystem: entities
tags: [needs, mobx, decay, personality, v1.1]

# Dependency graph
requires:
  - phase: v1.0
    provides: Character class, BalanceConfig, personality modifiers pattern
provides:
  - Needs interface with 7 primary needs (hunger, energy, hygiene, bladder, social, fun, security)
  - NeedsConfig with differential decay rates
  - applyAsymptoticDecay() utility for death spiral prevention
  - Character.needs property with initializeNeeds() and applyNeedsDecay()
  - needsModifiers computed getter for personality-based decay
affects: [07-02-toggle-integration, 08-derived-wellbeing, phase-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - asymptotic decay formula for death spiral prevention
    - personality-to-modifier scaling for needs
    - optional needs property for v1.0/v1.1 coexistence

key-files:
  created:
    - src/utils/needsDecay.ts
  modified:
    - src/entities/types.ts
    - src/config/balance.ts
    - src/entities/Character.ts

key-decisions:
  - "Asymptotic decay with floor=5 prevents needs from hitting zero"
  - "Physiological decay 3-4x faster than social (0.5-1.0 vs 0.15-0.25)"
  - "Personality effects: High Extraversion -> Social, High Neuroticism -> Security"

patterns-established:
  - "Asymptotic decay formula: newValue = current - (rate * (current - floor) / 100 * speed)"
  - "Optional needs property enables v1.0/v1.1 toggle without breaking changes"
  - "NeedKey type for type-safe need access"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 7 Plan 01: Needs Types and Config Summary

**7 primary needs with asymptotic decay preventing death spirals, personality-based modifiers for Social (Extraversion) and Security (Neuroticism)**

## Performance

- **Duration:** 2 min 21s
- **Started:** 2026-01-23T14:30:12Z
- **Completed:** 2026-01-23T14:32:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Needs interface with 7 needs on 0-100 scale: hunger, energy, hygiene, bladder (physiological) and social, fun, security (psychological)
- NeedsConfig with differential decay rates (physiological 3-4x faster than social)
- Asymptotic decay utility preventing instant bottoming-out via floor value
- Character.needs property with initializeNeeds() and applyNeedsDecay() methods
- needsModifiers computed getter linking Big Five personality to decay rates

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Needs Types and Config** - `09d8f7d` (feat)
2. **Task 2: Implement Character Needs and Decay Logic** - `86bbc4b` (feat)

## Files Created/Modified

- `src/entities/types.ts` - Added Needs interface, NeedKey type, defaultNeeds() factory
- `src/config/balance.ts` - Added NeedsConfig interface, DEFAULT_NEEDS_CONFIG, extended BalanceConfig
- `src/utils/needsDecay.ts` - New file with applyAsymptoticDecay() utility
- `src/entities/Character.ts` - Added needs property, initializeNeeds(), needsModifiers, applyNeedsDecay()

## Decisions Made

1. **Asymptotic decay with floor=5**: Needs never quite reach 0, preventing instant death spirals while still allowing critical states
2. **Differential decay rates**: Physiological needs (0.5-1.0) decay 3-4x faster than social needs (0.15-0.25), creating urgency hierarchy
3. **Personality effects limited to two needs**: High Extraversion affects Social decay (extraverts crave more contact), High Neuroticism affects Security decay (anxious people need more reassurance)
4. **Optional needs property**: Enables v1.0/v1.1 coexistence without breaking existing code

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Needs system foundation complete
- Ready for Plan 02: Toggle integration to enable needs decay in simulation loop
- Future phases (08-derived-wellbeing) can compute Mood from needs once toggle is active

---
*Phase: 07-primary-needs-foundation*
*Completed: 2026-01-23*
