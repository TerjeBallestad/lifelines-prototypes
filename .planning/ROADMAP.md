# Roadmap: Lifelines Prototypes

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-01-22)
- 🚧 **v1.1 Game Balance** - Phases 7-12 (in progress)

## Overview

v1.1 transforms the flat resource system into an interconnected needs-based simulation inspired by The Sims. Seven primary needs (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security) decay at differential rates and feed into derived wellbeing (Mood, Purpose), which determines action resources (Overskudd, socialBattery, Focus, Willpower). Patients autonomously select activities based on need urgency, personality alignment, and resource availability, creating emergent behavior from simple rules. The journey moves bottom-up through dependency layers: establish primary needs foundation → derive wellbeing stats → compute action resources → integrate with activities → implement autonomous AI → tune for balance.

## Phases

**Phase Numbering:**
- Phases 7-12 continue from v1.0's Phase 6
- Integer phases: Planned milestone work
- Decimal phases (if needed): Urgent insertions

<details>
<summary>✅ v1.0 MVP (Phases 1-6) - SHIPPED 2026-01-22</summary>

**Milestone Goal:** Validate emergent character behavior through personality traits, skills, and activities.

Phases 1-6 delivered: Big Five personality traits, mental capacities, roguelike talents, skill dependencies with visual tree, activity-based XP generation, patient observation and activity assignment. Prototype validated that different personality archetypes produce observably different behaviors without diagnostic labels.

**Details:** See v1.0 milestone documentation

</details>

## 🚧 v1.1 Game Balance (In Progress)

**Milestone Goal:** Replace flat resource drain with interconnected needs system where Mood, Purpose, and Overskudd emerge from primary needs and personality, enabling autonomous patient behavior.

### Phase 7: Primary Needs Foundation
**Goal:** Seven primary needs exist with differential decay rates and visual feedback, forming the foundation for all derived stats.

**Depends on:** Phase 6 (v1.0 completion)

**Requirements:** NEED-01, NEED-02, NEED-03, NEED-04, NEED-05, MIGR-01

**Success Criteria** (what must be TRUE):
1. Patient has 7 observable primary needs (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security) displayed with color-coded bars
2. Physiological needs (Hunger, Bladder, Energy) decay noticeably faster than social needs (Social, Fun)
3. Urgent needs (below 20%) display red bars and visual warning indicators
4. Player can observe a patient's need trajectory over time and identify which needs become critical first
5. Existing v1.0 resources (flat drain) run in parallel with new needs system via toggle

**Plans:** 3 plans

Plans:
- [x] 07-01-PLAN.md — Types, config, and Character needs decay logic
- [x] 07-02-PLAN.md — Toggle wiring, NeedsPanel UI components
- [x] 07-03-PLAN.md — Human verification checkpoint

### Phase 8: Derived Wellbeing
**Goal:** Mood and Purpose emerge as computed stats from primary needs and activity-personality alignment, affecting patient capability.

**Depends on:** Phase 7

**Requirements:** WELL-01, WELL-02, WELL-03, WELL-04, NEED-06

**Success Criteria** (what must be TRUE):
1. Patient Mood updates automatically as primary needs change, reflecting overall wellbeing
2. Patient with critical Hunger (10%) shows degraded Mood, but Mood doesn't collapse to zero (floor prevents death spiral)
3. Patient performing personality-aligned activities (high Openness patient doing creative work) shows higher Purpose than misaligned activities
4. Patient with low Purpose displays reduced Overskudd even when primary needs are satisfied
5. Nutrition stat changes slowly based on food quality, affecting Energy regeneration and baseline Mood

**Plans:** 4 plans

Plans:
- [x] 08-01-PLAN.md — Types, config, curve and smoothing utilities
- [x] 08-02-PLAN.md — Character integration (Mood, Purpose, Nutrition logic)
- [x] 08-03-PLAN.md — UI components (MoodIcon, DerivedStatsSection)
- [x] 08-04-PLAN.md — Human verification checkpoint

### Phase 9: Action Resources
**Goal:** Overskudd, socialBattery, Focus, and Willpower are computed from needs and personality, gating which activities are affordable.

**Depends on:** Phase 8

**Requirements:** RSRC-01, RSRC-02, RSRC-03, RSRC-04, RSRC-05

**Success Criteria** (what must be TRUE):
1. Patient Overskudd decreases when Mood, Energy, or Purpose are low, making difficult activities unavailable
2. Introvert patient (low Extraversion) loses socialBattery during social activities and regenerates when alone
3. Extrovert patient (high Extraversion) gains socialBattery during social activities and drains when alone
4. Concentration activities (reading, studying) are blocked when patient Focus is depleted
5. Low Willpower significantly reduces available Overskudd, creating visible impact on activity affordability

**Plans:** 3 plans

Plans:
- [x] 09-01-PLAN.md — Types, config, and Character action resources logic
- [x] 09-02-PLAN.md — ActionResourcesSection UI and NeedsPanel integration
- [x] 09-03-PLAN.md — Human verification checkpoint

### Phase 9.1: Activity Difficulty (INSERTED)
**Goal:** Activities have difficulty ratings calculated from skill level and mastery, with visual display for player decision-making.

**Depends on:** Phase 9

**Requirements:** ACTV-02 (partial - calculation only, integration in Phase 10)

