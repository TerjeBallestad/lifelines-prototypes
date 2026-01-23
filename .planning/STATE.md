# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** Simple psychological variables combine to produce emergent characters -- no labels, just humanity
**Current focus:** v1.1 Game Balance - Primary Needs & Resource Simulation

## Current Position

Phase: Not started (researching)
Plan: —
Status: Researching domain ecosystem
Last activity: 2026-01-23 — Milestone v1.1 started

Progress: Defining requirements

## Milestone History

- v1.0 MVP (2026-01-22): 6 phases, 26 plans, 34 requirements validated

## Accumulated Context

### Decisions

All v1.0 decisions documented in PROJECT.md Key Decisions table.

Architecture decisions carry forward:
- Bottom-up entity pattern (Character, Skill, Activity, Talent classes)
- MobX stores with React Context for state management
- Unreal Actor-style patterns for future port

### v1.1 Design Decisions (In Progress)

Resource model restructure:
- **Primary Needs (7):** Hunger, Energy, Hygiene, Bladder, Social, Fun, Security
- **Health Stats (1):** Nutrition (slow-moving, affects Energy regen and Mood)
- **Derived Wellbeing (2):** Mood (from needs), Purpose (from activity-personality fit)
- **Action Resources (4):** Overskudd, socialBattery, Focus, Willpower

Key mechanics:
- Overskudd calculated from mood, energy, purpose, willpower (not flat drain)
- socialBattery affected by extraversion (introverts drain in social, extraverts regen)
- Skill-based activity difficulty (costs decrease as skills improve)
- Autonomous patient activity selection based on resources + personality

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-23
Stopped at: Starting v1.1 research phase
Resume file: None - in progress
