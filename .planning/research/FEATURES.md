# Feature Landscape: Skill Tree / Character Development Systems

**Domain:** Life-sim game with skill tree, traits, and roguelike talents for rehabilitation theme
**Researched:** 2026-01-20
**Confidence:** HIGH (multiple authoritative sources cross-referenced)

## Table Stakes

Features users expect in any skill/character progression system. Missing these makes the prototype feel incomplete or broken.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Visual skill tree** | Players need to see available skills, locked vs unlocked states, and paths forward | Medium | None | Core navigation. States: locked, unlockable, unlocked, focused |
| **Clear unlock requirements** | Players must understand "what do I need to do to get this?" | Low | Visual tree | Show prerequisites, XP needed, or other gates |
| **Skill dependencies (prerequisites)** | Your core concept requires "can't go to store without go outside" | Medium | Visual tree | Standard gating pattern. Limits early choices, expands later |
| **XP accumulation from activities** | The core loop requires activities to generate progress | Medium | Activity system | Activity-based leveling as in Sims/Stardew |
| **Level-up feedback** | Players need clear signal when they progress | Low | XP system | Visual + audio cue. "You've learned something new" |
| **Persistent progress** | Progress must save between sessions | Low | Storage | For prototype: local storage sufficient |
| **Trait display** | Players need to see their character's fixed attributes | Low | None | Introvert/extrovert, etc. Static display OK for prototype |
| **Trait effects visible** | Players must see HOW traits affect gameplay | Medium | Trait system | "Social draining faster because: Introvert" |

### Rationale

These are the bones of any skill progression system. The research shows that skill trees have been a standard since Diablo II (1999), and players have strong expectations about how they work. Gating serves two functions: reducing choice paralysis early on, and maintaining balance. Stardew Valley's immersive skill progression demonstrates that organic leveling (do activity -> gain XP in that skill) feels natural for life-sims.

---

## Differentiators

Features that make this system unique and interesting. Not expected, but add significant value. These align with Lifelines' design pillars.

| Feature | Value Proposition | Complexity | Pillar Alignment | Notes |
|---------|-------------------|------------|------------------|-------|
| **Observable skill gaps** | "Diagnose what's wrong" is core to empathetic curiosity | Medium | Empathetic Curiosity | Show what patient CAN'T do and why |
| **Dependency visualization** | See blocked paths ("can't shop because can't go outside because...") | Medium | Empathetic Curiosity | Chain visualization shows root cause |
| **Pick-1-of-3 talent selection** | Roguelike moments at milestones create interesting choices | Medium | Satisfying Growth | Hades Mirror of Night pattern. At milestones, present 3 options |
| **Resource drain from traits** | Introvert drains social energy in groups - visible cost | Medium | Humorous Contrast | Energy/battery mechanic tied to personality |
| **Activity assignment interface** | Player assigns activities to generate XP | Medium | Satisfying Growth | Core interaction loop |
| **Progress momentum** | "Never feel like you wasted your run" (Hades philosophy) | Low | Satisfying Growth | Always forward progress even on "bad" days |
| **Skill unlock animations** | Satisfying visual feedback when new skill acquired | Low | Satisfying Growth | Dopamine hit. Can be simple glow/particle effect |
| **Personality-aware narration** | Describe skill acquisition through character lens | Low | Humorous Contrast | "Finally went outside. Hated it." vs "Went outside. Loved it." |
| **Dual-mode skills** | Same skill works differently based on traits | High | Humorous Contrast | Complex but distinctive |

### High-Value Differentiators for Prototype

**Priority 1: Observable skill gaps + dependency visualization**
This IS the game. "Observe patient -> diagnose skill gaps -> assign activities" requires visibility into what's broken and why. Without this, you just have a generic skill tree.

**Priority 2: Pick-1-of-3 talent selection**
Low complexity, high impact. The roguelike community loves this pattern. Supergiant's Hades proves it creates memorable moments. Implementation: at level 5/10/etc, pause and present three randomly-selected permanent abilities.

**Priority 3: Resource drain from traits**
Makes traits MATTER, not just flavor text. If "introvert in group" visibly drains a social energy bar, players understand personality mechanically.

---

## Anti-Features

Features to deliberately NOT build in a prototype. Common mistakes that waste time or actively harm the design.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Percentage-based stat bonuses** | "+5% XP gain" feels mandatory, not meaningful. No new verbs. | Unlock NEW capabilities, not marginal improvements |
| **Deep prerequisite chains** | Putting essential mechanics behind long unlock paths frustrates playtesters | Start with basic moveset, use tree for customization |
| **Full build optimization** | Min-maxing isn't the point; empathy and growth are | Make all paths viable, no "wrong" builds |
| **Respec systems** | Complexity for prototype; also undermines commitment | Defer to post-prototype. Let players restart if stuck |
| **Procedurally generated skill trees** | High complexity, hard to balance, obscures design intent | Static tree structure, can randomize talent offerings |
| **Multiple resource currencies** | XP + gold + gems + keys = confusion | Single currency (XP) for prototype |
| **Time-gated unlocks** | Mobile game pattern, breaks flow, adds nothing for prototype | Instant unlocks when requirements met |
| **Cosmetic unlocks** | Art assets for rewards distract from core loop validation | Focus on mechanical progression |
| **Leaderboards/competition** | Rehabilitation theme is personal growth, not competition | Personal progress only |
| **Branching profession paths** | Stardew's "pick profession at level 5/10" adds complexity without validating core concept | Single progression path per skill |
| **Social features** | Friends, gifting, multiplayer - all complexity | Single-player prototype |
| **Achievement systems** | Separate from core loop, adds scope | Implicit via skill unlocks |

