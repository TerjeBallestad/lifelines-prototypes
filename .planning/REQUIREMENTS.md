# Requirements: Lifelines Prototypes

**Defined:** 2026-01-23
**Core Value:** The player experiences satisfying growth by helping patients develop missing life skills - the victory isn't heroic, it's watching someone finally answer the phone.

## v1.1 Requirements

Requirements for Game Balance milestone. Each maps to roadmap phases.

### Primary Needs

- [ ] **NEED-01**: 7 primary needs exist (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security)
- [ ] **NEED-02**: Each need has a differential decay rate (physiological faster than social)
- [ ] **NEED-03**: Needs use Maslow-style curves (Hunger/Bladder/Energy spike urgently, Social/Fun are gentler)
- [ ] **NEED-04**: Critical threshold at 20% triggers urgent behavior indicators
- [ ] **NEED-05**: Visual feedback with color-coded bars (green/yellow/orange/red)
- [ ] **NEED-06**: Nutrition exists as slow-moving health stat affecting Energy regen and Mood

### Derived Wellbeing

- [ ] **WELL-01**: Mood is computed from primary need satisfaction (weighted average)
- [ ] **WELL-02**: Mood has a floor value (prevents death spiral from one bad need)
- [ ] **WELL-03**: Purpose is computed from activity-personality alignment
- [ ] **WELL-04**: Low Purpose affects Overskudd negatively

### Action Resources

- [ ] **RSRC-01**: Overskudd is derived from mood, energy, purpose, willpower (not flat drain)
- [ ] **RSRC-02**: socialBattery affected by extraversion (introverts drain in social, extraverts regen)
- [ ] **RSRC-03**: Focus is spent on concentration-requiring tasks
- [ ] **RSRC-04**: Willpower is spent to start difficult tasks
- [ ] **RSRC-05**: Low Willpower significantly affects Overskudd

### Activity System

- [ ] **ACTV-01**: Activities restore specific needs (eating → Hunger, socializing → Social)
- [ ] **ACTV-02**: Activity resource costs decrease as relevant skills improve
- [ ] **ACTV-03**: Activities "advertise" their benefits for AI evaluation
- [ ] **ACTV-04**: Escape valve: costs reduced when patient is struggling (needs below threshold)

### Autonomous AI

- [ ] **AUTO-01**: Utility-based scoring evaluates all available activities
- [ ] **AUTO-02**: Need urgency weights decisions (critical needs override preferences)
- [ ] **AUTO-03**: AI picks randomly from top 3-5 scoring activities (not always #1)
- [ ] **AUTO-04**: Patient can be toggled between autonomous and player-controlled modes

### Migration & Balance

- [ ] **MIGR-01**: Existing v1.0 resources migrated to new structure
- [ ] **MIGR-02**: Calculation trace tooling shows why derived values are what they are
- [ ] **MIGR-03**: Balance config allows runtime tuning of decay rates and formulas

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Personality Integration

- **PERS-01**: Activity-personality fit bonuses (matching interests = more resource gain)
- **PERS-02**: Personality affects which activities patient prefers autonomously

### Progressive Autonomy

- **PROG-01**: Autonomy levels (0-3) reflecting patient development
- **PROG-02**: Early game: AI makes suboptimal choices, needs player guidance
- **PROG-03**: Late game: AI makes strategic choices, player role shifts to coach

### Advanced AI

- **AADV-01**: Proximity/recency bonuses for activity selection
- **AADV-02**: Context-aware decisions (time of day, recent events)
- **AADV-03**: Goal persistence (finish what you started)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Victory conditions / endgame | Balance system first, win states in future milestone |
| Multiple patients | Single patient validates system |
| Persistence / saving | Prototype runs in memory |
| Full game loop (quests, facilities) | Prototype validates systems only |
| Polish / art | Functional UI sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NEED-01 | TBD | Pending |
| NEED-02 | TBD | Pending |
| NEED-03 | TBD | Pending |
| NEED-04 | TBD | Pending |
| NEED-05 | TBD | Pending |
| NEED-06 | TBD | Pending |
| WELL-01 | TBD | Pending |
| WELL-02 | TBD | Pending |
| WELL-03 | TBD | Pending |
| WELL-04 | TBD | Pending |
| RSRC-01 | TBD | Pending |
| RSRC-02 | TBD | Pending |
| RSRC-03 | TBD | Pending |
| RSRC-04 | TBD | Pending |
| RSRC-05 | TBD | Pending |
| ACTV-01 | TBD | Pending |
| ACTV-02 | TBD | Pending |
| ACTV-03 | TBD | Pending |
| ACTV-04 | TBD | Pending |
| AUTO-01 | TBD | Pending |
| AUTO-02 | TBD | Pending |
| AUTO-03 | TBD | Pending |
| AUTO-04 | TBD | Pending |
| MIGR-01 | TBD | Pending |
| MIGR-02 | TBD | Pending |
| MIGR-03 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 26 total
- Mapped to phases: 0
- Unmapped: 26

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 after initial definition*
