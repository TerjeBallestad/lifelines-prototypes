# Requirements: Lifelines Prototypes

**Defined:** 2025-01-20
**Core Value:** Simple psychological variables combine to produce emergent characters -- no labels, just humanity

## v1 Requirements

Requirements for the first prototype. Each maps to roadmap phases.

### Personality System (OCEAN)

- [ ] **PERS-01**: Character has Big Five personality dimensions (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
- [ ] **PERS-02**: Each dimension is a numeric value (e.g., 0-100 or -1 to 1)
- [ ] **PERS-03**: Personality dimensions are displayed visually on character
- [ ] **PERS-04**: Personality affects resource drain rates (e.g., low extraversion = social energy drains faster in groups)
- [ ] **PERS-05**: Personality affects activity preferences (what feels easy vs hard)

### Mental Capacities

- [ ] **CAPS-01**: Character has mental capacities: Divergent Thinking, Convergent Thinking, Working Memory, Attention Span, Processing Speed, Emotional Regulation
- [ ] **CAPS-02**: Each capacity is a numeric value
- [ ] **CAPS-03**: Capacities displayed visually on character
- [ ] **CAPS-04**: Capacities affect activity success/failure likelihood
- [ ] **CAPS-05**: Capacities affect skill learning speed (aptitude)

### Skills

- [x] **SKIL-01**: Skills represent adult life abilities (answer phone, go outside, cook, etc.)
- [x] **SKIL-02**: Skills have dependencies modeled as DAG (can't "go to store" without "go outside")
- [x] **SKIL-03**: Skills have states: locked, unlockable, unlocked, mastered
- [x] **SKIL-04**: Skills accumulate XP toward next level
- [x] **SKIL-05**: Observable skill gaps -- player can see WHY a skill is locked (missing prerequisites)

### Activities

- [x] **ACTV-01**: Activities are actions the patient can attempt (cook meal, make phone call, go for walk)
- [x] **ACTV-02**: Activities have capacity profiles (which capacities affect success)
- [x] **ACTV-03**: Activities have resource costs (drain energy based on personality fit)
- [x] **ACTV-04**: Completing activities generates XP for related skills
- [x] **ACTV-05**: Activities can succeed or fail based on skill level + capacities
- [x] **ACTV-06**: Player assigns activities to patient

### Resources

- [ ] **RSRC-01**: Characters have mental/emotional resources (Energy, Social Battery, Stress Level)
- [ ] **RSRC-02**: Resources drain and recover over time
- [ ] **RSRC-03**: Drain/recovery rates affected by personality dimensions
- [ ] **RSRC-04**: Resources displayed visually
- [ ] **RSRC-05**: Low resources affect activity success and willingness

### Talents

- [x] **TLNT-01**: Talents are special modifiers (e.g., "Slow Metabolism", "Quick Learner")
- [x] **TLNT-02**: Talents modify capacities, skills, resources, or activity outcomes
- [x] **TLNT-03**: Player selects 1 of 3 talents when offered (roguelike style)

### Observation & Emergence

- [ ] **OBSV-01**: Patient state dashboard shows personality, capacities, skills, resources at a glance
- [ ] **OBSV-02**: Player can observe patient attempting activities and failing
- [ ] **OBSV-03**: Different personality + capacity combinations produce visibly different behavior
- [ ] **OBSV-04**: No diagnostic labels shown -- behavior emerges from underlying systems

### Prototype Infrastructure

- [x] **INFR-01**: Ability to create a character with configurable personality and capacities
- [x] **INFR-02**: Ability to tweak values and see behavior change
- [x] **INFR-03**: At least 5-8 skills in a meaningful dependency tree
- [x] **INFR-04**: At least 5-8 activities that interact with the systems
- [x] **INFR-05**: At least 9-12 talents in the pool for selection

## v2 Requirements

Deferred to future prototypes. Tracked but not in current roadmap.

### Assessments

- **ASMT-01**: Formal tests/conversations to pinpoint skill gaps
- **ASMT-02**: Assessment results reveal hidden capacity values

### Time & Simulation

- **TIME-01**: Time passes, resources drain/recover automatically
- **TIME-02**: Patient autonomously chooses activities based on personality
- **TIME-03**: Day/night cycle affects energy and activity availability

### Progression

- **PROG-01**: Milestone triggers for talent selection (not manual)
- **PROG-02**: Patient can "graduate" when skills reach threshold
- **PROG-03**: Multiple patients to manage simultaneously

### Social

- **SOCL-01**: Multiple characters interacting
- **SOCL-02**: Social activities between characters
- **SOCL-03**: Relationships form based on personality compatibility

## Out of Scope

Explicitly excluded from this prototype.

| Feature | Reason |
|---------|--------|
| Diagnostic labels | Core design philosophy -- behavior emerges, no finger-wagging |
| Full game loop | Prototype validates systems, not complete game |
| Art/polish | Functional UI sufficient for testing feel |
| Persistence/saving | Prototype runs in memory |
| Multiple patients | Start with one to validate system |
| Autonomous AI decisions | Player assigns activities for now; AI autonomy is v2 |
| Quest/story system | Focus on character simulation first |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PERS-01 | Phase 2 | Complete |
| PERS-02 | Phase 2 | Complete |
| PERS-03 | Phase 2 | Complete |
| PERS-04 | Phase 2 | Complete |
| PERS-05 | Phase 2 | Complete |
| CAPS-01 | Phase 2 | Complete |
| CAPS-02 | Phase 2 | Complete |
| CAPS-03 | Phase 2 | Complete |
| CAPS-04 | Phase 2 | Complete |
| CAPS-05 | Phase 2 | Complete |
| SKIL-01 | Phase 3 | Complete |
| SKIL-02 | Phase 3 | Complete |
| SKIL-03 | Phase 3 | Complete |
| SKIL-04 | Phase 3 | Complete |
| SKIL-05 | Phase 3 | Complete |
| ACTV-01 | Phase 4 | Complete |
| ACTV-02 | Phase 4 | Complete |
| ACTV-03 | Phase 4 | Complete |
| ACTV-04 | Phase 4 | Complete |
| ACTV-05 | Phase 4 | Complete |
| ACTV-06 | Phase 4 | Complete |
| RSRC-01 | Phase 2 | Complete |
| RSRC-02 | Phase 2 | Complete |
| RSRC-03 | Phase 2 | Complete |
| RSRC-04 | Phase 2 | Complete |
| RSRC-05 | Phase 2 | Complete |
| TLNT-01 | Phase 5 | Complete |
| TLNT-02 | Phase 5 | Complete |
| TLNT-03 | Phase 5 | Complete |
| OBSV-01 | Phase 6 | Pending |
| OBSV-02 | Phase 6 | Pending |
| OBSV-03 | Phase 6 | Pending |
| OBSV-04 | Phase 6 | Pending |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 1 | Complete |
| INFR-03 | Phase 3 | Complete |
| INFR-04 | Phase 4 | Complete |
| INFR-05 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

---
*Requirements defined: 2025-01-20*
*Last updated: 2026-01-22 (Phase 5 complete)*
