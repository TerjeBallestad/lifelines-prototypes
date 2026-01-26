# Lifelines Prototypes

## What This Is

A React-based prototype validating emergent character behavior through simple psychological variables. Characters have Big Five personality traits, mental capacities, and resources that interact to produce observable behavior differences - without diagnostic labels. Built to inform the Unreal Engine implementation of Lifelines.

## Core Value

The player experiences satisfying growth by helping patients develop missing life skills - the victory isn't heroic, it's watching someone finally answer the phone.

## Design Pillars

**Pillar 1: Empathetic Curiosity (Empatisk nysgjerrighet)**

Each character's personality emerges from simple systems that the player can explore, creating thought-provoking curiosity.

**Pillar 2: Satisfying Growth (Tilfredsstillende vekst)**

The game has an artistic style, colors, and systems that are both cozy and satisfying to watch. The player experiences mastery and joy from seeing characters and numbers grow.

**Pillar 3: Humorous Contrast (Humoristisk kontrast)**

Humor is never far away, creating lightness between the emotional moments.

## Norwegian Storytelling

Lifelines explores Norwegian storytelling in an interactive setting - not trying to make an American or Japanese game, but a uniquely Norwegian one.

**Focus on identity, not power:**

| American (Hero's Journey) | Japanese (Purification) | Norwegian (Identity/Competence) |
|---------------------------|-------------------------|----------------------------------|
| Weak → Strong             | Corrupt → Pure          | Lost → Found                     |
| Power fantasy             | Cleanse corruption      | Realistic competence             |
| Individual destiny        | Restore nature's order  | Integration with society         |
| Combat mastery            | Environmental puzzles   | Skill mastery                    |
| Save the world            | Purify the world        | Understand yourself              |

**"Klokskap over kraft" (wisdom over strength):**

Victory in Lifelines is realistic competence, not heroic power. Characters learn ordinary life skills. The welfare system can be a "hero" of the narrative - it enables recovery through smart diagnosis and patient support.

**Core fantasy:** The victory isn't heroic, it's watching someone finally answer the phone.

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

**v1.1 Game Balance - Primary Needs & Resource Simulation**

- Implement primary needs system (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security)
- Make Mood derived from need satisfaction
- Make Purpose derived from activity-personality fit
- Implement action resources (Overskudd, socialBattery, Focus, Willpower)
- Make Overskudd calculated from mood, energy, purpose, willpower
- Implement extraversion-based socialBattery (introverts drain in social, extraverts regen)
- Add Nutrition as slow-moving health stat affecting Energy regen and Mood
- Implement skill-based activity difficulty (costs decrease as skills improve)
- Add need-restoring activities (eating restores Hunger, socializing restores Social)
- Implement autonomous patient activity selection based on resources + personality

### Out of Scope

- Full game loop (quests, progression, multiple facilities) - prototype validates systems
- Polish/art - functional UI sufficient for testing
- Multiple patients - validated with one character
- Persistence/saving - prototype runs in memory
- Victory conditions / endgame content - balance system first, win states later

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

**v1.1 focus:**
Game balance overhaul - replacing flat resource drain with interconnected needs system inspired by The Sims. Primary needs feed into derived wellbeing (Mood, Purpose), which determines action resources (Overskudd). Patients autonomously select activities based on available resources and personality fit.

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
*Last updated: 2026-01-23 after starting v1.1 milestone*
