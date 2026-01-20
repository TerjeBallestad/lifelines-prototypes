# Lifelines Prototypes

## What This Is

A collection of React-based prototypes exploring game systems for Lifelines — an arcade life-sim about running a social housing facility where players rehabilitate residents so they can become autonomous members of society. The first prototype explores skills, traits, and talents.

## Core Value

The player experiences satisfying growth by helping patients develop missing life skills — the victory isn't heroic, it's watching someone finally answer the phone.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Model traits as fixed personality attributes that affect needs (introvert drains social battery in groups)
- [ ] Model skills as adult life skills with dependencies (can't "go to store" without "go outside")
- [ ] Model talents as roguelike power-ups chosen at milestones (pick 1 of 3)
- [ ] Model activities that patients perform to train skills
- [ ] Generate XP from activities that levels up appropriate skills
- [ ] Allow player to observe patient behavior and identify skill gaps
- [ ] Allow player to assign activities to patients
- [ ] Show skill dependencies visually (skill tree)
- [ ] Create at least one patient with traits, missing skills, and a path to autonomy

### Out of Scope

- [ ] Full game loop (quests, progression, multiple facilities) — this is a prototype
- [ ] Polish/art — functional UI is sufficient
- [ ] Multiple patients — start with one to validate the system
- [ ] Needs system beyond social battery — keep focus on skills
- [ ] Persistence/saving — prototype runs in memory

## Context

**Lifelines (the main game):**
- Arcade life-sim developed in Unreal Engine 5 / C++
- Solo developer, 1-year timeline
- Explores Nordic storytelling — identity over heroism
- Inspired by Elling, Ibsen, Skam, Norwegian folk tales
- Design pillars: Empathetic curiosity, Satisfying growth, Humorous contrast

**Why prototypes in React:**
- Faster iteration than Unreal for system design
- Establish data structures before porting to C++
- MobX's object-oriented approach mirrors Unreal patterns

**The Elling example:**
A patient like Elling arrives unable to go outside, answer phones, or shop for groceries — overprotected his whole life. The player must push him into discomfort, assign activities, watch him struggle and grow, until he can hold a job and achieve self-actualization.

**Piaget inspiration:**
Skills build on prerequisites, like cognitive development stages. You can't train "go to store" if "go outside" is missing. The player diagnoses gaps by observing failures or running assessments.

## Constraints

- **Tech stack**: React, Tailwind, DaisyUI, MobX — chosen for familiarity and Unreal portability
- **Scope**: Single prototype exploring one system, not a complete game
- **Fidelity**: Functional over polished — we're testing if the loop feels fun

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + MobX for prototypes | Faster than Unreal, OO pattern transfers well | — Pending |
| Three-layer character model (traits/skills/talents) | Separates innate, learned, and chosen attributes | — Pending |
| Piaget-inspired skill dependencies | Creates diagnosis gameplay, skills must build on each other | — Pending |
| Roguelike talent selection | Adds fun/spice without complexity | — Pending |
| Observation + assessment for discovery | Two discovery modes: passive watching, active testing | — Pending |

---
*Last updated: 2025-01-20 after initialization*
