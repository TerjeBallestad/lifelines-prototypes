# Lifelines Prototypes

## What This Is

A React-based prototype validating emergent character behavior through simple psychological variables. Characters have Big Five personality traits, mental capacities, and resources that interact to produce observable behavior differences - without diagnostic labels. Built to inform the Unreal Engine implementation of Lifelines.

## Core Value

The player experiences satisfying growth by helping patients develop missing life skills - the victory isn't heroic, it's watching someone finally answer the phone.

## Requirements

### Validated

- Model traits as fixed personality attributes that affect needs - v1.0
- Model skills as adult life skills with dependencies - v1.0
- Model talents as roguelike power-ups chosen at milestones - v1.0
- Model activities that patients perform to train skills - v1.0
- Generate XP from activities that levels up appropriate skills - v1.0
- Allow player to observe patient behavior and identify skill gaps - v1.0
- Allow player to assign activities to patients - v1.0
- Show skill dependencies visually (skill tree) - v1.0
- Create at least one patient with traits, missing skills, and a path to autonomy - v1.0

### Active

(None - milestone complete, new requirements defined with next milestone)

### Out of Scope

- Full game loop (quests, progression, multiple facilities) - prototype validates systems
- Polish/art - functional UI sufficient for testing
- Multiple patients - validated with one character
- Persistence/saving - prototype runs in memory
- Autonomous AI decisions - player assigns activities (AI autonomy is v2)

## Context

**v1.0 shipped (2026-01-22):**
- 4,430 LOC TypeScript
- Tech stack: React, Vite, MobX, Tailwind 4, DaisyUI 5, Recharts
- 6 phases, 26 plans executed in 3 days
- All 34 requirements validated

**Prototype demonstrates:**
- Big Five personality affects resource drain rates (emergence validated)
- Different archetypes produce observably different behavior (OBSV-03)
- No clinical labels needed - behavior emerges from underlying systems (OBSV-04)
- Architecture mirrors Unreal Actor pattern for future port

**Next milestone options:**
- Unreal Engine port (use React prototype as reference)
- Additional activities/skills (system proven, content needed)
- Relationship dynamics (multi-character foundation exists)
- Autonomous AI decisions (patient chooses activities based on personality)

## Constraints

- **Tech stack**: React, Tailwind, DaisyUI, MobX - chosen for familiarity and Unreal portability
- **Scope**: Single prototype exploring character emergence, not a complete game
- **Fidelity**: Functional over polished - we're testing if the loop feels fun

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + MobX for prototypes | Faster than Unreal, OO pattern transfers well | Good - 3-day prototype |
| Three-layer character model (traits/skills/talents) | Separates innate, learned, and chosen attributes | Good - clean separation |
| Piaget-inspired skill dependencies | Creates diagnosis gameplay, skills must build on each other | Good - visible skill gaps |
| Roguelike talent selection | Adds fun/spice without complexity | Good - engaging choice |
| 0-100 scale with 50 as average | Consistent, intuitive, maps to Unreal | Good - portable |
| Bottom-up architecture (entities -> stores -> UI) | Mirrors Unreal Actor pattern | Good - ready for port |
| Personality-to-resource modifiers | Creates emergence from simple rules | Good - validated OBSV-03 |
| No clinical terminology | Core philosophy - behavior emerges | Good - validated OBSV-04 |

---
*Last updated: 2026-01-23 after v1.0 milestone*
