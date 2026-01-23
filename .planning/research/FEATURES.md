# Features Research: Needs-Based Game Balance for Life Simulation

## Summary

Life simulation games like The Sims rely on needs systems where 7-8 core needs (Hunger, Energy, Hygiene, Bladder, Social, Fun, Comfort/Security) decay over time and must be satisfied through activities. Mood is derived from the aggregate level of needs, creating strategic tension between competing priorities. Autonomous AI uses utility theory to score potential activities based on multiple factors (need urgency, personality traits, skill levels, social context), selecting the highest-utility action. Your rehabilitation-focused prototype introduces unique differentiators: progressive autonomy (patient learning self-care), derived action resources (Overskudd calculated from wellbeing stats rather than flat drain), and personality-based resource consumption (social battery mechanics for introverts/extroverts).

**Confidence:** MEDIUM - The Sims patterns well-documented through wikis and game design articles; utility AI implementation patterns clear from technical sources; rehabilitation game research provides parallel context but less specific detail on autonomy progression mechanics.

---

## Table Stakes (Must Have)

### Core Needs System

**8 Essential Needs with Visual Feedback**
- **What:** Clear meters showing current level of each need (0-100 scale typical)
- **Visual states:** Green (satisfied 75-100%), Yellow (declining 50-74%), Orange (urgent 25-49%), Red (critical 0-24%)
- **The Sims reference:** The Sims uses this exact color-coded bar system across all versions. Players instantly understand green = good, red = emergency.
- **Complexity:** Low

**Differential Decay Rates**
- **What:** Needs decay at different speeds reflecting real urgency
- **The Sims reference:** Bladder decays in 14-19 hours, Hygiene in 30-48 hours, Hunger in 11.75-16 hours, Energy in 21.5-24 hours, Social in 30-38 hours
- **Your implementation:** Fast (Bladder, Hunger, Energy), Medium (Fun, Hygiene), Slow (Social, Security), Very Slow (Nutrition as health stat)
- **Complexity:** Low

**Multiple Satisfaction Methods Per Need**
- **What:** Each need can be satisfied through 3+ different activities with varying effectiveness
- **The Sims reference:** Social can be satisfied via in-person chat, phone calls, texting, online chat, parties. Activities satisfy at different rates and suit different personality types.
- **Example:** Energy satisfied by Sleep (high effectiveness, long duration), Nap (medium effectiveness, short duration), Coffee (temporary boost with later crash)
- **Complexity:** Medium

### Derived Mood System

**Mood Calculated from Aggregate Needs**
- **What:** Mood is a mathematical function of all current need levels, not a separate independent stat
- **The Sims reference:** The Sims 1-2 calculated mood as average of all needs. Sims 3 shifted to moodlets (discrete modifiers) but needs still generate base moodlets. Sims 4 replaced with emotion system.
- **Formula pattern:** Simple average, weighted average (some needs matter more), or threshold-based (all needs above 50% = good mood)
- **Your implementation:** Mood is one input to Overskudd calculation (mood + energy + purpose + willpower)
- **Complexity:** Low to Medium depending on formula complexity

**Visible Mood Impact**
- **What:** Mood visibly affects character behavior, animations, and efficiency
- **The Sims reference:** Low mood Sims walk slowly, complain, refuse activities. High mood Sims skip, smile, gain skill faster.
- **Player feedback:** Reinforces the importance of balancing needs
- **Complexity:** Medium (requires animation states and activity modifier system)

### Activity-Need Satisfaction Matrix

**Clear Activity Costs and Benefits**
- **What:** Every activity shows what needs it will satisfy/drain before committing
- **The Sims reference:** Hovering over objects shows need satisfaction icons (++ Energy, - Hunger, + Fun)
- **UI requirement:** Tooltips or info panels showing resource changes
- **Complexity:** Low (data display) to Medium (dynamic calculation with personality modifiers)

**Multiple Needs Per Activity**
- **What:** Single activities affect multiple needs simultaneously
- **The Sims reference:** Watching TV satisfies Fun but increases Hunger (snacking urge) and drains Bladder. Social activities satisfy Social but drain Energy (for introverts).
- **Design principle:** Creates interesting strategic tradeoffs
- **Complexity:** Low

### Threshold-Triggered Behaviors

