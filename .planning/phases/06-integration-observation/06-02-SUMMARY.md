---
phase: 06-integration-observation
plan: 02
subsystem: testing-tools
tags: [mobx, react, typescript, presets, archetypes]

# Dependency graph
requires:
  - phase: 06-01
    provides: DevToolsPanel component with balance parameters
provides:
  - 6 preset character archetypes with extreme Big Five traits
  - Factory functions for archetype and random character creation
  - CharacterStore method to create character from data
  - DevTools archetype selector dropdown and randomize button
affects: [06-03, 06-04, emergence-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Preset archetype system for rapid personality testing"
    - "Factory pattern for character creation from configurations"

key-files:
  created:
    - src/data/archetypes.ts
  modified:
    - src/stores/CharacterStore.ts
    - src/components/DevToolsPanel.tsx

key-decisions:
  - "6 archetypes use extreme trait values (10 or 90) for maximum observable contrast"
  - "Selecting archetype replaces entire character (resets skills, talents, activities) for clean emergence testing"
  - "Random character uses Math.random() * 100 for all Big Five traits"

patterns-established:
  - "Archetype pattern: id, name, description, personality, expectedBehavior"
  - "Factory functions return CharacterData for store consumption"
  - "DevTools presets section uses dropdown + button for quick character swapping"

# Metrics
duration: 3min
completed: 2026-01-22
---

# Phase 6 Plan 2: Character Archetypes Summary

**6 contrasting personality archetypes with extreme Big Five traits for rapid emergence testing, accessible via DevTools dropdown and randomize button**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-22T20:20:13Z
- **Completed:** 2026-01-22T20:23:42Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created 6 preset archetypes spanning Big Five extremes (The Hermit, Social Butterfly, Perfectionist, Free Spirit, Competitor, Peacemaker)
- Built factory functions for archetype and random character creation
- Added DevTools UI for instant archetype loading and randomization
- Enabled quick testing of contrasting personalities to validate emergent behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Archetype data and factory functions** - `a7480b7` (feat)
2. **Task 2: Archetype selection in DevToolsPanel** - `fe617b0` (feat)

## Files Created/Modified
- `src/data/archetypes.ts` - 6 preset archetypes with extreme Big Five traits, createArchetypeCharacter and createRandomCharacter factory functions
- `src/stores/CharacterStore.ts` - Added createFromData method to construct Character from CharacterData
- `src/components/DevToolsPanel.tsx` - Added Character Presets section with archetype dropdown and randomize button

## Decisions Made

**Extreme trait values (10 or 90):**
Using extreme values maximizes observable differences between archetypes. Middle values (40-60) produce subtle differences hard to detect visually. Extremes make personality effects obvious in resource changes and activity outcomes.

**Full character replacement:**
Selecting an archetype replaces the entire character (personality, capacities, resources, skills, talents, activities). This ensures clean slate testing - no residual state from previous character affects observations. Critical for validating that personality alone drives emergent differences.

**Expected behavior documentation:**
Each archetype includes `expectedBehavior` field documenting predicted outcomes. This creates testable hypotheses for emergence validation (e.g., "The Hermit's social battery should drain faster than The Social Butterfly's").

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for 06-03 (Time Observation System):
- Archetypes provide diverse test subjects
- DevTools make switching between personalities instant
- Expected behaviors define what to observe

Ready for 06-04 (Auto-play):
- Random character generation enables automated testing
- Archetypes provide benchmark cases for validation

Blocker: None.

Concern: Need to verify personality differences actually produce visible behavioral differences (that's what 06-03 observation system will validate).

---
*Phase: 06-integration-observation*
*Completed: 2026-01-22*
