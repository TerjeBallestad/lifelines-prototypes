# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-20)

**Core value:** Simple psychological variables combine to produce emergent characters -- no labels, just humanity
**Current focus:** Phase 4 Activities System - In progress

## Current Position

Phase: 4 of 6 (Activities System)
Plan: 4 of 6 in current phase
Status: In progress
Last activity: 2026-01-22 -- Completed 04-03-PLAN.md

Progress: [███████████████░] 60% (15/25 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 15
- Average duration: 3min
- Total execution time: ~46min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 3/3 | 15min | 5min |
| 2. Character Core | 5/5 | 16min | 3.2min |
| 3. Skills System | 4/4 | 11min | 2.75min |
| 4. Activities System | 4/6 | 6min | 1.5min |

**Recent Trend:**
- Last 5 plans: 03-04 (4min), 04-01 (2min), 04-02 (1min), 04-03 (2min), 04-04 (1min)
- Trend: Consistent fast execution

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Bottom-up architecture (entities -> stores -> UI) for Unreal portability
- [Roadmap]: 6 phases derived from 34 requirements across 7 categories
- [01-01]: Tailwind 4 CSS-first config via @plugin directive
- [01-01]: DaisyUI dark theme only - no theme switching
- [01-01]: ESLint 9 flat config with typescript-eslint strict presets
- [01-02]: Root store pattern with React Context for state management
- [01-02]: MobX spy debugging in development mode only
- [01-03]: Character class mirrors Unreal Actor pattern for portability
- [01-03]: 0-100 scale with 50 as average for personality/capacity traits
- [02-01]: Linear personality-to-modifier scaling (0-100 -> -0.2 to +0.2)
- [02-01]: Stress inverted: 0=good, 100=bad (unlike other resources)
- [02-01]: Modifier stacking is additive per CONTEXT.md decision
- [02-02]: Single setInterval pattern prevents timer drift
- [02-02]: Speed clamped 0-10x for debugging flexibility
- [02-03]: All 5 Big Five traits affect resources (E->socialBattery/mood, N->stress, C->focus/motivation, O->overskudd, A->socialBattery)
- [02-03]: Threshold-based modifiers: traits only affect resources when above/below 50
- [02-03]: Boundary thresholds: exhausted<=10, overstressed>=90, sociallyDrained<=10
- [02-04]: Recharts for radar charts, DaisyUI radial-progress for gauges
- [02-04]: Resource color coding: 70+ success, 30-70 warning, <30 error
- [02-05]: Sidebar layout with CharacterPanel for persistent resource visibility
- [02-05]: Dev sliders in expandable details for testing emergence
- [03-01]: Skill follows Character pattern with makeAutoObservable
- [03-01]: Escalating XP formula: 50 + (nextLevel - 1) * 25 for levels 1-5
- [03-02]: DAG validation on seedSkills, not constructor
- [03-02]: Kahn's algorithm for cycle detection in skill prerequisites
- [03-03]: 8 skills across 3 domains with cross-domain dependency (go-to-store)
- [03-03]: Seed testing XP on init for immediate unlock testing
- [03-04]: State-based CSS classes (opacity/grayscale for locked, ring for unlockable/mastered)
- [03-04]: Emoji icons for skill states (simplicity over icon library)
- [03-04]: Prerequisite display shows Lv.current/required format
- [04-01]: Polynomial mastery XP curve: 100 * (level+1)^1.5
- [04-01]: Mastery caps at level 10 for bounded progression
- [04-01]: Diminishing domain XP returns (100% at L1, 10% at L10) encourages variety
- [04-01]: CapacityKey type enables type-safe capacity profile access
- [04-02]: MIN_OVERSKUDD_TO_START = 20 as configurable constant
- [04-02]: canStartActivity returns { canStart, reason } for UI flexibility
- [04-02]: Narrative error messages include character name
- [04-03]: Activity tick runs AFTER character passive update to avoid double-dipping
- [04-03]: Success probability from capacity ratio + mastery bonus (+5% per level)
- [04-03]: Failed activities: 50% mastery XP, 5-point overskudd/mood penalty
- [04-04]: 8 activities balance domains and showcase drain/restore mechanics
- [04-04]: Capacity profiles use realistic 35-60 range (around average 50)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-22
Stopped at: Completed 04-03-PLAN.md
Resume file: None

## Phase 4 Progress

Phase 4 Activities System:
- 04-01: Activity entity & types - COMPLETE
- 04-02: ActivityStore - COMPLETE
- 04-03: Tick integration & Sonner - COMPLETE
- 04-04: Activities seed data - COMPLETE
- 04-05: Activity queue UI - Pending
- 04-06: Toast notifications - Pending

Next: 04-05 Activity queue UI