### Anti-Pattern Details

**"Ladder" not "Tree"**: If every player ends up with the same abilities, it's not really a tree - it's a ladder. For prototype, this is actually fine. Focus on the dependency structure and diagnostic loop, not build diversity.

**False choices**: Don't present options that appear valid but one is clearly wrong. All talent choices should have legitimate use cases.

**Power without gameplay**: Avoid passive bonuses that players don't notice. Every unlock should feel like it does something visible.

**Use pattern mismatch**: If the patient is an introvert, don't offer talents that only work in large social gatherings.

---

## Feature Dependencies

```
FOUNDATION LAYER
    Visual skill tree <-- everything else depends on this
    Persistent progress
    Trait display

CORE LOOP LAYER (requires Foundation)
    Skill dependencies -----> Dependency visualization
    XP from activities -----> Level-up feedback
    Trait effects visible --> Resource drain from traits

DIFFERENTIATOR LAYER (requires Core Loop)
    Observable skill gaps (requires: dependency visualization)
    Activity assignment (requires: XP from activities)
    Pick-1-of-3 talents (requires: level-up feedback)

POLISH LAYER (enhances but not required)
    Skill unlock animations
    Personality-aware narration
```

### Build Order Recommendation

1. **Week 1: Foundation** - Visual tree with locked/unlocked states, basic trait display
2. **Week 2: Core Loop** - XP accumulation, skill dependencies, trait effects
3. **Week 3: Differentiators** - Observable gaps, activity assignment, talent selection
4. **Week 4: Polish** - Animations, narration, juice

---

## MVP Recommendation

For the **first playable prototype**, prioritize:

### Must Have (Table Stakes)
1. Visual skill tree with 5-8 skills showing dependencies
2. Clear locked/unlocked/unlockable states
3. XP accumulation from assigned activities
4. Level-up feedback (simple "skill acquired" notification)
5. Trait display (static, 2-3 traits)

### Should Have (Core Differentiator)
6. Observable skill gaps ("Patient can't X because lacks Y")
7. Dependency chain visualization (root cause visible)
8. Activity assignment interface (pick activities for patient)

### Could Have (Stretch)
9. Pick-1-of-3 talent selection at first milestone
10. Resource drain from traits (social battery)
11. Unlock animations

### Won't Have (Post-Prototype)
- Respec system
- Multiple currencies
- Procedural skill trees
- Achievement systems
- Cosmetic unlocks
- Social features

---

## Sources

### High Confidence (Context7, Official Docs, Authoritative Analysis)
- [Keys to Meaningful Skill Trees](https://gdkeys.com/keys-to-meaningful-skill-trees/) - Design principles for impactful progression
- [Stardew Valley Wiki - Skills](https://stardewvalleywiki.com/Skills) - Organic activity-based leveling reference
- [Hades Wiki - Mirror of Night](https://hades.fandom.com/wiki/Mirror_of_Night) - Roguelike permanent progression model

### Medium Confidence (Multiple Sources Agree)
- [The Sims Wiki - Skill](https://sims.fandom.com/wiki/Skill) - Life-sim skill system reference
- [Skill Tree Design: Ultimate Guide](https://adriancrook.com/skill-tree-design-ultimate-guide-for-freemium-games/) - Gating and pacing patterns
- [Deceptively Simple Design - Stardew Valley Analysis](https://medium.com/swlh/deceptively-simple-design-cabde40af87f) - Design philosophy
- [Hades' Mirror of Night Does Upgrades Right](https://www.thegamer.com/hades-mirror-of-night-roguelite-progression/) - Meta-progression analysis
- [Zileas' List of Game Design Anti-Patterns](https://lawofgamedesign.com/2014/02/20/zileas-list-of-game-design-anti-fun-patterns/) - What to avoid

### Supporting Sources (WebSearch, Single Source)
- [Keith Burgun on Pick-1-of-3](http://keithburgun.net/pick-1-of-3-is-a-missed-game-design-opportunity/) - Critical analysis of talent selection
- [Serious Games for Rehabilitation](https://www.sciencedirect.com/science/article/pii/S1532046419301856) - Gamification in therapy context
- [Gamification for Daily Living Skills](https://ladderofsuccessaba.com/top-interactive-games-we-use-to-teach-daily-living-skills/) - Life skills teaching through games
- [Game Progression Systems Taxonomy](https://www.intechopen.com/online-first/1221745) - Academic framework
