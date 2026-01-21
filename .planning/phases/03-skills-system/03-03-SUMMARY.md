---
phase: 03-skills-system
plan: 03
subsystem: skill-integration
tags: [mobx, store, hooks, data, dependency-tree]

dependency-graph:
  requires: [03-01, 03-02]
  provides: [skillStore-via-RootStore, useSkillStore-hook, STARTER_SKILLS-data]
  affects: [03-04, 04-*]

tech-stack:
  added: []
  patterns: [root-store-pattern, convenience-hooks, cross-domain-dependencies]

key-files:
  created:
    - src/data/skills.ts
  modified:
    - src/stores/RootStore.ts
    - src/stores/index.tsx
    - src/stores/SkillStore.ts

decisions:
  - id: skill-tree-design
    choice: "8 skills across 3 domains with cross-domain dependency"
    rationale: "Demonstrates DAG capabilities and realistic life skill progression"
  - id: starter-xp
    choice: "Seed testing XP (social=100, org=50, physical=100)"
    rationale: "Enables immediate testing of unlock flow"

metrics:
  duration: 3min
  completed: 2026-01-21
---

# Phase 03 Plan 03: Store Wiring & Skill Data Summary

**One-liner:** SkillStore wired to RootStore with useSkillStore hook, 8 adult life skills seeded across social/organisational/physical domains with cross-domain dependencies

## What Was Built

### RootStore Integration (`src/stores/RootStore.ts`)

Added skillStore as third store in root:
- Import SkillStore
- Add `skillStore: SkillStore` property
- Initialize in constructor after simulationStore

### useSkillStore Hook (`src/stores/index.tsx`)

- Convenience hook following pattern of useCharacterStore/useSimulationStore
- Re-exports SkillStore from barrel file

### Skill Data (`src/data/skills.ts`)

8 skills forming a meaningful dependency tree:

**Social Domain (chain):**
```
eye-contact -> small-talk -> phone-call
```

**Organisational Domain (chain):**
```
make-list -> follow-routine
```

**Physical Domain (branching DAG):**
```
go-outside -> walk-neighborhood
         \-> go-to-store (also requires make-list!)
```

Key characteristics:
- 8 skills total (meets INFR-03: 5-8 skills)
- 3 root skills (no prerequisites)
- Max depth 2 (eye-contact -> small-talk -> phone-call)
- Cross-domain dependency (go-to-store needs physical + organisational)

### Auto-seeding (`src/stores/SkillStore.ts`)

Constructor now:
1. Calls `seedSkills(STARTER_SKILLS)`
2. Seeds test XP (social=100, org=50, physical=100)

## Commits

| Hash | Type | Description |
|------|------|-------------|
| bda3d72 | feat | wire SkillStore into RootStore and index |
| 63e28a0 | feat | create skill data with meaningful dependency tree |
| 625730f | feat | seed skills on store initialization |

## Verification Results

- [x] TypeScript compiles: `npx tsc --noEmit` passes
- [x] App starts: `npm run dev` without console errors
- [x] RootStore.skillStore is accessible
- [x] useSkillStore() hook works in components
- [x] 8 skills seeded with correct dependency relationships
- [x] No DAG cycle warning in console

## Deviations from Plan

None - plan executed exactly as written.

## Dependencies Satisfied

From must_haves.truths:
- [x] "SkillStore is accessible via RootStore"
- [x] "useSkillStore hook exists for React components"
- [x] "5-8 skills exist in meaningful dependency tree"
- [x] "Skills span multiple domains with 1-2 levels of prerequisites"

From must_haves.key_links:
- [x] RootStore imports and instantiates SkillStore (`this.skillStore = new SkillStore`)
- [x] useSkillStore accesses skillStore (`useRootStore().skillStore`)

From must_haves.artifacts:
- [x] `src/stores/RootStore.ts` contains "skillStore"
- [x] `src/stores/index.tsx` exports "useSkillStore"
- [x] `src/data/skills.ts` exports "STARTER_SKILLS" (74 lines, >30 min)

## Next Steps

- Plan 03-04: Build skill tree UI visualization
- Phase 4: Connect activities to addDomainXP
