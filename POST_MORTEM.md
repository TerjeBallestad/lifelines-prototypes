# Lifelines Prototype Post-Mortem

## Overview
**Project:** Lifelines Prototypes
**Type:** Cozy roguelike life-sim
**Tech:** React 19, TypeScript, MobX, Tailwind/DaisyUI
**Scope:** 10,327 LOC across 152 files
**Versions:** v1.0 MVP (2026-01-22), v1.1 Game Balance (2026-01-27)

---

## Feature Evaluation

### 1. Big Five Personality System
**Description:** Characters have 5 personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) on a 0-100 scale. These traits drive downstream behavior - need decay rates, activity preferences, and autonomous decision-making.

**What Worked:**
- Personality emerges naturally through behavior without explicit UI scores
- Creates distinct character archetypes (Hermit vs Social Butterfly behave visibly differently)
- Integrates cleanly with all other systems

**Evaluation:** `🔄 REDESIGN` - Replace with MTG color system. Simpler, more fun, players already understand color philosophies intuitively.

---

### 2. Mental Capacities System
**Description:** 6 cognitive dimensions (Divergent Thinking, Convergent Thinking, Working Memory, Attention Span, Processing Speed, Emotional Regulation) that affect activity success rates.

**What Worked:**
- Adds depth beyond personality
- Creates believable cognitive profiles

**Concerns:**
- May be over-engineered for the core loop
- Overlap with personality effects

**Evaluation:** `🔄 REDESIGN` - Keep as hidden system combined with "mental resonance" from other prototype. MTG colors = what characters like to do, capacities = what they're good at. Needs further exploration.

---

### 3. Primary Needs System (7 Needs)
**Description:** Hunger, Energy, Hygiene, Bladder (fast decay) + Social, Fun, Security (slow decay). Physiological needs decay faster, creating urgency hierarchy.

**What Worked:**
- Asymptotic decay prevents death spirals
- Personality modifies decay rates (extraverts need more social contact)
- Clear survival vs psychological split

**Evaluation:** `⚠️ SIMPLIFY` - 7 needs may be too complex for cozy genre target (Minami Lane-style). Consider collapsing to 2-3 core needs (Energy, Mood, Social?) or single Wellbeing meter. Simpler simulation = realistic scope for timeline/resources.

---

### 4. Derived Wellbeing Stats (Mood, Purpose, Nutrition)
**Description:**
- **Mood:** Computed from weighted average of all needs
- **Purpose:** Personality-based equilibrium that decays/grows toward baseline
- **Nutrition:** Slow-moving stat tracking food quality over time

**What Worked:**
- Clean dependency chain: Needs → Derived Stats → Action Resources
- Mood feels like a natural outcome of need satisfaction
- Purpose creates personality-specific baselines

**Note on Purpose:** Implementation differs from intent. Was supposed to be flow-state mechanic - activities balanced between too hard/too easy increase purpose (Csikszentmihalyi flow theory), not just personality equilibrium.

**Evaluation:** `🔄 REDESIGN` - Like the concept, especially Purpose as flow-state mechanic. If needs simplify, this layer may merge with them or become the primary visible system. Depends on final genre direction. Nutrition likely cut if food mechanics simplified.

---

### 5. Action Resources (Overskudd, Social Battery, Focus, Willpower)
**Description:**
- **Overskudd:** Main visible resource (mood + energy + purpose weighted). Norwegian for "surplus capacity"
- **Social Battery:** Drains/charges based on introversion/extraversion
- **Focus:** Depleted by concentration activities
- **Willpower:** Gates difficult activities, boosted by Fun need

**What Worked:**
- Overskudd is an elegant single visible metric
- Social battery creates emergent introvert/extrovert behavior
- Resources prevent "do everything at once"

**Evaluation:** `✅ INCLUDE` - Like the gating concept. Specific resources feel slightly off - may need different resources that feel more natural. Social Battery likely a keeper. Final inclusion depends on genre direction.

---

### 6. Skill System (8 Skills, Piaget-Inspired Dependencies)
**Description:** Skills across Social, Organisational, and Physical domains with prerequisite chains. Example: Eye Contact → Small Talk → Phone Call. Cross-domain dependencies (Go to Store needs both Go Outside + Make List).