**Success Criteria** (what must be TRUE):
1. Each activity has a base difficulty rating (1-5 stars) with skill requirements
2. Skill level reduces effective difficulty (skilled patient finds activity easier)
3. Mastery level reduces effective difficulty (practiced activity becomes easier)
4. Player can see difficulty stars and skill requirements on activity cards
5. Tooltip shows difficulty breakdown (base, skill reduction, mastery reduction)

**Plans:** 3 plans

Plans:
- [x] 09.1-01-PLAN.md — Difficulty types, config, and Activity calculation methods
- [x] 09.1-02-PLAN.md — Activity data and DifficultyStars UI component
- [x] 09.1-03-PLAN.md — Human verification checkpoint

### Phase 10: Activity-Need Integration
**Goal:** Activities restore specific needs, consume resources scaled by difficulty, and integrate personality alignment, creating the gameplay loop.

**Depends on:** Phase 9.1

**Requirements:** ACTV-01, ACTV-02, ACTV-03, ACTV-04

**Success Criteria** (what must be TRUE):
1. Patient eating a meal observably restores Hunger, patient socializing restores Social need
2. Difficulty affects resource costs: higher difficulty = more Overskudd/Willpower/Focus drain
3. Skill level reduces costs via difficulty: skilled patient spends less resources than unskilled on same activity
4. Personality alignment modifies difficulty: extrovert finds social activities easier, introvert finds solo activities easier
5. Activity tooltips display estimated costs based on difficulty (costs Willpower -15 at your skill level)
6. Patient struggling with critical needs (below 20%) sees reduced activity costs, preventing total paralysis
7. Player can observe clear cause-effect between activities and need changes

**Plans:** 5 plans

Plans:
- [x] 10-01-PLAN.md — Core types (tags, needEffects) and personality alignment utility
- [x] 10-02-PLAN.md — Activity.getResourceCosts method and starter activities data
- [x] 10-03-PLAN.md — Need restoration and cost integration in ActivityStore
- [x] 10-04-PLAN.md — UI feedback (FloatingNumber, tooltips, completion summary)
- [x] 10-05-PLAN.md — Human verification checkpoint

### Phase 10.1: Remove v1.0 Resource System (INSERTED)
**Goal:** Remove legacy v1.0 flat resource system now that v1.1 needs-based system is verified, reducing code complexity and UI clutter.

**Depends on:** Phase 10

**Requirements:** MIGR-01 (cleanup)

**Success Criteria** (what must be TRUE):
1. v1.0 resource properties removed from Character (energy, mood, overskudd as flat values)
2. v1.0 resourceEffects removed from activities (legacy drain/restore values)
3. needsSystemEnabled toggle removed (v1.1 is now the only system)
4. UI no longer shows old resource bars or toggle
5. No runtime errors when starting fresh game

**Plans:** 3 plans

Plans:
- [x] 10.1-01-PLAN.md — Remove toggle UI and conditional rendering
- [x] 10.1-02-PLAN.md — Remove v1.0 from stores, types, and activity data
- [x] 10.1-03-PLAN.md — Human verification checkpoint

### Phase 11: Autonomous AI
**Goal:** Patient autonomously selects activities based on utility scoring of need urgency, personality fit, and resource availability.

**Depends on:** Phase 10

**Requirements:** AUTO-01, AUTO-02, AUTO-03, AUTO-04

**Success Criteria** (what must be TRUE):
1. Patient in autonomous mode evaluates all available activities and picks based on current needs and personality
2. Patient with critical Hunger (below 15%) prioritizes eating over personality-preferred activities
3. Patient doesn't always pick the #1 scored activity, shows variety by choosing randomly from top 3-5 options
4. Player can toggle patient between autonomous (AI-controlled) and manual (player-controlled) modes at any time
5. Player can observe patient's autonomous behavior over 10 minutes and identify emergent patterns based on personality

**Plans:** TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

### Phase 12: Tuning & Balance
**Goal:** Decay rates, formulas, and thresholds are tuned for sustainable gameplay loops without death spirals or boring maintenance.

**Depends on:** Phase 11

**Requirements:** MIGR-02, MIGR-03

**Success Criteria** (what must be TRUE):
1. Player can inspect why derived stats have current values via calculation trace overlay (Overskudd = f(Mood, Energy, Purpose, Willpower) with breakdown)
2. Balance config allows runtime adjustment of decay rates and formula weights without code changes
3. Autonomous patient observed for 7 in-game days maintains needs above critical threshold without player intervention
4. Introvert and Extrovert patients show observably different activity patterns over 24 hours (different social frequency, different regeneration activities)
5. Player testing reveals no dominant "spam maintenance" strategy that trivializes skill-building gameplay

**Plans:** TBD

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 7 → 8 → 9 → 9.1 → 10 → 10.1 → 11 → 12

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 7. Primary Needs Foundation | v1.1 | 3/3 | ✓ Complete | 2026-01-23 |
| 8. Derived Wellbeing | v1.1 | 4/4 | ✓ Complete | 2026-01-23 |
| 9. Action Resources | v1.1 | 3/3 | ✓ Complete | 2026-01-23 |
| 9.1 Activity Difficulty | v1.1 | 3/3 | ✓ Complete | 2026-01-23 |
| 10. Activity-Need Integration | v1.1 | 5/5 | ✓ Complete | 2026-01-25 |
| 10.1 Remove v1.0 Resources | v1.1 | 3/3 | ✓ Complete | 2026-01-25 |
| 11. Autonomous AI | v1.1 | 0/TBD | Not started | - |
| 12. Tuning & Balance | v1.1 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-23*
*Last updated: 2026-01-25 (Phase 10.1 complete)*
