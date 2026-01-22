---
phase: 06-integration-observation
plan: 03
completed: 2026-01-22
status: complete
subsystem: observation-tools
tags: [comparison, multi-character, visualization, emergence-validation]

requires:
  - 06-02 # Archetype system for preset characters
  - 02-04 # Visualization components (PersonalityRadar, ResourcePanel, CapacitiesRadar)

provides:
  - Multi-character support in CharacterStore
  - ComparisonView component for side-by-side observation
  - Comparison mode toggle in App

affects:
  - Future observation and testing workflows
  - Multi-character scenarios and interactions

tech-stack:
  added: []
  patterns:
    - Map-based multi-entity storage
    - Conditional layout rendering (single vs comparison mode)
    - Component composition for reusable panels

key-files:
  created:
    - src/components/ComparisonView.tsx
  modified:
    - src/stores/CharacterStore.ts
    - src/stores/SimulationStore.ts
    - src/App.tsx

decisions:
  - Map-based storage for multi-character support with active character pointer
  - Backward compatibility maintained via character getter
  - Comparison mode as separate full-screen view (not overlay)
  - Preset archetype pairs for quick emergence testing
  - SimulationStore ticks all characters (not just active one)

metrics:
  duration: 2min
  tasks: 2
  commits: 2
  files-changed: 4
---

# Phase 6 Plan 3: Comparison Mode Summary

**One-liner:** Map-based multi-character storage with side-by-side ComparisonView for emergence validation across contrasting archetypes.

## What Was Built

### 1. Multi-character CharacterStore
Refactored CharacterStore from single-character to map-based storage:
- `characters: Map<string, Character>` for multiple character instances
- `activeCharacterId: string | null` for single-mode compatibility
- `getCharacter(id)`, `removeCharacter(id)`, `setActiveCharacter(id)` methods
- `character` getter returns active character (backward compatible)
- `allCharacters` computed property returns array for iteration

### 2. SimulationStore Multi-character Ticking
Updated tick method to update all characters:
```typescript
for (const char of this.root.characterStore.allCharacters) {
  char.applyTickUpdate(this.speed);
}
```

### 3. ComparisonView Component
Full-screen comparison interface:
- Archetype pair selection UI (Hermit vs Social Butterfly, etc.)
- Side-by-side grid layout with CharacterComparisonPanel
- Each panel shows: resources, personality radar, capacities radar
- Expected behavior text from archetype data
- Status badges (exhausted, stressed, drained)
- Back to Single Mode button

### 4. App Integration
Added comparison mode toggle:
- State management: `comparisonMode` boolean
- Conditional rendering: ComparisonView or normal layout
- "Compare Mode" button in header
- Character initialization only in single mode

## Technical Implementation

**Data Structure Change:**
```typescript
// Before
character: Character | null = null;

// After
characters: Map<string, Character> = new Map();
activeCharacterId: string | null = null;
```

**Backward Compatibility:**
- `character` getter still works for single-mode code
- `clearCharacter()` delegates to `removeCharacter(activeCharacterId)`
- Existing CharacterPanel, ActivityPanel use `character` getter

**Archetype Setup:**
```typescript
const setupComparison = (arch1Index: number, arch2Index: number) => {
  // Clear existing
  for (const id of Array.from(characterStore.characters.keys())) {
    characterStore.removeCharacter(id);
  }
  // Create two from archetypes
  const c1 = characterStore.createFromData(createArchetypeCharacter(ARCHETYPES[arch1Index].id));
  const c2 = characterStore.createFromData(createArchetypeCharacter(ARCHETYPES[arch2Index].id));
  setChar1Id(c1.id);
  setChar2Id(c2.id);
};
```

## Verification Results

✅ TypeScript compilation passes
✅ Dev server starts without errors
✅ Comparison mode toggle functional
✅ Two characters display side-by-side
✅ SimulationStore ticks all characters
✅ Archetype pair selection works

**Manual testing confirmed:**
- Hermit vs Social Butterfly show contrasting resource drain patterns
- Each character panel updates independently during simulation
- Expected behavior text provides context for emergence validation
- Status badges reflect individual character states

## Key Learnings

**Map-based storage pattern:**
- Enables future multi-character scenarios (party systems, NPC interactions)
- Active character pointer maintains single-mode compatibility
- Clean separation between storage (Map) and UI (active ID)

**Component reuse:**
- PersonalityRadar, ResourcePanel, CapacitiesRadar composed cleanly
- CharacterComparisonPanel encapsulates display logic
- No duplication of visualization code

**Full-screen comparison approach:**
- Simpler than overlay/split-panel hybrid
- Clean state transition (single ↔ comparison)
- Room for future expansion (3+ character comparisons)

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 1c6ee12 | feat | Add multi-character support to CharacterStore |
| 40b1470 | feat | Implement comparison view with side-by-side character display |

## Next Phase Readiness

**Ready for next plan:** Yes

**Capabilities unlocked:**
- Emergence validation across contrasting archetypes
- Side-by-side behavior observation
- Multi-character simulation foundation

**What this enables:**
- Plan 06-04: Can observe how different personalities produce different outcomes
- Future: Party systems, NPC interactions, relationship dynamics
- Testing: Validate that personality → behavior emergence works as intended

**No blockers or concerns.**
