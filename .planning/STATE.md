# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The player experiences satisfying growth by helping patients develop missing life skills - the victory isn't heroic, it's watching someone finally answer the phone.

**Current focus:** Phase 9 in progress - Action Resources

## Current Position

Phase: 9 of 12 (Action Resources)
Plan: 3 of 3 in current phase
Status: ✓ Phase 9 complete
Last activity: 2026-01-23 - Completed 09-03-PLAN.md (verification checkpoint)

Progress: [███████░░░] ~77% (milestone v1.1, 10/13 plans across 7 phases)

## Performance Metrics

**Velocity:**

- Total plans completed: 10 (v1.1)
- Average duration: ~2.6 min (code plans only)
- Total execution time: ~31 min (excluding human verification)

**By Phase:**

| Phase                | Plans | Total  | Avg/Plan |
| -------------------- | ----- | ------ | -------- |
| 07-primary-needs     | 3     | 5 min  | 1.7 min  |
| 08-derived-wellbeing | 4     | 7 min  | 2.3 min  |
| 09-action-resources  | 3     | 19 min | 6.3 min  |

**Recent Trend:**

- 07-01: 2 min (2 tasks, 4 files)
- 07-02: 3 min (3 tasks, 6 files)
- 07-03: Human verification (1 checkpoint)
- 08-01: 2 min (3 tasks, 4 files)
- 08-02: 4 min (3 tasks, 1 file)
- 08-03: 1 min (4 tasks, 4 files)
- 08-04: Human verification (1 checkpoint)
- 09-01: 5 min (2 tasks, 3 files)
- 09-02: 3 min (3 tasks, 3 files)
- 09-03: 11 min (1 checkpoint + 1 fix, 1 file)
- Trend: Consistent rapid delivery, verification checkpoints ~10 min

**v1.0 Reference:**

- 26 plans completed in 3 days
- 6 phases delivered
- Validated: Big Five personality, skill dependencies, activity-XP loop, talent selection

_Updated after each plan completion_

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

**v1.1 Architecture decisions:**

- MobX computed values for needs derivation (Mood from needs -> Overskudd from mood/energy/purpose)
- Parallel v1.0/v1.1 with toggle, preserving validated mechanics
- Bottom-up dependency chain: Primary needs -> Derived wellbeing -> Action resources -> Autonomous AI

**v1.1 Resource model:**

- Primary Needs (7): Hunger, Energy, Hygiene, Bladder, Social, Fun, Security
- Derived Wellbeing (2): Mood (from needs), Purpose (from activity-personality fit)
- Action Resources (4): Overskudd, socialBattery, Focus, Willpower
- Health Stats (1): Nutrition (slow-moving, affects Energy regen and Mood)

**07-02 Toggle Implementation:**

- needsSystemEnabled toggle in RootStore controls which system runs
- Color thresholds for urgency: green >= 70, yellow >= 40, orange >= 20, red < 20
- Critical indicator: animate-pulse for needs below 20%

**07-03 Verification Complete:**

- All Phase 7 success criteria verified by human testing
- Asymptotic decay confirmed working (needs slow near floor)
- Differential decay visible to player (physiological faster than social)

**08-01 Derived Stats Foundation:**

- Sigmoid steepness=2.0 for balanced need-to-mood curve
- Mood floor=10, ceiling=95 to prevent extreme states
- Hunger/energy weighted 1.5x for survival importance
- Nutrition smoothing alpha=0.01 (very slow) vs mood alpha=0.1 (moderate)

**08-02 Character Integration:**

- Steepness 2.5 for mood curves (slightly steeper for dramatic response)
- Purpose equilibrium clamped to 20-80 (prevents extreme personality baselines)
- Food quality uses 90/10 EMA for slow nutrition response
- Tick update chains: applyNeedsDecay -> applyDerivedStatsUpdate

**08-03 UI Display:**

- Mood shown as emoji (happy/content/neutral/sad) for intuitive understanding
- Purpose bar shows equilibrium marker with personality baseline indicator
- Derived Wellbeing section visually separated from Primary Needs via border-t

**08-04 Verification Complete:**

- All Phase 8 success criteria verified by human testing
- Mood tooltip correctly shows need contributions
- Mood floor prevents death spiral (critical hunger degrades but doesn't collapse mood)
- Purpose equilibrium responds to personality adjustments
- Nutrition changes very slowly as designed

**09-01 Action Resources Foundation:**

- Overskudd recovery rate boosted by Willpower (effectiveAlpha modifier)
- socialBattery drain/charge inverts at Extraversion 40/60 thresholds
- Ambivert neutral target (50) in both contexts
- zeroSocialBattery drains Willpower to force breaks
- Fun need boosts Willpower target (not recovery rate)

**09-02 Action Resources UI:**

- Single color per resource (not threshold-based): blue (Overskudd), purple (socialBattery), teal (Focus), amber (Willpower)
- DaisyUI progress classes: progress-primary, progress-secondary, progress-accent, progress-warning
- Tooltip breakdowns show contributing factors via data-tip
- Personality badge (Introvert/Extrovert/Ambivert) displays below socialBattery
- ActionResourcesSection follows DerivedStatsSection pattern with border-t separation

**09-03 Verification Complete:**

- All Phase 9 success criteria verified by human testing
- Overskudd responds to Mood/Energy/Purpose changes
- socialBattery behavior confirmed for introverts (charging alone) and extroverts (draining alone)
- Focus at full capacity, Willpower affecting Overskudd recovery
- Refactored tooltips from DaisyUI to native Popover API (fixes overflow/clipping)
- Native Popover API now standard pattern (matches MoodIcon from Phase 8)

### Pending Todos

No pending todos.

### Roadmap Evolution

- Phase 9.1 inserted after Phase 9: Activity difficulty ratings and calculations (INSERTED)

### Blockers/Concerns

**Phase 12 Tooling:**

- Calculation trace overlay and runtime balance tuning UI scope unclear
- May require accelerated time simulation (7 days at 60x speed) for validation

## Session Continuity

Last session: 2026-01-23
Stopped at: Completed 09-03-PLAN.md (Phase 9 verification complete)
Resume file: None

**Next step:** Phase 9.1 - Activity Difficulty (inserted phase)
