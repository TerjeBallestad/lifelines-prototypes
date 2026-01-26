# GDD Quick Reference

**See full GDD for details:** `.planning/research/Game Design Document 2f3a7d4d678e812b9e10f1902563a625.md`

This document provides condensed reference for key game design concepts during development.

---

## Core Concept

Lifelines is a **cozy roguelike life-sim** where the player manages a Norwegian social housing facility (bolig), rehabilitating patients so they can become full members of society. A roguelike about care work, not combat. About understanding people, not defeating enemies. Very Norwegian. Very Lifelines.

---

## Genre Fusion

| Element        | Implementation                                      |
|----------------|-----------------------------------------------------|
| Each run       | A new cohort of 3-5 patients at your social housing |
| Each day       | 5-10 minutes (not frantic arcade pacing)            |
| Victory        | Successfully rehabilitate patients to independence  |
| Failure        | Forgiving, with meta-unlocks carrying over          |
| Meta-progression | Like Hades - unlock tools, skills, upgrades       |

**Stardew Valley's cozy rhythm** + **Hades' meta-progression** + **The Sims' emergent behavior**

---

## Design Pillars

1. **Empathetic Curiosity (Empatisk nysgjerrighet)** - Personality emerges from simple systems creating thought-provoking curiosity
2. **Satisfying Growth (Tilfredsstillende vekst)** - Cozy, satisfying visual feedback; mastery and joy from watching characters grow
3. **Humorous Contrast (Humoristisk kontrast)** - Lightness between emotional moments

---

## Design Principles

| Principle                   | Implementation                                          |
|-----------------------------|---------------------------------------------------------|
| Simple input, complex simulation | Player schedules activities; system runs 50 hidden calculations |
| Show, don't tell           | No stats on screen; watch behavior change                |
| Emergent relationships     | Friendships form from shared time, not buttons           |
| Cozy progression           | Satisfying visual feedback, streak mechanics             |
| You can't save everyone    | Norwegian realism vs American heroism                    |
| Klokskap over kraft        | Clever diagnosis beats brute force                       |
| System as hero             | Welfare enables recovery, not individual saviors         |

---

## Overskudd System

**"Overskudd"** (Norwegian for "surplus/capacity") is the **only visible resource**. Everything else is hidden.

### How It Works

- Depletes when doing activities
- Regenerates based on hidden stats (nutrition, security, sleep quality)
- When low: patients refuse activities, make mistakes, can spiral

### Core Formula

```
Regen Rate = Base Rate × Nutrition Modifier × Energy Modifier × Security Modifier
```

**Core tension:** Managing invisible complexity through observable behavior.

---

## Big Five Personality

Affects activity preferences and resource drain/recovery rates:

- **Openness** - Curiosity, novelty-seeking, imagination
- **Conscientiousness** - Organization, reliability, detail
- **Extraversion** - Energy from social interaction
- **Agreeableness** - Cooperation, empathy
- **Neuroticism** - Stress resilience, emotional stability

Player discovers patterns through observation: "Elling always reads alone after group activities."

---

## Skill System Overview

**Piaget-inspired hierarchical skill tiers:**

| Tier | Name                   | Age Equivalent | Required Foundation      |
|------|------------------------|----------------|--------------------------|
| 0    | Sensorimotor           | Birth-2 years  | Automatic (pre-game)     |
| 1    | Preoperational         | 2-7 years      | Can begin immediately    |
| 2    | Concrete Operational   | 7-11 years     | Tier 1 skills at level 3+|
| 3    | Formal Operational     | 11+ years      | Tier 2 skills at level 5+|
| 4    | Post-Formal (Mastery)  | Adult expertise| Tier 3 skills at level 7+|

### Key Mechanics

- **Foundation Bonus** - Strong prerequisites = 2-3x faster learning
- **Skill Decay** - Unused skills decay, but relearning is faster
- **Crystallization** - Skills at level 8+ become resistant to decay
- **Time Investment** - Level 5 ≈ 50-100 hours, Level 10 ≈ 500-1000 hours

### Skill Categories

Analytical, Creative, Technical, Social, Physical, Organizational

---

## Patient Archetypes

| Archetype           | Profile                        | Challenge            |
|---------------------|--------------------------------|----------------------|
| **The Withdrawn**   | Low purpose, low social battery| Depression patterns  |
| **The Restless**    | High motivation, low attention | ADHD patterns        |
| **The Anxious**     | Low security, high vigilance   | Anxiety patterns     |
| **The Skeptic**     | Refuses diagnosis, high will   | Trust must be earned |
| **The Addict**      | Cycling stats, external dependencies | Withdrawal cycles |
| **The Overwhelmed** | Low overskudd regen            | Complex trauma       |
| **The Capable**     | High stats, one critical flaw  | Hidden vulnerability |
| **The Elder**       | Different needs                | Wisdom to share      |

Procedural modifiers create hundreds of variations from base archetypes.

---

## Run Structure (12-Week Cohort)

### Week 1: Intake

- Patients arrive with minimal info
- Observe behaviors, choose who to diagnose first
- Limited diagnostic resources

### Weeks 2-4: Discovery & Crisis

- Diagnosis reveals hidden conditions
- Skills training begins
- Random events challenge stability
- Patients may refuse help (need to build trust)

### Weeks 5-8: Stabilization

- Routines established
- Purpose-building activities
- Preparing for independence

### Weeks 8-12: Graduation or Relapse

- **Success:** Patient stable enough for independent living
- **Partial:** Patient improved but needs continued support
- **Failure:** Patient relapses, leaves, or dies (permadeath exists)

---

## Meta-Progression

### Diagnostic Tools (Unlockable)

- Basic Therapy (reveals Purpose)
- Advanced Psych Eval (reveals Attention + Working Memory)
- Trauma Assessment (reveals Security + triggers)
- Aptitude Testing (reveals Flow activities)
- Group Therapy (reveals relationship dynamics)

### Intervention Skills (Unlockable)

- CBT Techniques (reduce anxiety drain)
- Vocational Training (teach job skills faster)
- Nutrition Program (improve meal planning)
- Peer Support (patients help each other)
- Crisis Intervention (emergency overskudd restoration)

### Facility Upgrades (Unlockable)

- Workshop (carpentry flow activities)
- Garden (nature-based recovery)
- Library (reading-based recovery)
- Kitchen (cooking skills training)
- Quiet Room (faster social battery recovery)

---

## Hidden Stats → Observable Behavior

| Hidden Stat     | Description                 | Revealed By               |
|-----------------|----------------------------|---------------------------|
| Purpose         | Why bother doing anything? | Therapy Session           |
| Security        | Am I safe here?            | Social Worker Interview   |
| Attention/Focus | Can I concentrate?         | Psych Evaluation          |
| Social Battery  | Drained by interaction     | Observation               |
| Energy          | Physical stamina           | Medical Checkup           |
| Nutrition       | Affects overskudd regen    | Medical Checkup           |

**Player sees:** Activities, mood changes (emoji only), friendships forming

**System tracks:** 50+ hidden variables driving emergent behavior

---

**Last Updated:** January 2026
