---
phase: 05-talents-system
plan: 01
subsystem: entities
tags: [mobx, typescript, talent, rarity, modifiers]

# Dependency graph
requires:
  - phase: 04-activities-system
    provides: ActivityData, CapacityKey, SkillDomain types pattern
provides:
  - TalentRarity type (common, rare, epic)
  - ModifierType and ModifierEffect interfaces
  - TalentData interface for talent construction
  - Talent entity class with rarityWeight calculation
affects: [05-02 TalentStore, 05-03 talent pools, 05-04 UI components]

# Tech tracking
tech-stack:
  added: []
  patterns: [Talent entity mirroring Skill/Activity observable pattern]

key-files:
  created:
    - src/entities/Talent.ts
  modified:
    - src/entities/types.ts

key-decisions:
  - "Rarity weights: common=70, rare=25, epic=5 (totals 100 for probability)"
  - "Domain can be null for universal talents"
  - "CSS color classes: common=text-base-content, rare=text-info, epic=text-secondary"

patterns-established:
  - "Talent entity: readonly data properties, computed weight/UI helpers"
  - "ModifierEffect: target/targetKey/value pattern for flexible effect system"

# Metrics
duration: 2min
completed: 2026-01-22
---

# Phase 05 Plan 01: Talent Entity & Types Summary

**Talent entity with rarity tiers (common/rare/epic) and modifier effect types for roguelike talent system**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-22T12:20:00Z
- **Completed:** 2026-01-22T12:22:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- TalentRarity, ModifierType, ModifierEffect, TalentData types added to types.ts
- Talent entity class following Skill/Activity observable pattern
- Rarity weight calculation for spawn probability (70/25/5 split)
- CSS color helpers for rarity display in UI

## Task Commits

Each task was committed atomically:

1. **Task 1: Add talent type definitions to types.ts** - `e562f67` (feat)
2. **Task 2: Create Talent entity class** - `28f5c24` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/entities/types.ts` - Added TalentRarity, ModifierType, ModifierEffect, TalentData types
- `src/entities/Talent.ts` - New Talent entity class with observable properties and computed helpers

## Decisions Made
- Rarity weights: common=70, rare=25, epic=5 (totals 100 for easy percentage calculation)
- Domain can be null for universal talents that apply regardless of skill domain
- DaisyUI color mapping: common uses base-content, rare uses info (blue), epic uses secondary (purple)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Talent entity ready for TalentStore implementation
- Type definitions ready for seed data creation
- ModifierEffect structure ready for modifier application logic

---
*Phase: 05-talents-system*
*Completed: 2026-01-22*