**Critical Need Warnings**
- **What:** When needs hit critical thresholds (typically 0-25%), special warnings appear
- **The Sims reference:** Sims get thought bubbles with icons, animations change, autonomous behavior overrides player commands in extreme cases
- **Your implementation:** Patient may refuse activities or force-select need-fulfilling activities in critical states
- **Complexity:** Medium

**Negative Consequences at Zero**
- **What:** Needs reaching zero have gameplay consequences beyond just low mood
- **The Sims reference:** Bladder at zero causes embarrassing accidents, Hunger at zero causes death, Energy at zero causes passing out
- **Design principle:** Creates real urgency, not just optimal vs sub-optimal gameplay
- **Your implementation:** Patient autonomy should kick in to prevent zeros (self-preservation instinct)
- **Complexity:** Medium

### Basic Autonomous Behavior

**Need-Based Activity Selection**
- **What:** When player isn't directing the character, AI selects activities based on current needs
- **The Sims reference:** Free Will setting allows Sims to autonomously satisfy urgent needs
- **Core algorithm:** Utility scoring - each activity gets a score based on how well it addresses current needs, highest score wins
- **Your implementation:** Patient autonomy increases over game progression, eventually handling all basic needs independently
- **Complexity:** Medium to High

**Urgency Prioritization**
- **What:** AI heavily weights critical needs (red zone) over declining needs (yellow zone)
- **The Sims reference:** Sims will interrupt low-priority activities to address critical needs (stops watching TV to use bathroom)
- **Design principle:** Prevents AI from letting character die/fail through poor prioritization
- **Complexity:** Medium

---

## Differentiators (Unique to This Project)

### Progressive Autonomy System

**What:** Patient's autonomous decision-making improves as they develop skills and self-awareness. Early game requires player micromanagement; late game patient handles basic needs independently while player focuses on higher-level goals.

**Why unique:** The Sims has binary autonomy (on/off toggle). Your system treats autonomy as a progression mechanic tied to the rehabilitation theme. This creates narrative arc: dependency → learning → independence.

**How it works:**
- Early: Patient only acts when player directs (autonomy = 0%)
- Mid: Patient handles critical needs autonomously (will eat when starving, sleep when exhausted)
- Late: Patient manages all basic needs, player focuses on skill development and purpose-building activities
- Mastery: Patient makes good decisions aligned with personality and long-term goals

**Complexity:** High (requires progression tracking, AI sophistication levels, tutorial scaffolding)

### Derived Action Resources (Not Flat Drain)

**What:** Overskudd, Focus, and Willpower are calculated from other stats rather than simple time-based decay.

**Why unique:** The Sims uses flat decay for all needs. Your system creates deeper strategic relationships:
- Overskudd = f(mood, energy, purpose, willpower) — "do I have capacity to act?"
- Focus = f(mental capacity, recent activity type, personality)
- Willpower = f(recent difficult choices, need satisfaction, purpose alignment)

**Design benefit:** Creates emergent gameplay where improving foundational stats (needs, mood, purpose) creates capacity for more challenging activities. Players must think about resource chains, not just individual meters.

**Complexity:** High (requires careful tuning, risk of opaque systems)

### Personality-Based Resource Consumption

**What:** Big Five personality traits modify how activities consume/restore action resources.

**Specific mechanic - Social Battery:**
- **Introverts:** Social activities drain socialBattery, solo activities restore it
- **Extroverts:** Social activities restore socialBattery, prolonged solo activities drain it
- **Mechanic:** socialBattery affects availability of social activities and mood contribution

**Why unique:** The Sims has personality affecting satisfaction rates but not bidirectional resource mechanics. Your extrovert isn't just "happier when social" — they become resource-depleted when isolated, creating opposite optimal strategies for different personalities.

**Research basis:** Psychological concept of "social battery" well-established. Introverts expend energy in social situations and recharge alone; extroverts recharge through social interaction but can deplete without it.

**Complexity:** Medium (requires clear UI communication of why actions are draining/restoring resources)

### Skill-Based Activity Efficiency

**What:** As patient masters skills, activities become cheaper (less resource cost) and more effective (more need satisfaction per time unit).

**Why unique:** The Sims has skill affecting outcomes (better meals, more money) but not resource efficiency. Your system creates positive feedback loop: practicing activities makes them more sustainable, encouraging specialization while making early-game activities genuinely harder.

