# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-27 after v1.1 milestone)

**Core value:** The player experiences satisfying growth by helping patients develop missing life skills - the victory isn't heroic, it's watching someone finally answer the phone.

**Current focus:** Planning next milestone

## Current Position

Milestone: v1.1 Game Balance - SHIPPED
Phase: 12 of 12 (Tuning & Balance) - SHIPPED
Plan: 5 of 5 in current phase - SHIPPED
Status: Ready for next milestone
Last activity: 2026-01-27 - v1.1 milestone archived

Progress: [████████████████████████████] 100% (v1.1 complete)

## Milestones Shipped

| Milestone | Phases | Plans | Shipped |
|-----------|--------|-------|---------|
| v1.0 MVP | 1-6 | 26 | 2026-01-22 |
| v1.1 Game Balance | 7-12 | 30 | 2026-01-27 |

**Total:** 56 plans across 12 phases

## Accumulated Context

### Architecture Summary

**Character Model:**
- Primary Needs (7): Hunger, Energy, Hygiene, Bladder, Social, Fun, Security
- Derived Wellbeing (3): Mood (from needs), Purpose (from activity-personality fit), Nutrition (slow-moving)
- Action Resources (4): Overskudd, socialBattery, Focus, Willpower
- Personality: Big Five traits (0-100 scale, 50 average)
- Skills: 8 adult life skills with DAG dependencies
- Talents: Roguelike pick-1-of-3 power-ups

**Stores:**
- CharacterStore, SkillStore, TalentStore, ActivityStore
- UtilityAIStore (autonomous activity selection)
- TelemetryStore (simulation capture)
- BalanceConfigStore (runtime tuning)

**Key Patterns:**
- MobX computed values for reactive derivation chains
- Native Popover API for tooltips (not DaisyUI)
- Utility scoring with neutral caps for "can I?" factors
- Satiation penalty (negative urgency when needs > 80%)
- Asymptotic decay preventing death spirals

### Open Blockers

None.

### Skills Architecture Note

Skills are currently global (stored in SkillStore), not per-character. This is a pre-existing v1.0 design. Consider addressing if multiple patients are added.

## Session Continuity

Last session: 2026-01-27
Stopped at: v1.1 milestone archived
Resume file: None

**Next step:** `/gsd:new-milestone` to define v1.2 or v2.0
