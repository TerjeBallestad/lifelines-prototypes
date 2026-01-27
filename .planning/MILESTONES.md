# Project Milestones: Lifelines Prototypes

## v1.1 Game Balance (Shipped: 2026-01-27)

**Delivered:** Interconnected needs-based simulation where primary needs feed derived wellbeing, which determines action resources, enabling autonomous patient behavior based on utility scoring.

**Phases completed:** 7-12 including 9.1, 10.1 (30 plans total)

**Key accomplishments:**

- Seven primary needs with differential decay rates and Maslow-style urgency curves
- Derived wellbeing (Mood, Purpose, Nutrition) computed from needs and personality
- Action resources (Overskudd, socialBattery, Focus, Willpower) gating activity affordability
- Activity-need integration with personality alignment and difficulty-based costs
- Autonomous AI with utility scoring selecting activities based on needs and personality
- Balance tuning tools: calculation traces, runtime config, headless simulation with telemetry

**Stats:**

- 150 files created/modified
- 10,327 lines of TypeScript (21,249 net additions)
- 8 phases, 30 plans
- 5 days from start to ship (2026-01-23 to 2026-01-27)

**Git range:** `feat(07-01)` → `feat(12-04)`

**What's next:** Port to Unreal Engine, explore progressive autonomy (patient learning), or add multiple patients

---

## v1.0 MVP (Shipped: 2026-01-22)

**Delivered:** First prototype validating that simple psychological variables produce emergent character behavior without diagnostic labels.

**Phases completed:** 1-6 (26 plans total)

**Key accomplishments:**

- Character emergence system with Big Five personality, 6 capacities, 9 resources
- Skill DAG with 8 skills across 3 domains and visual dependency tree
- Activity system with capacity-based success probability and XP rewards
- Roguelike talent selection with 10 talents and pick-1-of-3 mechanics
- Side-by-side archetype comparison proving emergence validation
- Clinical terminology audit confirming zero DSM labels (OBSV-04)

**Stats:**

- 52 files created/modified
- 4,430 lines of TypeScript
- 6 phases, 26 plans
- 3 days from start to ship (2026-01-20 to 2026-01-22)

**Git range:** `feat(01-01)` -> `feat(06-04)`

**What's next:** TBD - port to Unreal Engine, add more activities/skills, or explore relationship dynamics

---