**Example:**
- Cooking at Skill 0: Costs 30 willpower, 20 focus, 10 energy → Satisfies 40 hunger
- Cooking at Skill 5: Costs 15 willpower, 10 focus, 5 energy → Satisfies 60 hunger
- Cooking at Skill 10: Costs 5 willpower, 5 focus, 2 energy → Satisfies 80 hunger, restores 10 mood

**Design benefit:** Makes mastery system meaningfully impact core gameplay loop, not just unlock content.

**Complexity:** High (requires extensive balancing, per-skill progression curves)

### Purpose as Derived Wellbeing Stat

**What:** Purpose is calculated from activity-personality fit over time, representing long-term fulfillment beyond immediate need satisfaction.

**Why unique:** The Sims has aspiration system (goals) but not moment-to-moment purpose alignment. Your system evaluates every activity: "Does this align with who the patient is?" Low-purpose states drain willpower and mood even when all needs are satisfied.

**Rehabilitation theme:** Core to therapy/rehabilitation — not just surviving day-to-day, but finding meaning and direction. Patient can have full needs but empty purpose (depression parallel).

**Complexity:** High (requires personality-activity fit matrix, time-weighted calculation, clear UI feedback)

### Nutrition as Slow Health Stat

**What:** Nutrition moves slowly (not consumed/restored minute-to-minute) but affects energy regeneration rates and mood floor.

**Why unique:** The Sims treats all needs as equally fast-moving. Your system distinguishes immediate needs (Hunger: empty stomach right now) from health stats (Nutrition: sustained dietary quality over days/weeks).

**Design benefit:** Creates layered time scales. Players must think about both "solve immediate hunger" (quick meal) and "maintain long-term nutrition" (balanced diet). Enables scenarios where patient eats frequently (Hunger satisfied) but nutrition declines (poor food choices), leading to energy and mood issues.

**Complexity:** Medium (requires two separate systems for hunger vs nutrition)

---

## Anti-Features (Do NOT Build)

| Feature | Why Avoid | What to Do Instead |
|---------|-----------|-------------------|
| **Too-Easy Need Satisfaction** | Modern Sims games criticized for needs being trivial to satisfy, removing strategic challenge. "InZoi lacks challenges — basic needs are simultaneously too easy to fill but drain fast enough to nag" | Make early-game need satisfaction genuinely resource-constrained. Player should struggle to keep all needs green simultaneously until patient develops skills and routines. |
| **All Needs Decay at Same Rate** | Creates boring same-ness. No strategic differentiation between urgent daily needs (Bladder) and slow-burn weekly needs (Security). | Use at least 3 different decay rate tiers. Your current design: Fast (Bladder, Hunger, Energy), Medium (Fun, Hygiene), Slow (Social, Security), Very Slow (Nutrition). |
| **Mood as Independent Need Bar** | Makes mood feel arbitrary and unmotivated. "Why is my character sad? All their needs are fine!" | Keep mood as derived stat. Players should always be able to trace mood state back to specific need levels or purpose alignment. Transparency builds strategic understanding. |
| **Autonomous AI That Ignores Personality** | The Sims 4 criticized for "traits almost don't make any difference in how sims behave." Makes all characters feel identical. | Your socialBattery mechanic is exactly right. Introverts should autonomously seek alone time; extroverts should autonomously seek social activities. AI should visibly reflect personality. |
| **Binary Autonomy Toggle** | The Sims' Free Will on/off is all-or-nothing. Doesn't support learning/progression narrative. | Progressive autonomy tied to patient development. Autonomy is a skill the patient learns, not a setting the player toggles. |
| **Preventing Player Mistakes** | Modern games criticized for "tight guardrails against mistakes." Makes choices feel inconsequential. | Allow bad outcomes. Let players over-focus on one need while others hit critical. Let patient make poor autonomous choices early (teaching moment). Your rehabilitation theme requires visible growth from mistakes. |
| **No Consequences for Zero States** | If needs hitting zero has no real penalty, urgency disappears and needs become suggestions, not mechanics. | Implement meaningful but not game-ending consequences. Bladder zero = embarrassment moodlet + social penalty. Energy zero = forced sleep (time lost). Hunger zero = health damage (nutrition drops). |
| **Infinite Interrupting** | The Sims allows instant activity cancellation, making time-management trivial. | Consider activity commitment: Some activities can't be interrupted once started (cooking on stove can't be abandoned, social events require excusing yourself). Creates real strategic tension. |
| **Opaque Utility Scoring** | If players can't understand why AI chose an action, they can't diagnose problems or learn the system. | UI must show "Patient chose [activity] because: High hunger (-80), Low energy penalty (-20), Total utility: 60." Debug transparency builds trust. |
| **Everything Requires Willpower/Focus** | If every trivial action drains action resources, system becomes exhausting and micromanagement hell. | Reserve Willpower/Focus for challenging activities. Basic need satisfaction (eating simple meal, taking shower) should cost only time and satisfy needs. Only complex/skill-based activities drain action resources. |
| **Flat Narrative Arc** | If difficulty stays constant, no sense of progression or rehabilitation success. | Early game should genuinely feel overwhelming (player manages everything). Late game should feel manageable (patient autonomous, player coaches). Build tangible contrast. |