**What Worked:**
- Prerequisite chains feel realistic
- Creates diagnosis gameplay (spot skill gaps → assign activities)
- Visual skill tree shows progression clearly

**Note:** Earlier iterations used abstract Piaget-style skills (observation, sequential thinking) which felt too low-level. Current concrete skill names (Eye Contact, Phone Call, Go to Store) are more readable and connect to rehabilitation theme.

**Evaluation:** `✅ INCLUDE` - Core to the game. Flat, understandable skill names work well. Prerequisite chains create meaningful progression. This is the victory condition - watching someone learn basic life tasks.

---

### 7. Activity System (19 Activities)
**Description:** Activities restore needs, cost resources, grant XP. Properties include duration modes (fixed, threshold, variable), difficulty stars, personality alignment tags, and mastery levels.

**What Worked:**
- Core gameplay loop functions (observe → diagnose → prescribe)
- Mastery system provides progression (activities get easier/faster)
- Personality alignment makes some activities easier for certain types
- Duration modes (fixed, threshold, variable) worked nicely

**Concerns:**
- 19 activities is minimal for variety
- Some activities feel similar
- Difficulty stars could be improved
- Personality alignment tags could shift to MTG colors/mental resonance

**Evaluation:** `✅ INCLUDE` - Good exploration, core loop works. Duration modes and mastery are keepers. Difficulty stars need refinement. Personality alignment → replace with MTG colors. Tags could become "topic" interests (nature, art, social) but adds complexity - consider cutting for cozy scope.

---

### 8. Talent System (Roguelike Powers)
**Description:** Pick 1-of-3 talents at milestones. 10+ talents with rarity tiers (Common 70%, Rare 25%, Epic 5%). Examples: Iron Will (-15% stress), Social Butterfly (-15% social drain), Hyperfocus (+15 convergent thinking but -20% social battery).

**What Worked:**
- Adds roguelike variety
- ~30% have tradeoffs for strategic choice
- Enables character customization
- Fits cozy scope well

**Concerns:**
- Not deeply integrated with core loop yet
- May need more talents for variety
- Trigger conditions unclear (what milestones/actions prompt picks?)

**Evaluation:** `✅ INCLUDE` - Really like this system, fits cozy scope. Pick-1-of-3 mechanic is reusable pattern - could also apply to facility upgrades or staff abilities. Need to determine what triggers talent picks (milestones, level-ups, etc).

---

### 9. Autonomous AI (Utility-Based Decision Making)
**Description:** Free Will mode where AI selects activities autonomously using 5-factor utility scoring:
1. Need Urgency (25%)
2. Personality Fit (15%)
3. Resource Availability (10%)
4. Willpower Match (35% - dominant)
5. Mood Delta (15%)

**What Worked:**
- Critical mode override for survival situations
- Decision logs prove AI is reasoning, not random

**What Didn't Work:**
- Weighted percentage system produced nonsensical choices (eating snacks when starving)
- Factors competing via percentages rather than prioritized
- Fundamental approach may be flawed

**Evaluation:** `🔄 REDESIGN` - Replace weighted utility scoring with tiered/sequential approach: (1) Check critical needs first, (2) Consider personality fit, (3) Check willpower - if insufficient, try easier option. More like behavior tree than utility scoring. Show reasoning as "thought bubble" for player - charming and educational.

---

### 10. Difficulty & Skill Integration
**Description:** Activities have base difficulty (1-5 stars). Skills and mastery reduce effective difficulty with diminishing returns. Visual feedback shows star reduction.

**What Worked:**
- Tangible progression (4-star activity becomes 2-star with skills)
- Multiple skills can contribute to same activity
- Clear visual feedback

**What Didn't Work:**
- Balance was off in prototype
- Player feedback wasn't satisfying
- Unclear if system flaw or implementation flaw

**Evaluation:** `✅ INCLUDE` - Like the concept. Didn't work satisfactorily in prototype but may be implementation/balance issue rather than fundamental flaw. Worth iterating on - needs better feedback polish (animations, sounds, more dramatic visual change).

