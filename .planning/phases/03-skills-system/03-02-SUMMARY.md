---
phase: 03-skills-system
plan: 02
subsystem: skill-management
tags: [mobx, store, dag, xp, state-machine]

dependency-graph:
  requires: [03-01]
  provides: [SkillStore, domainXP-tracking, skill-state-derivation, dag-validation]
  affects: [03-03, 03-04, 04-*]

tech-stack:
  added: []
  patterns: [kahn-algorithm, state-derivation, observable-map]

key-files:
  created:
    - src/stores/SkillStore.ts
  modified: []

decisions:
  - id: dag-validation-timing
    choice: "Validate DAG on seedSkills, not constructor"
    rationale: "Skills must be loaded before validation can run"
  - id: xp-deduction-order
    choice: "Deduct XP before levelUp call"
    rationale: "Ensures XP cost uses current level's cost"

metrics:
  duration: 2min
  completed: 2026-01-21
---

# Phase 03 Plan 02: SkillStore Summary

**One-liner:** ObservableMap-based SkillStore with Kahn's algorithm DAG validation, domain XP tracking, and state derivation (locked/unlockable/unlocked/mastered)

## What Was Built

### SkillStore (`src/stores/SkillStore.ts`)

Central store for the skill system with:

1. **Skill Collection** - `observable.map<string, Skill>` for reactive skill tracking
2. **Domain XP Tracking** - `observable.map<SkillDomain, number>` for 5 domains
3. **State Derivation** - `getSkillState()` returns computed state based on level and prerequisites
4. **Prerequisite Checking** - `isUnlockable()` validates all prerequisites met
5. **Progress Display** - `getPrerequisiteProgress()` for "why locked" UI (SKIL-05)
6. **DAG Validation** - `validateDAG()` uses Kahn's algorithm to detect circular dependencies
7. **Unlock Action** - `unlockSkillLevel()` validates prerequisites, checks XP, deducts cost, levels up

### DOMAINS Constant

Exported array of all 5 skill domains: `['social', 'organisational', 'analytical', 'physical', 'creative']`

## Key Implementation Details

### State Machine Logic

```typescript
getSkillState(skillId): SkillState {
  if (skill.level >= 5) return 'mastered'
  if (skill.level >= 1) return 'unlocked'
  if (this.isUnlockable(skillId)) return 'unlockable'
  return 'locked'
}
```

### Kahn's Algorithm for DAG Validation

- Builds in-degree map (counts dependencies per skill)
- Processes queue of skills with no unmet dependencies
- If visited < total skills, cycle exists
- Warns to console on cycle detection

### Unlock Flow

1. Check skill exists
2. Check prerequisites met (for level 0->1)
3. Check not mastered (level < 5)
4. Check affordability (domain XP >= cost)
5. Deduct XP, call levelUp()

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 1e3b0e1 | feat | create SkillStore with skill collection and domain XP |
| ea77bf3 | feat | add skill state computation and prerequisite checking |
| 8a9408d | feat | add DAG validation and unlock/seed actions |

## Verification Results

- [x] TypeScript compiles: `npx tsc --noEmit` passes
- [x] SkillStore has: skills ObservableMap, domainXP ObservableMap
- [x] State derivation: getSkillState returns correct state
- [x] Unlock logic: validates prerequisites, checks XP, deducts, levels up
- [x] DAG validation: Kahn's algorithm detects cycles
- [x] File length: 205 lines (>100 min)

## Deviations from Plan

None - plan executed exactly as written.

## Dependencies Satisfied

From must_haves.truths:
- [x] "SkillStore manages skills in an ObservableMap"
- [x] "Domain XP is tracked per domain and can be spent"
- [x] "DAG validation prevents circular dependencies"
- [x] "Skill states (locked/unlockable/unlocked/mastered) are computed from prerequisites"

From must_haves.key_links:
- [x] SkillStore imports Skill class from entities/Skill
- [x] SkillStore imports SkillDomain, SkillData from types

## Next Steps

- Plan 03-03: Integrate SkillStore into RootStore
- Plan 03-04: Build skill tree UI visualization
- Phase 4: Connect activities to addDomainXP