---

## Autonomous AI Behavior Patterns

### How The Sims AI Works (Utility Theory)

**1. Scoring All Available Actions**

The AI evaluates every activity the character could perform right now and assigns a utility score (0-1 normalized value). As documented in The Sims technical articles:

- **Context gathering:** Current state of all needs, personality traits, skills, social relationships, available objects, time of day
- **Consideration scoring:** Each action is scored on multiple considerations, then multiplied together:
  - "How well does this satisfy my hungriest need?" (0 if need is full, 1 if critical)
  - "Does this fit my personality?" (higher for personality-aligned activities)
  - "Is this socially appropriate right now?" (lower for solo activities if guests present)
  - "Can I afford this?" (0 if insufficient resources/skills)

**2. Weighting by Urgency**

Critical needs (red zone, 0-25%) receive heavily weighted utility scores. The Sims uses an "autonomy hierarchy that evaluates all commodities and prioritizes things with utmost importance," meaning a Sim won't autonomously play chess if their bladder is at 10%.

**Formula pattern:**
```
base_utility = activity_satisfaction[need] * need_urgency[need]
personality_modifier = 1.0 + (personality_alignment * 0.5)
final_utility = base_utility * personality_modifier
```

Most urgent need dominates scoring, ensuring AI addresses emergencies first.

**3. Selecting Best Action**

After scoring, AI typically selects the highest-utility action. However, sophisticated implementations add:

- **Randomization within threshold:** Choose randomly among actions within 10-20% of top score (prevents robotic predictability)
- **Personality-based variance:** Sims with high "playful" trait have higher randomization, serious Sims are more deterministic
- **Interruption logic:** Currently executing actions can be interrupted if a new action scores significantly higher (indicates critical need emerged)

### Common AI Decision Patterns

**Pattern: Cascading Urgency**

When one need hits critical, it dominates all scoring until satisfied. This creates visible behavioral shift: Sim stops socializing mid-conversation to rush to bathroom when bladder reaches 15%.

**Pattern: Personality Tie-Breaking**

When multiple needs are equally urgent (both at 40%), personality determines which to address first:
- Extroverts prioritize Social over Fun
- Introverts prioritize Fun (solo activities) over Social
- High Openness prioritizes learning/skill activities
- High Conscientiousness prioritizes completing started tasks

**Pattern: Opportunistic Multi-Satisfaction**

AI gives bonus utility to activities that satisfy multiple needs simultaneously:
- Social activity at park: Social +40, Fun +20, Environment +15
- Solo activity at home: Fun +40, Energy +10 (resting), Comfort +10

This prevents AI from ping-ponging between single-purpose activities.

### Key Design Principles from The Sims

**1. Transparent Decision-Making**

The Sims shows thought bubbles above characters indicating which need they're addressing. Critical for player trust: "I understand why you're doing that."

**Your implementation:** UI should show patient's top 3 utility-scored activities and why. "Considering: Sleep (60), Eat (45), Socialize (20)."

**2. Personality Creates Behavioral Signatures**

Without personality differentiation, all AI characters feel identical. The Sims research shows personality must affect both what activities are chosen AND how they're performed:

