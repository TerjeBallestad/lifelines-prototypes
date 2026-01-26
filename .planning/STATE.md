# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26 with GDD vision)

**Core value:** The player experiences satisfying growth by helping patients develop missing life skills - the victory isn't heroic, it's watching someone finally answer the phone.

**Current focus:** Phase 11 - Autonomous AI (in progress)

## Current Position

Phase: 11 of 12 (Autonomous AI) - IN PROGRESS
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-01-26 - Completed 11-03-PLAN.md (AI Components)

Progress: [███████████░] 96% (24/25 plans: 18 phases 7-10 + 3 phase 10.1 + 3 phase 11)

## Performance Metrics

**Velocity:**

- Total plans completed: 21 (v1.1)
- Average duration: ~3.4 min (code plans only)
- Total execution time: ~65 min (excluding human verification)

**By Phase:**

| Phase                       | Plans | Total    | Avg/Plan |
| --------------------------- | ----- | -------- | -------- |
| 07-primary-needs            | 3     | 5 min    | 1.7 min  |
| 08-derived-wellbeing        | 4     | 7 min    | 2.3 min  |
| 09-action-resources         | 3     | 19 min   | 6.3 min  |
| 09.1-activity-difficulty    | 3     | 21 min   | 7.0 min  |
| 10-activity-need-integration| 5     | ~12 min  | 2.4 min  |
| 10.1-remove-v1-resources    | 3     | ~15 min  | 5.0 min  |
| 11-autonomous-ai            | 3     | 6.7 min  | 2.2 min  |

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
- 09.1-01: 3 min (2 tasks, 4 files)
- 09.1-02: 3 min (3 tasks, 3 files)
- 09.1-03: 15 min (1 checkpoint + 6 bug fixes)
- 10-01: 1.4 min (2 tasks, 2 files)
- 10-02: 1.8 min (2 tasks, 2 files)
- 10-03: 2.9 min (2 tasks, 1 file)
- 10-04: 3.3 min (3 tasks, 4 files)
- 10-05: Human verification (1 checkpoint + 2 bug fixes)
- 10.1-01: 2.2 min (3 tasks, 4 files)
- 10.1-02: 9.9 min (3 tasks + 1 bug fix, 7 files)
- quick-001: 7.9 min (2 tasks, 2 files) - Documentation update
- 11-01: 2.4 min (2 tasks, 2 files)
- 11-02: 2.8 min (3 tasks, 3 files)
- 11-03: 1.5 min (3 tasks, 3 files)
- Trend: Consistent rapid delivery, verification checkpoints ~10-15 min

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
- Bottom-up dependency chain: Primary needs -> Derived wellbeing -> Action resources -> Autonomous AI
- v1.0 system fully removed (Phase 10.1)

**v1.1 Resource model:**

- Primary Needs (7): Hunger, Energy, Hygiene, Bladder, Social, Fun, Security
- Derived Wellbeing (2): Mood (from needs), Purpose (from activity-personality fit)
- Action Resources (4): Overskudd, socialBattery, Focus, Willpower
- Health Stats (1): Nutrition (slow-moving, affects Energy regen and Mood)

**07-02 Toggle Implementation (REMOVED in 10.1-02):**

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

**09.1-01 Difficulty Calculation Foundation:**

- Square root diminishing returns for both skills and mastery (prevents min/maxing)
- Max 1.5 stars reduction from skills, 1.0 from mastery (activities stay challenging)
- Backward compatible: activities default to 3 stars difficulty if not specified
- Difficulty breakdown pattern: base, effective, reductions, per-skill details for tooltips

**09.1-02 Difficulty UI Display:**

- DaisyUI rating component with mask-star-2 for star shapes (read-only divs, not inputs)
- Semantic color coding: bg-success (1-2 easy), bg-warning (2.5-3.5 medium), bg-error (4-5 hard)
- Native Popover API tooltips matching ActionResourcesSection pattern
- ActivityCard character prop enables personalized difficulty display
- All 8 starter activities have baseDifficulty and skillRequirements specified

**09.1-03 Verification Complete:**

- Difficulty stars visible and color-coded correctly
- Tooltip breakdown shows skill/mastery contributions when skills are leveled
- Skill requirements displayed on activity cards (green if learned, ghost if not)
- Bug fixes: star sizing, popover positioning, Character.getSkill() method for skill access
- Scope adjusted: cost integration moved to Phase 10 (calculation-only in Phase 9.1)

**10-01 Activity Alignment Foundation:**

- ActivityData.tags field for personality alignment matching ('social', 'solo', 'creative', 'routine', 'cooperative', 'stressful', 'concentration')
- ActivityData.needEffects field for gradual need restoration during activity execution
- calculatePersonalityAlignment utility: Big Five traits → cost/gain multipliers (0.6-1.4 range)
- Tag-to-trait mappings: social/solo (Extraversion), creative (Openness), routine/concentration (Conscientiousness), cooperative (Agreeableness), stressful (Neuroticism)
- Modifier strength 25-40% for balanced impact without dominating choices
- Aligned activities are cheaper AND provide more restoration

**10-02 Activity Resource Costs:**

