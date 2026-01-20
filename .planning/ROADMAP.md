# Roadmap: Lifelines Prototypes

## Overview

This prototype validates whether simple psychological variables (personality, capacities, resources) can produce emergent character behavior that feels human. We build bottom-up: entity classes first, then stores, then the activity-XP-skill loop, then UI visualization. The journey ends with a single character whose behavior emerges from underlying systems without diagnostic labels.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffolding and core architecture
- [ ] **Phase 2: Character Core** - Personality, capacities, and resources data model
- [ ] **Phase 3: Skills System** - Skill DAG with dependencies, states, and XP
- [ ] **Phase 4: Activities System** - Activities that train skills and drain resources
- [ ] **Phase 5: Talents System** - Roguelike modifiers with pick-1-of-3 selection
- [ ] **Phase 6: Integration & Observation** - Dashboard, emergence validation, tweaking tools

## Phase Details

### Phase 1: Foundation
**Goal**: Project runs with MobX architecture that mirrors Unreal patterns
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02
**Success Criteria** (what must be TRUE):
  1. React app runs with Vite dev server
  2. MobX root store exists with React Context integration
  3. Can create a character entity with observable properties
  4. Can modify character values and see React re-render
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Project setup with Vite, React, MobX, Tailwind, DaisyUI
- [x] 01-02-PLAN.md — Root store pattern with React Context integration
- [x] 01-03-PLAN.md — Character entity class with observable properties and proof-of-concept UI

### Phase 2: Character Core
**Goal**: Character has personality, capacities, and resources that affect each other
**Depends on**: Phase 1
**Requirements**: PERS-01, PERS-02, PERS-03, PERS-04, PERS-05, CAPS-01, CAPS-02, CAPS-03, CAPS-04, CAPS-05, RSRC-01, RSRC-02, RSRC-03, RSRC-04, RSRC-05
**Success Criteria** (what must be TRUE):
  1. Character displays Big Five personality dimensions visually
  2. Character displays mental capacities visually
  3. Character displays resources (energy, social battery, stress) visually
  4. Personality affects resource drain rates (low extraversion = faster social drain)
  5. Resources drain/recover over time based on personality
**Plans**: TBD

Plans:
- [ ] 02-01: Personality entity with Big Five dimensions
- [ ] 02-02: Mental capacities entity
- [ ] 02-03: Resources entity with drain/recovery mechanics
- [ ] 02-04: Personality-resource interaction (drain rate modifiers)
- [ ] 02-05: Character panel UI showing all three systems

### Phase 3: Skills System
**Goal**: Skills exist in a dependency graph where prerequisites gate unlocking
**Depends on**: Phase 2
**Requirements**: SKIL-01, SKIL-02, SKIL-03, SKIL-04, SKIL-05, INFR-03
**Success Criteria** (what must be TRUE):
  1. 5-8 skills exist in a meaningful dependency tree
  2. Skill states (locked, unlockable, unlocked, mastered) display correctly
  3. Player can see WHY a skill is locked (missing prerequisites shown)
  4. Skills accumulate XP and progress toward next state
  5. Skill tree renders visually with connections showing dependencies
**Plans**: TBD

Plans:
- [ ] 03-01: Skill entity class with states and XP
- [ ] 03-02: SkillGraph DAG with dependency validation
- [ ] 03-03: SkillStore with unlock logic
- [ ] 03-04: Skill tree visualization (SVG/React)

### Phase 4: Activities System
**Goal**: Player assigns activities that generate XP and drain resources based on character fit
**Depends on**: Phase 3
**Requirements**: ACTV-01, ACTV-02, ACTV-03, ACTV-04, ACTV-05, ACTV-06, INFR-04
**Success Criteria** (what must be TRUE):
  1. 5-8 activities exist that interact with skills and capacities
  2. Player can assign an activity to the character
  3. Completing activity generates XP for related skills
  4. Activities can succeed or fail based on skill level + capacities
  5. Activities drain resources based on personality fit
**Plans**: TBD

Plans:
- [ ] 04-01: Activity entity with capacity profiles and skill mappings
- [ ] 04-02: ActivityStore with assignment and completion logic
- [ ] 04-03: Success/failure calculation from skills + capacities
- [ ] 04-04: Resource drain from activity completion
- [ ] 04-05: Activity assignment UI

### Phase 5: Talents System
**Goal**: Player can select talents that modify the character's capabilities
**Depends on**: Phase 4
**Requirements**: TLNT-01, TLNT-02, TLNT-03, INFR-05
**Success Criteria** (what must be TRUE):
  1. 9-12 talents exist in the talent pool
  2. Talents modify capacities, skills, resources, or activity outcomes
  3. Player can select 1 of 3 offered talents (roguelike style)
  4. Selected talents visibly affect character behavior
**Plans**: TBD

Plans:
- [ ] 05-01: Talent entity with modifier system
- [ ] 05-02: TalentStore with pool and selection logic
- [ ] 05-03: Pick-1-of-3 selection UI
- [ ] 05-04: Talent effects integration with existing systems

### Phase 6: Integration & Observation
**Goal**: All systems work together to produce emergent behavior visible on dashboard
**Depends on**: Phase 5
**Requirements**: OBSV-01, OBSV-02, OBSV-03, OBSV-04
**Success Criteria** (what must be TRUE):
  1. Dashboard shows personality, capacities, skills, resources at a glance
  2. Player can observe character attempting activities and failing
  3. Different personality + capacity combinations produce visibly different behavior
  4. No diagnostic labels shown -- behavior emerges from underlying systems
**Plans**: TBD

Plans:
- [ ] 06-01: Patient state dashboard (unified view)
- [ ] 06-02: Activity observation with success/failure feedback
- [ ] 06-03: Emergence validation (create contrasting characters)
- [ ] 06-04: Remove any accidental labels, verify pure emergence

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete ✓ | 2026-01-20 |
| 2. Character Core | 0/5 | Not started | - |
| 3. Skills System | 0/4 | Not started | - |
| 4. Activities System | 0/5 | Not started | - |
| 5. Talents System | 0/4 | Not started | - |
| 6. Integration & Observation | 0/4 | Not started | - |

---
*Roadmap created: 2026-01-20*
*Last updated: 2026-01-20 (Phase 1 complete)*