- Neat Sims autonomously clean even when Hygiene/Environment needs aren't critical
- Lazy Sims choose easier satisfaction methods (order pizza vs cook)
- Active Sims choose physical activities to satisfy Fun; bookworms choose reading

**Your implementation:** Big Five traits should create distinct autonomous signatures:
- High Conscientiousness: Plans ahead, addresses needs before critical
- Low Conscientiousness: Reactive, waits until urgent
- High Extraversion: Seeks social solutions even for non-social needs (buddy cook vs solo cook)
- High Neuroticism: More likely to interrupt activities as needs decline

**3. Graduated Autonomy Levels**

Based on rehabilitation game research and The Sims modding community patterns:

| Autonomy Level | AI Capability | Player Experience |
|---------------|---------------|-------------------|
| **Level 0: Dependent** | No autonomous action. Stands idle. | Player directs every activity. Tutorial phase. |
| **Level 1: Reactive** | Addresses only critical needs (red zone). | Player manages optimization, AI prevents disasters. |
| **Level 2: Proactive** | Addresses needs when they reach yellow zone. | Shared management. AI keeps basics covered, player handles goals. |
| **Level 3: Strategic** | Plans ahead, maintains green needs, pursues skill development. | Player as coach, not manager. Sets goals, AI executes. |
| **Level 4: Autonomous** | Makes personality-aligned choices, balances short and long-term needs, seeks purpose-fulfilling activities. | Player observes, intervenes only for major life decisions. |

**Progression trigger:** Autonomy level increases through:
- Mastery thresholds (successfully maintaining needs for X days)
- Skill acquisition (unlocks activity options)
- Purpose development (gives AI goal-directed behavior beyond survival)
- Player feedback (praising/correcting AI choices trains the system)

### Implementation Priorities

**Phase 1 (MVP):**
- Fixed decay rates for 7 primary needs
- Mood as simple average of needs
- Basic utility scoring (need urgency only, no personality)
- Level 1 autonomy (critical needs only)

**Phase 2 (Add Personality):**
- Personality modifiers to utility scores
- Social battery mechanics for introversion/extraversion
- Level 2 autonomy (proactive yellow-zone management)

**Phase 3 (Derived Resources):**
- Overskudd calculation from mood/energy/purpose/willpower
- Skill-based activity efficiency
- Level 3-4 autonomy (strategic and fully autonomous)

---

## Feature Dependencies

```
Primary Needs (7) → Mood Calculation → Overskudd Calculation → Activity Selection AI
                  ↓
            Nutrition (Health) → Energy Regen Rate
                  ↓
            Social Battery ← Personality (Extraversion)
                  ↓
            Autonomous Behavior ← Autonomy Level Progression
                  ↓
            Skill Mastery → Activity Efficiency → Sustainable Routines
```

**Critical Path:** Primary Needs → Mood → Basic Autonomy must work before adding derived resources and skill systems. Players need to understand basic needs loop before complexity layers on.

---

## MVP Feature Prioritization

### Must-Have for MVP (Core Needs Loop)

1. **7 Primary Needs with differential decay rates**
   - Fast: Bladder, Hunger, Energy
   - Medium: Fun, Hygiene
   - Slow: Social, Security

2. **Mood derived from need average**
   - Simple formula: (sum of all needs) / 7
   - Visual feedback: Mood meter + color-coded state

3. **8 Activities covering all needs**
   - Each activity satisfies 1-3 needs
   - Clear UI showing resource costs and benefits
   - Time duration for each activity

4. **Level 1 Autonomous AI**
   - Addresses critical needs (0-25% range)
   - Basic utility scoring: urgency only
   - Interruption logic for emergencies

5. **Critical need consequences**
   - Bladder zero: Embarrassment, social penalty
   - Hunger zero: Health damage
   - Energy zero: Forced sleep

### Defer to Post-MVP

- Social battery mechanics (need personality system first)
- Overskudd as derived resource (add after basic needs stable)
- Skill-based efficiency (requires mastery system integration)
- Nutrition as separate health stat (complexity vs clarity tradeoff)
- Advanced autonomy levels 2-4 (add progressively as game balances)
- Purpose calculation (long-term goal system)

---

## Quality Benchmarks

Your needs system should achieve:

**Player Understanding:**
- Can player explain why mood is low by looking at needs? (transparency test)
- Can player predict which activity AI will choose next? (predictability test)