- Activity.getResourceCosts() method calculates costs from effective difficulty with personality alignment
- Linear difficulty-to-cost scaling (1:1): difficulty 1 = 5 base cost, difficulty 5 = 25 base cost
- No minimum cost floor (mastered activities can become nearly free)
- Cost distribution: overskudd (100%), willpower (50%), focus (30% if concentration), socialBattery (40% if social)
- All 8 starter activities have tags and needEffects for personality/need integration
- ResourceCosts interface includes alignment breakdown for tooltip display

**10-03 ActivityStore Cost Integration:**

- Escape valve mechanism: 50% cost reduction when any physiological need below 20%
- Prevents total paralysis during crisis (struggling patients can still act)
- Personality alignment applied to drains (lower costs) and restores (higher gains)
- Need restoration integrated into applyResourceEffects tick loop

**10-04 UI Feedback:**

- FloatingNumber component with CSS keyframes (float-up animation, 1.5s)
- Floating numbers emit only for significant changes (>= 0.5) to reduce noise
- Observable array pattern for ephemeral UI state with auto-cleanup after 2s
- Cumulative change tracking with Map cleared at activity start
- Completion summary shows max 4 significant changes in toast
- Activity cards display cost breakdown before starting
- Personality alignment shown as subtle "(Good/Poor fit)" indicator

**10-05 Verification Complete:**

- All Phase 10 success criteria verified by human testing
- socialBattery cost increased from 40% to 100% of base cost for noticeable impact
- Fixed smoother sync bug: external changes to socialBattery now persist
- Introverts doing social activities drain ~11 socialBattery over 20 ticks
- currentSocialContext properly set during activities for correct drift behavior

**10.1-01 UI Cleanup:**

- v1.1 needs toggle removed from SimulationControls
- CharacterPanel unconditionally renders NeedsPanel (no ResourcePanel)
- ComparisonView migrated to NeedsPanel
- ResourcePanel.tsx deleted (dead code)
- TypeScript errors on optional character.needs expected (fixed in Plan 02)

**10.1-02 Core Data Model Cleanup:**

- Removed needsSystemEnabled toggle and all v1.0 fallback branches from stores
- Made Character.needs/derivedStats/actionResources required (always initialized in constructor)
- Removed Resources/ResourceKey types, BASE_DRAIN_RATES/BASE_RECOVERY_RATES constants
- Removed all v1.0 methods from Character (activeModifiers, effectiveDrainRate, effectiveRecoveryRate, resourceModifierBreakdown)
- Removed resourceEffects from activities (only needEffects remain)
- Removed threshold DurationMode variant (used ResourceKey)
- Fixed broken ActivityCard resourceEffects preview (Rule 1 deviation)
- Character entity reduced by 253 lines (21% smaller)
- Net reduction: ~420 lines across 7 files

### Pending Todos

No pending todos.

### Roadmap Evolution

- Phase 9.1 inserted after Phase 9: Activity difficulty ratings and calculations (INSERTED)
- Phase 9.1 scope adjusted: calculation and display only, cost integration moved to Phase 10
- Phase 10.1 inserted after Phase 10: Remove v1.0 resource system (URGENT - reduce clutter)

### Blockers/Concerns

**Phase 12 Tooling:**

- Calculation trace overlay and runtime balance tuning UI scope unclear
- May require accelerated time simulation (7 days at 60x speed) for validation

**Skills per-character:**

- Skills are currently global (stored in SkillStore), not per-character
- Pre-existing architecture issue, not Phase 9.1 scope
- Consider addressing in future phase if needed

**10.1-03 Human Verification Complete:**

- All v1.0 removal criteria verified by human testing
- UI cleanup complete (no toggle, no ResourcePanel)
- Character displays v1.1 needs/derived stats/action resources correctly
- Activities queue, execute, restore needs, drain resources
- Simulation runs without runtime errors
- Orchestrator fixed 7 additional v1.0 references during verification

**11-01 Utility Scoring Foundation:**

- 5 utility factors: needUrgency (30%), personalityFit (20%), resourceAvailability (15%), willpowerMatch (15%), moodDelta (20%)
- Critical mode threshold: 15% for hunger/bladder/energy triggers survival override
- Hysteresis bonus: 25% for current activity to prevent constant switching
- All scoring functions return 0-100 normalized values (except scoreInCriticalMode)
- Types: UtilityFactors, UtilityWeights, AIDecision, DecisionLog + DEFAULT_UTILITY_WEIGHTS constant

**11-02 UtilityAIStore:**

- UtilityAIStore scores all available activities when patient is idle
- AI picks from top 3-5 scoring activities with weighted random selection
- Critical needs (below 15%) trigger pure urgency scoring without personality
- Free Will toggle per character controls whether AI picks activities (default ON)
- Decision log stores last 5 decisions with full breakdown
- Personality-based variety multiplier: openness flattens distribution, conscientiousness sharpens

**11-03 AI Components:**

- AI processTick wired to simulation tick (after activityStore.processTick)
- DecisionLogPanel shows last 5 decisions with expandable breakdown
- Free Will toggle in CharacterPanel's new Autonomy section
- Collapsible decision log with critical mode badges and utility factor details

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Update PROJECT.md with GDD decisions and create GDD summary | 2026-01-26 | 6503217 | [001-update-docs-with-gdd](./quick/001-update-docs-with-gdd/) |

## Session Continuity

Last session: 2026-01-26
Stopped at: Completed 11-03-PLAN.md (AI Components)
Resume file: None

**Next step:** 11-04-PLAN.md - Human verification of complete autonomous AI system