---

### 11. Personality Alignment Tags
**Description:** Activities have tags (social, solo, creative, routine, cooperative, stressful, concentration). Personality traits modify cost/gain for aligned activities (up to ±30%).

**What Worked:**
- Emergent preferences without explicit personality scoring
- Introverts naturally avoid social activities
- Conscientious characters find routine activities easier

**Note:** This was a placeholder/pseudo-system standing in for a more complex system not explored in this prototype.

**Evaluation:** `❌ CUT` - Replace with MTG color system. Was never intended as final implementation - just a stand-in. MTG colors will handle personality → activity alignment more elegantly.

---

### 12. Balance Configuration System
**Description:** Runtime-adjustable balance config with all numerical values configurable without code changes. Presets system for save/load of different tunings.

**What Worked:**
- Enables rapid iteration
- Designers can tune without developers
- A/B testing of different balance approaches

**What Didn't Work:**
- Didn't get used much - not much balancing done in prototype
- Hard to understand what numbers did or were meant to do
- Poor discoverability/documentation

**Evaluation:** `✅ INCLUDE` - Definitely want similar system for final game. Easy number tweaking is key to good balance. Needs better UX: labels, tooltips, "what does this affect?" visualization so designers know what they're changing.

---

### 13. Dev Tools & Debugging
**Description:** Calculation trace tooltips, decision log panel, headless simulation, telemetry charts, comparison view (side-by-side archetype testing).

**What Worked:**
- Proves emergence empirically
- Enables balance iteration at scale
- Decision logs make AI transparent

**What Didn't Work:**
- Hard to understand and confusing
- Unclear what data is actually useful to visualize
- Designing good dev tools is itself a design challenge

**Evaluation:** `📋 DEFER` - Nice to have but premature investment. Need to stabilize systems first before knowing what tools are useful. Revisit once core gameplay solidifies and we know what data matters for balance.

---

### 14. Character Archetypes (6 Presets)
**Description:** The Hermit, Social Butterfly, Perfectionist, Free Spirit, Competitor, Peacemaker - each with distinct Big Five profiles for testing emergence.

**What Worked:**
- Quick testing of personality extremes
- Side-by-side comparison validates emergence
- Good starting point for character creation

**Evaluation:** `✅ INCLUDE` - Nice proto-system. Final game will have hand-made characters rather than procedural generation. Pre-designed characters with distinct personalities create more memorable, relatable experiences.

---

## Features NOT Implemented (But Designed)

### A. Multi-Patient Dynamics
**Description:** Managing multiple patients who affect each other. Relationship/cooperation mechanics.

**Status:** Not implemented - single character only

**Evaluation:** `✅ INCLUDE` - Key pillar for any version of the game. Watching patients do activities and interact with each other is core to the experience. MTG colors could determine interaction types - allied colors cooperate well, enemy colors create friction/tension. Built-in relationship mechanics.

---

### B. 12-Week Campaign Structure
**Description:** Time-limited runs with victory/failure conditions. Week-by-week progression with escalating challenges.

**Status:** Defined in GDD but not implemented

**Evaluation:** `🔄 REDESIGN` - Depends on genre choice. Life-sim direction → endless sandbox where players evolve their facility indefinitely (Stardew style). Cozy roguelike direction → time-constrained runs with victory/failure (Hades style). Key decision that affects many other systems.

---

### C. Meta-Progression (Roguelike Unlocks)
**Description:** Permanent unlocks across runs (like Hades). New talents, activities, starting bonuses.

**Status:** Not implemented

**Evaluation:** `✅ INCLUDE` - Love this. Creates "number machine" satisfaction like Balatro - watching facility get more efficient, unlocks compound, outputs grow. Works in either genre: roguelike (unlocks across runs) or sandbox (facility upgrades within save). Core appeal is building something that gets better over time.

---

### D. Narrative/Dialogue System
**Description:** Character voice, storytelling, dialogue events. Personality expressed through words, not just numbers.

**Status:** Not implemented - pure systems-driven experience