**Strategic Depth:**
- Are there genuine tradeoffs? (Can't keep all needs green simultaneously in early game)
- Do personality differences create distinct optimal strategies? (Introvert vs extrovert gameplay feels different)

**Progression Feel:**
- Does late game feel meaningfully easier than early game? (Autonomy progression working)
- Do skills tangibly reduce resource pressure? (Efficiency gains visible)

**Rehabilitation Theme:**
- Does autonomy increase feel like patient growth, not just unlocking a setting?
- Does purpose system create motivation beyond need satisfaction?

---

*Researched: 2026-01-23*

## Sources

**The Sims Mechanics:**
- [Mood | The Sims Wiki](https://sims.fandom.com/wiki/Mood)
- [Social | The Sims Wiki](https://sims.fandom.com/wiki/Social)
- [The Sims 4 Emotions Guide](https://www.carls-sims-4-guide.com/emotions/)
- [Trait (The Sims 4) | The Sims Wiki](https://sims.fandom.com/wiki/Trait_(The_Sims_4))
- [Personality | The Sims Wiki](https://sims.fandom.com/wiki/Personality)
- [Deconstructing Sims Mobile](https://mobilefreetoplay.com/deconstructing-sims-mobile/)

**Autonomous AI & Utility Theory:**
- [An Introduction to Utility AI - The Shaggy Dev](https://shaggydev.com/2023/04/19/utility-ai/)
- [AI Decision-Making with Utility Scores (Part 1)](https://mcguirev10.com/2019/01/03/ai-decision-making-with-utility-scores-part-1.html)
- [The Genius AI Behind The Sims - Game Maker's Toolkit](https://gmtk.substack.com/p/the-genius-ai-behind-the-sims)
- [The AI That Powers The Sims 4 Is Almost Too Smart](https://www.popularmechanics.com/culture/gaming/a10698/inside-the-mind-of-the-sims-4-16906802/)
- [Utility system - Wikipedia](https://en.wikipedia.org/wiki/Utility_system)

**Needs Decay & Game Balance:**
- [Need Decay Rate in MCCC? | EA Forums](https://forums.ea.com/discussions/the-sims-4-mods-and-custom-content-en/need-decay-rate-in-mccc/328554)
- [Decay, Resets, and Entropy - Game Developer](https://www.gamedeveloper.com/design/decay-resets-and-entropy)

**Life Sim Design Patterns:**
- [Common Mistakes to Avoid in Simulation Games](https://getwhocares.com/common-mistakes-to-avoid-in-simulation-games/)
- [The Sims Creator Made Our Characters Dumb On Purpose](https://www.thegamer.com/the-sims-ai-bad-on-purpose-first-game-will-wright/)
- [Life sims are in a slump - PC Gamer](https://www.pcgamer.com/games/life-sim/life-sims-are-in-a-slump-and-the-only-way-out-is-becoming-strategy-games-again/)

**Rehabilitation & Autonomy:**
- [Serious Game Design and Clinical Improvement in Physical Rehabilitation](https://pmc.ncbi.nlm.nih.gov/articles/PMC8498892/)
- [Self-adaptive games for rehabilitation at home](https://www.researchgate.net/publication/261280667_Self-adaptive_games_for_rehabilitation_at_home)
- [Gamification in Self-Management of Patients With Chronic Diseases](https://pmc.ncbi.nlm.nih.gov/articles/PMC10770795/)

**Derived Stats & Game Mechanics:**
- [RPG Stats: Implementing Character Stats in Video Games](https://howtomakeanrpg.com/r/a/how-to-make-an-rpg-stats.html)
- [Artificial Emotion: Simulating Mood and Personality - Game Developer](https://www.gamedeveloper.com/design/artificial-emotion-simulating-mood-and-personality)

**Social Battery & Personality:**
- [Social battery: What it is and how to recharge it](https://www.medicalnewstoday.com/articles/social-battery)
- [Extroverts and Introverts in Sims? | EA Forums](https://forums.ea.com/discussions/the-sims-4-feedback-en/extroverts-and-introverts-in-sims/12117873)
- [Deeper Social Autonomy - The Sims 4 Mods](https://www.curseforge.com/sims4/mods/deeper-social-autonomy)
