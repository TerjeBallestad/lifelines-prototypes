# Lifelines Prototypes

## What This Is

A React-based prototype validating emergent character behavior through interconnected psychological systems. Characters have Big Five personality traits that influence seven primary needs, which feed derived wellbeing (Mood, Purpose), which determines action resources (Overskudd, socialBattery, Focus, Willpower). Patients autonomously select activities based on utility scoring of needs, personality, and resources - producing observable behavior differences without diagnostic labels. Built to inform the Unreal Engine implementation of Lifelines.

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

**v1.0 MVP:**
- ✓ Model traits as fixed personality attributes that affect needs — v1.0
- ✓ Model skills as adult life skills with dependencies — v1.0
- ✓ Model talents as roguelike power-ups chosen at milestones — v1.0
- ✓ Model activities that patients perform to train skills — v1.0
- ✓ Generate XP from activities that levels up appropriate skills — v1.0
- ✓ Allow player to observe patient behavior and identify skill gaps — v1.0
- ✓ Allow player to assign activities to patients — v1.0
- ✓ Show skill dependencies visually (skill tree) — v1.0
- ✓ Create at least one patient with traits, missing skills, and a path to autonomy — v1.0

**v1.1 Game Balance:**
- ✓ Implement primary needs system (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security) — v1.1
- ✓ Make Mood derived from need satisfaction — v1.1
- ✓ Make Purpose derived from activity-personality fit — v1.1
- ✓ Implement action resources (Overskudd, socialBattery, Focus, Willpower) — v1.1
- ✓ Make Overskudd calculated from mood, energy, purpose, willpower — v1.1
- ✓ Implement extraversion-based socialBattery (introverts drain in social, extraverts regen) — v1.1
- ✓ Add Nutrition as slow-moving health stat affecting Energy regen and Mood — v1.1
- ✓ Implement skill-based activity difficulty (costs decrease as skills improve) — v1.1
- ✓ Add need-restoring activities (eating restores Hunger, socializing restores Social) — v1.1
- ✓ Implement autonomous patient activity selection based on resources + personality — v1.1
- ✓ Balance tuning tools: calculation traces, runtime config, headless simulation — v1.1

### Active

(To be defined in next milestone)

### Out of Scope

- Full game loop (quests, progression, multiple facilities) - prototype validates systems
- Polish/art - functional UI sufficient for testing
- Multiple patients - validated with one character
- Persistence/saving - prototype runs in memory
- Victory conditions / endgame content - balance system first, win states later

## Context

**v1.1 shipped (2026-01-27):**
- 10,327 LOC TypeScript
- Tech stack: React, Vite, MobX, Tailwind 4, DaisyUI 5, Recharts
- 8 phases (7-12 including 9.1, 10.1), 30 plans executed in 5 days
- All 26 v1.1 requirements validated

**v1.0 shipped (2026-01-22):**
- 4,430 LOC TypeScript
- 6 phases (1-6), 26 plans executed in 3 days
- All 34 v1.0 requirements validated

**Prototype demonstrates:**
- Big Five personality affects resource drain rates (emergence validated)
- Different archetypes produce observably different behavior (introvert vs extrovert patterns)
- No clinical labels needed - behavior emerges from underlying systems
- Autonomous AI selects activities based on utility scoring of needs, personality, and resources
- Architecture mirrors Unreal Actor pattern for future port

**Current state:**
Interconnected needs-based simulation complete. Primary needs (7) feed derived wellbeing (Mood, Purpose, Nutrition), which determines action resources (Overskudd, socialBattery, Focus, Willpower). Utility AI autonomously selects activities. Balance tuning tools (calculation traces, runtime config, headless simulation) enable iteration.

## Constraints

- **Tech stack**: React, Tailwind, DaisyUI, MobX - chosen for familiarity and Unreal portability
- **Scope**: Single prototype exploring character emergence, not a complete game
- **Fidelity**: Functional over polished - we're testing if the loop feels fun

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + MobX for prototypes | Faster than Unreal, OO pattern transfers well | ✓ Good - 8-day full prototype |
| Three-layer character model (traits/skills/talents) | Separates innate, learned, and chosen attributes | ✓ Good - clean separation |
| Piaget-inspired skill dependencies | Creates diagnosis gameplay, skills must build on each other | ✓ Good - visible skill gaps |
| Roguelike talent selection | Adds fun/spice without complexity | ✓ Good - engaging choice |
| 0-100 scale with 50 as average | Consistent, intuitive, maps to Unreal | ✓ Good - portable |
| Bottom-up architecture (entities -> stores -> UI) | Mirrors Unreal Actor pattern | ✓ Good - ready for port |
| Personality-to-resource modifiers | Creates emergence from simple rules | ✓ Good - validated OBSV-03 |
| No clinical terminology | Core philosophy - behavior emerges | ✓ Good - validated OBSV-04 |
| MobX computed values for needs derivation | Reactive chain: Primary needs → Derived wellbeing → Action resources | ✓ Good - clean dependency flow |
| Native Popover API for tooltips | DaisyUI tooltips clip in nested containers | ✓ Good - reliable positioning |
| Utility scoring with neutral caps | "Can I?" factors cap at 50, "Should I?" factors vary | ✓ Good - balanced AI decisions |
| Satiation penalty for needs | Needs > 80% get negative urgency | ✓ Good - prevents wasteful activities |
| Personality-neutral survival activities | Eating/bathroom are universal human needs | ✓ Good - realistic behavior |
| Asymptotic decay for needs | Prevents death spirals, needs slow near floor | ✓ Good - sustainable gameplay |
| Sigmoid curves for mood computation | Smooth transitions, floor/ceiling bounds | ✓ Good - prevents extreme states |

---
*Last updated: 2026-01-27 after v1.1 milestone*