**Evaluation:** `⚠️ SIMPLIFY` - No interest in writing full dialogue. Use thought bubbles with icons instead (Sims-style visual shorthand). Hungry → food icon, lonely → person icon. Expressive but content-light. Keeps focus on systems while adding charm. Possibly minimal text for key moments only.

---

### E. Relationship System
**Description:** Patient-to-patient relationships, cooperation/conflict, social dynamics.

**Status:** Not implemented

**Evaluation:** `🔄 REDESIGN` - Could layer on top of MTG color interactions. Colors determine initial tendencies (allied = cooperate, enemy = friction), but relationship state evolves over time. Conflicting colors can grow to like each other through positive interactions - satisfying character development. Adds complexity though - simple color-only interactions might be enough for cozy scope. Decide based on how deep the multi-patient system goes.

---

### F. Persistence (Save/Load)
**Description:** Game state serialization for session continuity.

**Status:** Not implemented - all state in memory

**Evaluation:** `✅ INCLUDE` - Required for any released game. Table stakes, not glamorous but necessary.

---

## Summary Table

| # | Feature | Implemented | Evaluation |
|---|---------|-------------|------------|
| 1 | Big Five Personality | ✅ Yes | `🔄 REDESIGN` → MTG colors |
| 2 | Mental Capacities | ✅ Yes | `🔄 REDESIGN` → hidden system + mental resonance |
| 3 | Primary Needs (7) | ✅ Yes | `⚠️ SIMPLIFY` → 2-3 needs or single meter |
| 4 | Derived Stats (Mood/Purpose/Nutrition) | ✅ Yes | `🔄 REDESIGN` → depends on genre |
| 5 | Action Resources (4) | ✅ Yes | `✅ INCLUDE` |
| 6 | Skill System | ✅ Yes | `✅ INCLUDE` - core to game |
| 7 | Activity System | ✅ Yes | `✅ INCLUDE` |
| 8 | Talent System | ✅ Yes | `✅ INCLUDE` - fits cozy scope |
| 9 | Autonomous AI | ✅ Yes | `🔄 REDESIGN` → behavior tree approach |
| 10 | Difficulty Integration | ✅ Yes | `✅ INCLUDE` - needs polish |
| 11 | Personality Alignment | ✅ Yes | `❌ CUT` → replaced by MTG colors |
| 12 | Balance Config | ✅ Yes | `✅ INCLUDE` - needs better UX |
| 13 | Dev Tools | ✅ Yes | `📋 DEFER` |
| 14 | Character Archetypes | ✅ Yes | `✅ INCLUDE` - hand-made characters |
| A | Multi-Patient | ❌ No | `✅ INCLUDE` - key pillar |
| B | Campaign Structure | ❌ No | `🔄 REDESIGN` → depends on genre |
| C | Meta-Progression | ❌ No | `✅ INCLUDE` - Balatro-style |
| D | Narrative/Dialogue | ❌ No | `⚠️ SIMPLIFY` → thought bubbles only |
| E | Relationship System | ❌ No | `🔄 REDESIGN` → layer on MTG colors |
| F | Persistence | ❌ No | `✅ INCLUDE` - required |

---

## Evaluation Key
- `✅ INCLUDE` - Include in final game as-is or with refinement
- `⚠️ SIMPLIFY` - Include but reduce complexity
- `🔄 REDESIGN` - Core concept good but needs rework
- `❌ CUT` - Do not include in final game
- `📋 DEFER` - Consider for future expansion/DLC

---

## Key Decisions Needed

1. **Genre Direction:** Life-sim (endless sandbox) vs Cozy Roguelike (time-limited runs)
   - Affects: Campaign structure, meta-progression model, complexity budget

2. **MTG Color System:** Replacing Big Five personality
   - Affects: Activity alignment, character interactions, relationship dynamics

3. **Simulation Depth:** Full 7-need Sims-style vs simplified cozy meter
   - Affects: Scope, development time, accessibility

---

## Summary Counts

| Evaluation | Count |
|------------|-------|
| ✅ INCLUDE | 10 |
| ⚠️ SIMPLIFY | 2 |
| 🔄 REDESIGN | 6 |
| ❌ CUT | 1 |
| 📋 DEFER | 1 |

---

*Post-mortem completed: 2026-02-02*
