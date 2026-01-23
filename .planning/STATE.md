# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The player experiences satisfying growth by helping patients develop missing life skills - the victory isn't heroic, it's watching someone finally answer the phone.

**Current focus:** Phase 7 - Primary Needs Foundation

## Current Position

Phase: 7 of 12 (Primary Needs Foundation)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-01-23 - Completed 07-01-PLAN.md (Needs Types and Config)

Progress: [█░░░░░░░░░] ~8% (milestone v1.1, 1/~12 plans across 6 phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 1 (v1.1)
- Average duration: 2 min
- Total execution time: 2 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 07-primary-needs | 1 | 2 min | 2 min |

**Recent Trend:**
- 07-01: 2 min (2 tasks, 4 files)
- Trend: Starting strong

**v1.0 Reference:**
- 26 plans completed in 3 days
- 6 phases delivered
- Validated: Big Five personality, skill dependencies, activity-XP loop, talent selection

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

**v1.1 Architecture decisions:**
- MobX computed values for needs derivation (Mood from needs → Overskudd from mood/energy/purpose)
- Parallel v1.0/v1.1 with toggle, preserving validated mechanics
- Bottom-up dependency chain: Primary needs → Derived wellbeing → Action resources → Autonomous AI

**v1.1 Resource model:**
- Primary Needs (7): Hunger, Energy, Hygiene, Bladder, Social, Fun, Security
- Derived Wellbeing (2): Mood (from needs), Purpose (from activity-personality fit)
- Action Resources (4): Overskudd, socialBattery, Focus, Willpower
- Health Stats (1): Nutrition (slow-moving, affects Energy regen and Mood)

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 7-12 Risk:**
- Death spiral prevention built into asymptotic decay formula (07-01 complete)
- Nonlinear decay curves and mood floor critical to avoid cascading failures

**Phase 9 Design:**
- socialBattery formula needs design work to make Introvert/Extrovert FEEL different
- Social context taxonomy (solo/parallel/casual/active/intense) required before implementation

**Phase 12 Tooling:**
- Calculation trace overlay and runtime balance tuning UI scope unclear
- May require accelerated time simulation (7 days at 60x speed) for validation

## Session Continuity

Last session: 2026-01-23
Stopped at: Completed 07-01-PLAN.md (Needs Types and Config)
Resume file: None

**Next step:** Execute 07-02-PLAN.md (Toggle Integration) to enable needs decay in simulation loop
