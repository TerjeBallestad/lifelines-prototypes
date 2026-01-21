# Phase 03 Plan 01: Skill Entity & Types Summary

**One-liner:** Observable Skill entity class with MobX, escalating XP costs (50-150), and typed domain/state definitions.

## What Was Built

### Types Added to types.ts

| Type | Purpose |
|------|---------|
| `SkillDomain` | Union type: 'social' \| 'organisational' \| 'analytical' \| 'physical' \| 'creative' |
| `SkillState` | Union type: 'locked' \| 'unlockable' \| 'unlocked' \| 'mastered' |
| `SkillData` | Interface for skill construction (id, name, description, domain, prerequisites) |
| `PrerequisiteStatus` | Interface for "why locked" display (skillId, name, required, current, met) |

### Skill Entity Class

Created `src/entities/Skill.ts` following the Character.ts pattern:

**Properties:**
- `id`, `name`, `description`, `domain`, `prerequisites` (readonly)
- `level` (mutable, 0-5, starts at 0)

**Computed Getters:**
- `nextLevelCost`: Escalating XP costs: 50, 75, 100, 125, 150 for levels 1-5. Returns `Infinity` at max level.
- `isMastered`: Returns `true` when level >= 5

**Actions:**
- `levelUp()`: Increments level by 1, capped at 5

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 36c976f | feat | Add skill type definitions to types.ts |
| 1e3b0e1 | feat | Create Skill entity class |

## Files Modified

| File | Changes |
|------|---------|
| `src/entities/types.ts` | +29 lines: SkillDomain, SkillState, SkillData, PrerequisiteStatus |
| `src/entities/Skill.ts` | +57 lines: New file with Skill class |

## Key Patterns Established

1. **Skill follows Character pattern**: Both use `makeAutoObservable(this)` in constructor
2. **Readonly data props, mutable state**: Data from constructor is readonly, level is mutable
3. **Escalating XP formula**: `50 + (nextLevel - 1) * 25` provides predictable progression

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] TypeScript compiles: `npx tsc --noEmit` passes
- [x] types.ts exports: SkillDomain, SkillState, SkillData, PrerequisiteStatus
- [x] Skill.ts exports: Skill class
- [x] Skill class pattern matches Character.ts (makeAutoObservable, readonly data props, mutable level)
- [x] Skill.nextLevelCost returns escalating costs: 50, 75, 100, 125, 150
- [x] Skill.levelUp() increments level (max 5)

## Next Phase Readiness

Ready for Plan 03-02 (SkillStore):
- Skill entity exists with observable properties
- Types ready for store to import
- Level/XP system ready for store integration
