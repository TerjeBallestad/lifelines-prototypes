---
phase: 05
plan: 02
subsystem: talents
tags: [mobx, weighted-random, store, xp-threshold]
dependency-graph:
  requires: [05-01]
  provides: [TalentStore, weighted-selection, talent-pool]
  affects: [05-03, 05-04]
tech-stack:
  added: []
  patterns: [cumulative-weight-sampling, threshold-triggered-rewards]
key-files:
  created:
    - src/utils/weightedRandom.ts
    - src/data/talents.ts
    - src/stores/TalentStore.ts
  modified:
    - src/stores/RootStore.ts
    - src/stores/SkillStore.ts
decisions:
  - "500 XP threshold per domain triggers talent pick"
  - "Max 3 pending picks queue (prevents stacking)"
  - "Cumulative weight algorithm for unbiased selection"
metrics:
  duration: "2min"
  completed: "2026-01-22"
---

# Phase 5 Plan 2: TalentStore & Seed Data Summary

TalentStore manages 10-talent pool with weighted random 1-of-3 offers triggered at 500 domain XP milestones.

## What Was Built

### Task 1: Weighted Random Utility
Created `src/utils/weightedRandom.ts` with `weightedSampleWithoutReplacement()`:
- Cumulative weight algorithm for statistically correct selection
- Sampling without replacement ensures no duplicates in offers
- Throws if sample size exceeds population

### Task 2: Talent Seed Data
Created `src/data/talents.ts` with 10 talents:

| Rarity | Count | Weight | Talents |
|--------|-------|--------|---------|
| Common | 5 | 70% | iron_will, social_butterfly, early_bird, optimist, steady_hands |
| Rare | 3 | 25% | hyperfocus, creative_mind, organized |
| Epic | 2 | 5% | second_wind, flow_state |

**Design notes:**
- ~30% have tradeoffs (early_bird, hyperfocus, organized, flow_state)
- MVP scope: only `resource` and `capacity` effect targets
- Domain coverage: physical(3), social(1), analytical(1), creative(1), organisational(1), universal(3)

### Task 3: TalentStore Integration
Created `src/stores/TalentStore.ts`:
- `talentPool`: Observable map of all 10 talents
- `selectedTalents`: Observable map of chosen talents
- `pendingPicks`: 0-3 queued picks
- `currentOffer`: Array of 3 Talent entities or null
- `checkForTalentPick(domain, xp)`: Threshold detection (500 XP)
- `generateOffer()`: Weighted random 3-talent selection
- `selectTalent(id)`: Pick from offer, consume pending pick
- `forceOffer()`: Testing helper

**RootStore integration:**
- Added `talentStore` property
- Added `useTalentStore()` convenience hook

**SkillStore integration:**
- `addDomainXP()` now calls `talentStore.checkForTalentPick()`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| 500 XP threshold | Matches ~5 activities to first talent pick (balanced pacing) |
| Max 3 pending picks | Prevents infinite stacking, encourages regular selection |
| Cumulative weight algorithm | Statistically unbiased weighted selection |
| Per-domain threshold tracking | Prevents double-triggering on same XP value |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] `npx tsc --noEmit` completes without errors
- [x] `npm run dev` starts without errors
- [x] TalentStore has talentPool with 10 talents
- [x] useTalentStore hook is available
- [x] SkillStore.addDomainXP triggers checkForTalentPick

## Key Code

**Weighted sampling core:**
```typescript
// Random selection using cumulative distribution
const rand = Math.random() * sum;
const selectedIdx = cumulative.findIndex((c) => c >= rand);
```

**Threshold detection:**
```typescript
const prevThreshold = this.pickThresholdsCrossed.get(domain) ?? 0;
const newThreshold = Math.floor(newTotalXP / PICK_THRESHOLD);
if (newThreshold > prevThreshold) {
  this.pickThresholdsCrossed.set(domain, newThreshold);
  this.addPendingPick();
}
```

## Commits

| Hash | Message |
|------|---------|
| f0dd21c | feat(05-02): create weighted random sampling utility |
| 93a7b38 | feat(05-02): create talent seed data (10 talents) |
| c7ebdb9 | feat(05-02): create TalentStore and integrate into RootStore |

## Next Phase Readiness

**Ready for 05-03:** TalentSelectionModal UI
- `currentOffer` provides 3 talents to display
- `selectTalent(id)` handles selection
- `pendingPicks > 0` triggers modal display
