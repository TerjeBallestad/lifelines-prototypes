# Project Research Summary

**Project:** Lifelines Prototypes v1.1 - Needs-Based Resource System & Autonomous AI
**Domain:** Life-simulation game with rehabilitation theme (React/MobX prototype for Unreal port)
**Researched:** 2026-01-23
**Confidence:** MEDIUM-HIGH

## Executive Summary

Lifelines v1.1 adds a sophisticated needs-based resource system modeled on The Sims' proven mechanics: 7 primary needs (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security) decay at different rates and must be satisfied through activities. The critical innovation is deriving action resources (Overskudd, socialBattery, Focus, Willpower) from needs and wellbeing stats rather than flat time-based decay, creating emergent strategic depth. Autonomous AI will use utility scoring (not state machines) to evaluate activities based on need urgency, personality alignment, and resource availability, with patient competence improving as they develop skills and self-awareness.

The recommended implementation requires **no new npm dependencies** — MobX's computed values natively handle interdependent calculations, extending the existing Character/Store architecture cleanly. The biggest technical risk is **death spirals** where low needs cause poor decisions that worsen needs further. Prevention requires nonlinear decay curves, emergency cost reduction when struggling, and urgency-weighted utility scoring from day one. The biggest design risk is the **player agency paradox**: competent autonomous AI makes players feel useless, but incompetent AI frustrates them. The solution is progressive autonomy tied to patient development, positioning the player as coach rather than micromanager.

Community data from The Sims reveals that needs systems fail when: decay rates aren't tuned for staggered intervention cycles, personality doesn't mechanically affect behavior, and optimal strategies collapse to boring maintenance loops. Success requires variety incentives, personality-based resource mechanics (socialBattery drains for introverts during parties, regenerates for extroverts), and skill progression that reduces activity costs. The existing v1.0 flat-resource system should migrate incrementally rather than big-bang replacement, preserving validated mechanics while adding derivation layers.

## Key Findings

### Recommended Stack

The existing React + MobX stack requires **zero new dependencies** for the needs system. MobX 6.15.0's computed values handle multi-level derivation (Mood from needs → Overskudd from mood/energy/purpose/willpower) through automatic dependency tracking with lazy evaluation and caching. The existing BalanceConfigStore pattern extends cleanly to needs-system formulas (decay rates, mood weights, utility thresholds), enabling runtime tuning during playtesting.

**Core approach:**
- **MobX computed getters** for derived stats (Mood, Purpose, Overskudd) — recalculate automatically when dependencies change
- **Utility AI** for autonomous behavior — pure TypeScript functions scoring activities based on need urgency × personality fit × resource feasibility
- **BalanceConfigStore extension** for needs parameters — centralized tuning without code changes
- **Character entity** owns observable needs + computed wellbeing — mirrors Unreal's UCLASS/UPROPERTY pattern for clean portability

**Core technologies:**
- **MobX computed values**: Derived state calculation — handles interdependent stats without performance penalty
- **Pure utility scoring functions**: Autonomous AI — 50 lines of TypeScript, no frameworks needed
- **Existing RootStore pattern**: Cross-system integration — stores communicate via root reference for skill XP, activity selection, milestone triggers

**What NOT to add:**
- State machine libraries (xstate) — needs-based systems have combinatorial state explosion, utility AI is the correct pattern
- Math/formula libraries (mathjs) — weighted averages and linear formulas don't justify library overhead
- Immutable state libraries (immer) — fights against MobX's mutable-with-tracking philosophy

### Expected Features

Needs systems succeed when they create strategic tension between competing priorities, make personality mechanically meaningful, and reward skill progression with reduced maintenance burden. The Sims-style foundation (differential decay rates, mood derived from need aggregate, multiple satisfaction methods per need) is table stakes. Lifelines' differentiators are progressive autonomy (patient learns self-care over time), derived action resources (Overskudd calculated from wellbeing rather than flat drain), and skill-based efficiency (mastery reduces activity costs and improves outcomes).

**Must have (table stakes):**
- **7 primary needs with differential decay** — Fast (Bladder, Hunger, Energy), Medium (Fun, Hygiene), Slow (Social, Security), Very Slow (Nutrition as health stat)
- **Mood derived from needs** — Mood = f(all primary needs), affects efficiency and resource availability
- **Threshold-triggered warnings** — Visual/audio alerts when needs hit critical (0-25%), autonomous AI overrides to prevent failure
- **Multiple satisfaction methods** — Each need satisfied by 3+ activities with varying effectiveness (Energy: Sleep high-cost high-restore, Nap medium-cost medium-restore, Coffee temporary boost)
- **Basic autonomous AI** — Level 1 (critical needs only), Level 2 (proactive management), Level 3+ (strategic skill-building)

**Should have (differentiators):**
- **Progressive autonomy system** — Patient competence improves from dependent (0%) → reactive (critical only) → proactive (yellow zone) → strategic (goal-directed). Autonomy as progression mechanic, not binary toggle
- **Derived action resources** — Overskudd = f(mood, energy, purpose, willpower) creates resource chains where improving foundational stats enables challenging activities
- **Personality-based resource consumption** — socialBattery drains for introverts during parties (restores solo), regenerates for extroverts (drains solo). Opposite optimal strategies based on personality
- **Skill-based activity efficiency** — Cooking at Skill 0 costs 30 willpower, restores 40 hunger. At Skill 10 costs 5 willpower, restores 80 hunger + 10 mood. Makes mastery meaningfully impact gameplay loop
- **Purpose as derived wellbeing** — Purpose = activity-personality fit over time. Patient can have full needs but empty purpose (depression parallel), drains willpower

**Defer (v2+):**
- Advanced autonomy levels 4-5 (goal-oriented planning, long-term optimization)
- Social relationship system (currently only socialBattery, not individual relationships)
- Environmental needs (Comfort, Room quality affecting satisfaction rates)
- Nutrition as separate health stat with long-term consequences (complexity vs. clarity tradeoff for MVP)
- Dynamic difficulty scaling based on player intervention frequency

**Anti-features (do NOT build):**
- Binary autonomy toggle (use progression-gated competence instead)
- All needs decay at same rate (boring same-ness, no strategic differentiation)
- Mood as independent need bar (makes mood feel arbitrary, breaks transparency)
- Preventing player mistakes with guardrails (removes tension, makes choices inconsequential)
- Everything requires Willpower/Focus (exhausting micromanagement, reserve for challenging activities only)

### Architecture Approach

The MobX Root Store pattern with OOP entity classes mirrors Unreal's GameInstance/Subsystem/Actor hierarchy almost directly, prioritizing clean portability. Game logic lives in domain stores (SkillStore, ActivityStore, CharacterStore) not React components, creating a clear separation where stores = game logic (port to C++), entities = data objects (port to UObject), and React components = presentation only (replace with UMG). The game loop uses requestAnimationFrame outside React, mapping cleanly to Tick functions.

**Major components:**
1. **Character entity (Entity Layer)** — Observable needs (Hunger, Energy, etc.), computed wellbeing (Mood, Purpose), action resources (Overskudd, socialBattery). Maps to UObject/AActor with UPROPERTY
2. **ActivityStore (Domain Layer)** — Activity definitions, requirement checks, autonomous selection via UtilityAI. Maps to UGameInstanceSubsystem
3. **UtilityAI (Logic Layer)** — Pure functions scoring activities: needScore × 0.5 + resourceScore × 0.3 + personalityScore × 0.2. Portable to any language
4. **SkillGraph (Data Structure)** — Explicit DAG for skill dependencies with topological sort, cycle detection. Critical for unlock path computation and portability
5. **GameLoopStore (System Layer)** — requestAnimationFrame tick processing, activity execution, need decay, milestone triggers. Maps to AGameModeBase Tick

**Key patterns:**
- **Computed values for derivation** — `get mood() { return calculateMoodFromNeeds(this.needs); }` with automatic dependency tracking
- **Cross-store communication via root** — ActivityStore calls skillStore.addXpToSkill() via this.root reference
- **UI as presentation only** — Components dispatch actions to stores, never contain game logic
- **Incremental migration from v1.0** — Parallel implementation with toggle, preserving validated mechanics before removing old system

### Critical Pitfalls

Research revealed three catastrophic failure modes that shipped in The Sims 4 and required emergency patches in 2025. The most dangerous is **death spirals** where low needs cause low mood causes poor decisions that worsen needs further, creating unrecoverable negative feedback loops. The second is **dumb AI syndrome** where autonomous characters make obviously wrong choices (exercising while starving, abandoning dates to watch TV) because utility scoring doesn't properly weight urgency or context. The third is **optimal strategy collapse** where players discover that spamming Sleep → Eat → Shower keeps all needs satisfied while bypassing skill-building activities, making the game trivial and boring.

1. **Imbalanced death spiral** — When needs drop low, derived stats (Mood, Overskudd) plummet, making it harder to perform recovery activities. Creates cascading failure where struggling patients are punished by making success harder. **Prevention:** Nonlinear decay (slow when high, slower again when critical), escape valves (reduce all activity costs 50% when Overskudd < 20), need prioritization scaling (critical need gets 2-3x weight), mood floor (max(20, average(needs)) so even failure leaves agency). The Sims 4 shipped instant-fail Balance drops that required naturopath intervention every 3 days — patched to give "time to react." Build escape valves INTO formulas from day one.

2. **Dumb autonomous AI** — Patient chooses push-ups while starving, watches TV during dates, starts 8-hour sleep when hunger will become critical at hour 4. AI makes decisions that are obviously stupid to any observer. **Prevention:** Utility scoring with urgency tiers (critical needs below 15 override everything, score = 0 for non-restoring activities), duration awareness (project need states during activity), social context awareness (on-date context heavily penalizes non-social activities), goal persistence (lock intent for 2-5 minutes to prevent distraction). The Sims community describes default autonomy as "bumbling idiots that can hardly keep themselves alive" — Better Autonomy mod exists to fix priority rebalancing. Implement tiered urgency from day one, don't ship basic utility AI and plan to "improve it later."

3. **Optimal strategy emerges (boring loop)** — Players discover that spamming maintenance activities (Sleep 8h → Eat → Shower → Repeat) keeps needs satisfied while minimizing skill-training. Mathematically optimal strategy bypasses intended gameplay. **Prevention:** Diminishing returns on maintenance (eating when Hunger > 60 restores less than eating at 30), Purpose drain from misalignment (high Openness patient doing Eat → Sleep loop needs novelty to maintain Overskudd), variety bonuses (track unique activities in 24h, +10 mood for 6+ types), skill-activity coupling (cooking trains skill AND restores hunger better than snacking). Game design research warns deterministic optimal strategies with easy-to-calculate expected values lead to "boring gameplay loops" where players are "just sitting at waves waiting."

4. **Personality traits don't affect behavior** — Patient has "high Extraversion" but autonomous AI doesn't choose more social activities. Traits are cosmetic labels that don't mechanically change behavior. **Prevention:** Personality as need modifiers (extrovert social decays 0.6x speed, introvert 1.4x speed; extroverts restore 160% from parties), personality as utility weights (Openness × 1.5 score for creative activities), trait violations have consequences (introvert party restores Social but drains socialBattery and Mood -10). The Sims 4 criticized for "traits almost don't make any difference in how sims behave." Apply personality to BOTH need modifiers AND utility weights, test that Introvert (E=20) and Extrovert (E=80) show different activity patterns over 7 days.

5. **Player agency vs. autonomy paradox** — Competent autonomous AI makes players feel useless ("What's the point? Patient handles everything"), but incompetent AI frustrates them ("This isn't autonomous, I'm babysitting"). Will Wright revealed in 2024 that The Sims creators deliberately made AI less capable because when it ran perfectly on autopilot, "almost anything the player did was worse than the Sims running on autopilot" and players felt useless. **Prevention:** Progression-gated competence (early game AI only handles critical needs and ignores optimization, late game makes smart choices including skill-building), player as coach not micromanager (player sets GOALS like "Focus on Cooking skill this week," patient autonomously chooses activities), opt-in autonomy slider (Full Manual / Assisted / Full Autonomy for different player preferences), visible AI reasoning (show "Patient chose Reading because Hunger satisfied and patient likes Openness activities"), failure as content (early patients SHOULD make suboptimal choices due to high Neuroticism, player guides them past anxiety).

## Implications for Roadmap

Based on research, suggested phase structure follows dependency chains: primary needs foundation → derived wellbeing → action resources → autonomous AI → skill integration → tuning. The critical path is Primary Needs → Mood → Basic Autonomy must work before adding complexity layers. Death spiral prevention and escape valves must be built into formulas from Phase 1, not added after playtesting reveals problems.

### Phase 1: Primary Needs Foundation
**Rationale:** Foundation for all derived stats. Must work correctly before building Mood, Purpose, Overskudd on top. Needs with wrong decay rates or bad aggregation formulas poison everything downstream.
**Delivers:** 7 observable primary needs with differential decay rates, visual feedback (color-coded meters), multiple satisfaction methods per need, critical threshold warnings
**Addresses:** Table stakes features (needs system, mood calculation basics)
**Avoids:** Death spiral (by building nonlinear decay and mood floor into formulas), cascading failures (by using nonlinear aggregation with resistance to outliers)
**Architecture:** Extend Character entity with needs observable object, add computed mood getter, update applyTickUpdate() to decay needs
**Research flag:** LOW — The Sims mechanics well-documented, MobX computed pattern proven in v1.0

### Phase 2: Derived Wellbeing (Mood, Purpose)
**Rationale:** Mood and Purpose are inputs to Overskudd calculation. Mood must stabilize before adding action resource complexity. Purpose requires activity-personality fit matrix which informs utility scoring later.
**Delivers:** Mood computed from primary needs with weighted formula and floor, Purpose computed from activity-personality alignment over time, visual feedback for both
**Uses:** MobX computed values with automatic dependency tracking
**Implements:** Character computed getters for mood/purpose, BalanceConfigStore extension with mood weights
**Avoids:** Derived stat cascading failures (by using max(20, weighted_average(needs)) not pure average), optimal strategy collapse (Purpose drain from misaligned activities creates variety incentive)
**Research flag:** MEDIUM — Formula tuning requires playtesting, but calculation pattern is straightforward

### Phase 3: Action Resources (Overskudd, socialBattery, Focus, Willpower)
**Rationale:** Depends on Mood and Purpose being stable. These resources gate activity availability, creating strategic choices about which activities are affordable at any moment.
**Delivers:** Overskudd computed from mood/energy/purpose/willpower, socialBattery with personality-based drain/regen, Focus and Willpower as activity costs
**Addresses:** Differentiator features (derived action resources, personality-based consumption)
**Avoids:** Overskudd calculation too complex to debug (by building calculation trace tooling, limiting derivation depth to 2 layers), socialBattery edge cases (by enumerating all social contexts and creating intensity taxonomy before implementation)
**Architecture:** Character computed getters for action resources, debug overlay showing calculation breakdown
**Research flag:** MEDIUM — socialBattery formula needs design work (Introvert/Extrovert feel different), Overskudd floor value needs tuning

### Phase 4: Activity-Need Integration
**Rationale:** Activities must restore needs, consume resources, generate XP. This integration creates the core gameplay loop where players balance immediate needs with long-term skill development.
**Delivers:** Activity definitions with need restore/drain values, resource costs, skill XP generation, activity completion feedback
**Uses:** Existing ActivityStore extended with need/resource effects
**Implements:** ActivityStore.processTick() applies need restoration and resource drain
**Avoids:** Optimal strategy collapse (by coupling skills with needs — cooking trains skill AND restores hunger better than snacking), personality traits not affecting behavior (by applying personality modifiers to activity costs/benefits)
**Research flag:** LOW — Pattern clear, but balance tuning requires playtesting

### Phase 5: Autonomous AI (Utility Scoring)
**Rationale:** Requires needs, resources, and activities to all exist and be stable. Autonomous AI is the emergent behavior layer on top of foundation systems.
**Delivers:** UtilityAI.ts with activity scoring functions, urgency-weighted utility calculation, autonomous activity selection for patient, debug overlay showing top-scored activities
**Addresses:** Table stakes feature (basic autonomous behavior), differentiator (progressive autonomy system)
**Avoids:** Dumb autonomous AI (by implementing urgency tiers from day one — critical needs override personality), player agency paradox (by making early AI deliberately suboptimal, improving with patient development)
**Architecture:** New UtilityAI.ts with pure scoring functions, ActivityStore.selectAutonomousActivity() method
**Research flag:** MEDIUM — Urgency thresholds and personality weight tuning requires observation, but pattern is proven

### Phase 6: Skill-Based Efficiency
**Rationale:** Depends on skills (v1.0), activities (Phase 4), and autonomous AI (Phase 5) all working. Skill progression reduces activity costs, making mastery meaningfully impact gameplay loop.
**Delivers:** Skill level modifies activity costs (lower) and restore amounts (higher), visual progression feedback, skill-based autonomy improvement
**Addresses:** Differentiator feature (skill-based activity efficiency), optimal strategy collapse prevention (practicing activities makes them more sustainable)
**Uses:** Existing Skill entities extended with efficiency multipliers
**Implements:** Activity cost calculation checks character skill level, applies reduction multiplier
**Research flag:** LOW — Pattern straightforward, linear vs. nonlinear reduction curve needs tuning

### Phase 7: Progressive Autonomy Levels
**Rationale:** Requires autonomous AI (Phase 5) working and skill system integrated. Autonomy competence increases as patient develops, creating rehabilitation progression arc.
**Delivers:** Autonomy level 0 (dependent) → 1 (reactive) → 2 (proactive) → 3 (strategic), progression triggers based on skill mastery and need management success, player role transitions from micromanager to coach
**Addresses:** Differentiator feature (progressive autonomy), player agency paradox (autonomy feels like progression not takeover)
**Avoids:** Player agency paradox (by positioning player as coach setting goals, patient executes), dumb AI early game (by making incompetence a teaching moment not a bug)
**Research flag:** HIGH — Autonomy progression triggers need design work, player coaching UI unclear, optimal "feels helpful not useless" balance requires extensive playtesting

### Phase 8: Tuning & Balance
**Rationale:** After all systems exist, tune interactions for sustainable gameplay loops and interesting strategic choices.
**Delivers:** Balanced decay rates (staggered intervention cycles), variety incentives (mood bonuses for diverse activities), escape valve thresholds (emergency cost reduction), personality expression validation (Introvert/Extrovert behavioral differences)
**Addresses:** All pitfall prevention, optimal strategy collapse, death spiral avoidance
**Uses:** Accelerated time simulation (7 days at 60x speed), heat maps of need trajectories, MCCC-style tuning UI for runtime adjustment
**Avoids:** Decay rate guesswork (by using formula: interventions_per_day = 24 / time_to_critical), micromanagement (by tuning for intervention frequency that matches engagement target)
**Research flag:** HIGH — Requires extensive playtesting, simulation tools, multiple balance passes

### Phase Ordering Rationale

- **Bottom-up dependency chain:** Primary needs → Derived wellbeing → Action resources → Autonomous behavior. Can't skip steps because each layer depends on stability of previous layer.
- **Avoid death spirals from day one:** Phase 1 builds nonlinear decay and mood floor into formulas, preventing cascading failures that would be harder to retrofit later.
- **Tuning happens after integration:** Can't balance decay rates until activities exist (Phase 4), can't tune autonomous AI until utility scoring implemented (Phase 5). Phase 8 tuning requires all systems operational.
- **Progressive autonomy last:** Requires mature skill system (v1.0 + Phase 6), working autonomous AI (Phase 5), and balanced needs (Phase 8 tuning). Autonomy levels are emergent from other systems working well.
- **Parallel v1.0 preservation:** Phase 1-3 run parallel to v1.0 flat resources with toggle, allowing incremental migration. Don't delete v1.0 resources until v1.1 needs proven stable (Phase 4+).

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Action Resources):** socialBattery formula and edge case handling needs design work. What exact values make Introvert/Extrovert FEEL different in autonomous play? Requires enumeration of all social contexts (solo, parallel, casual, active, intense) before implementation.
- **Phase 7 (Progressive Autonomy):** Autonomy progression triggers unclear. What mastery thresholds unlock next autonomy level? How does player coaching UI communicate without micromanaging? Needs UX research.
- **Phase 8 (Tuning):** Simulation and visualization tooling requirements. Need accelerated time simulation (7 days in minutes), heat maps of need trajectories, runtime balance tuning UI. Tooling scope unclear.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Primary Needs):** The Sims mechanics extensively documented, MobX computed pattern proven in v1.0, decay curve formula straightforward
- **Phase 2 (Derived Wellbeing):** Weighted average formulas well-understood, activity-personality fit matrix is design work not research
- **Phase 4 (Activity-Need Integration):** Extension of existing ActivityStore with value modifications, pattern clear
- **Phase 5 (Autonomous AI):** Utility AI pattern documented in multiple sources, urgency tier implementation straightforward
- **Phase 6 (Skill-Based Efficiency):** Linear multiplier pattern, skill level → cost reduction formula is arithmetic

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | MobX computed values verified in official docs as perfect fit for multi-level derivation. No new dependencies needed. Existing v1.0 architecture extends cleanly. Unreal portability validated via Component/Subsystem mapping. |
| Features | **MEDIUM** | The Sims patterns well-documented through wikis and community mods. Utility AI implementation clear from technical sources. Progressive autonomy concept from rehabilitation research but specific mechanics untested. socialBattery differentiation needs playtesting validation. |
| Architecture | **HIGH** | MobX Root Store pattern with OOP entities mirrors Unreal GameInstance/Subsystem/Actor hierarchy directly. Existing v1.0 validated Character/Store separation. SkillGraph DAG structure portable to any language. requestAnimationFrame → Tick mapping straightforward. |
| Pitfalls | **MEDIUM** | The Sims 4 2025 balance patches provide real-world examples of death spirals and solutions. Community mods document autonomy failures and fixes. Will Wright's direct statement about deliberately worse AI informs agency paradox. But our specific 7-need formula and Overskudd calculation untested in practice. |

**Overall confidence:** **MEDIUM-HIGH**

Strong confidence in technical approach (MobX, architecture patterns, no new dependencies) and failure modes to avoid (death spirals, dumb AI, boring loops) based on The Sims community data. Lower confidence in specific formula values (decay rates, personality weights, autonomy thresholds) which require playtesting. Incremental migration path preserves v1.0 validation while adding complexity layers.

### Gaps to Address

**Formula tuning parameters that can't be answered through research:**
- **socialBattery exact formula:** What calculation makes Introvert and Extrovert behavior FEEL different in autonomous observation? Personality preference mismatch penalty magnitude? Group size thresholds? Requires implementation and playtesting.
- **Purpose decay rate:** How fast should Purpose drain from personality-misaligned activities to matter but not dominate other factors? Linear vs. exponential decay? Needs tuning observation.
- **Overskudd floor value:** What minimum Overskudd should patient always have to prevent total paralysis? 20? 10? 0? Emergency bypass threshold? Requires stress testing edge cases.
- **Escape valve threshold:** At what need value should emergency cost reduction kick in? 20? 15? 10? How much reduction? 50%? 75%? Needs playtesting to find "helps without trivializing."
- **Variety bonus magnitude:** How much Mood bonus for activity diversity (6+ types in 24h) to incentivize without forcing? +5? +10? +20? Requires balance observation.
- **Skill-cost reduction curve:** Linear (skill 0 → 100% cost, skill 100 → 50% cost) or nonlinear (exponential mastery benefit)? What feels rewarding without breaking progression?

**Architecture decisions needing validation:**
- **Derivation depth limit:** Currently planned as 2 layers (Primary → Derived), but is Overskudd = f(Mood, Energy, Purpose, Willpower) too complex to debug? Calculation trace tooling requirements unclear until implementation.
- **Migration strategy:** Parallel v1.0/v1.1 with toggle sounds safe, but what exactly gets preserved from v1.0? Which behaviors are validated and must survive migration? Compatibility layer scope unclear.
- **Autonomous AI progression triggers:** What concrete metrics determine autonomy level increase? Days of successful need management? Skill threshold? Player praise/correction counts? Needs design specification.

**Handle during planning/execution:**
- Build calculation trace tooling (Overskudd calculation breakdown) in Phase 1 before complex formulas, not as afterthought
- Create enumeration of social contexts (solo/parallel/casual/active/intense taxonomy) before Phase 3 implementation
- Design target first (intervention every X minutes) then work backward to decay rates in Phase 1, don't guess rates and test emergent frequency
- Run accelerated 7-day simulations (60x speed) in Phase 8 to observe need trajectories, catch death spirals before manual playtesting
- Document v1.0 → v1.1 mapping (which resources become which needs, what behaviors to preserve) before Phase 1 migration starts

## Sources

### Primary (HIGH confidence)
- **MobX Official Documentation** — Computed values, multi-level derivation, performance characteristics, automatic dependency tracking
- **Unreal Engine Official Docs** — GameInstance, Subsystems, UCLASS/UPROPERTY patterns, component architecture mapping
- **The Sims 4 2025 Balance Patches (EA)** — Real-world death spiral failures, imbalanced cascades, ailment tuning, community feedback driving fixes
- **Will Wright 2024 Interview (PC Gamer)** — Direct statement about deliberately worse AI because competent AI made players feel useless, player agency design philosophy

### Secondary (MEDIUM confidence)
- **The Sims Community Wikis** — Need decay rates (reverse-engineered), mood calculation formulas, trait effect documentation
- **The Sims Community Mods** — Better Autonomy (priority rebalancing), MCCC (decay rate tuning), Waffle's Motive Decay Overhaul (testing impact of rate changes)
- **Utility AI Documentation** — Game Creator docs, The Shaggy Dev introduction, consideration scoring patterns, urgency weighting
- **Game Design Literature** — Failure cascades in simulation games (Game Developer), effective-but-boring optimal strategies (GameTek), strategy decline research (Quantic Foundry)
- **Self-Determination Theory Research** — Autonomy and relatedness in games, personality expression, intrinsic motivation mechanics

### Tertiary (LOW confidence)
- **Rehabilitation Game Research** — Self-adaptive games for rehab, gamification in chronic disease management (parallel context but not specific autonomy progression mechanics)
- **Social Battery Psychology** — Introversion/extraversion energy mechanics (general concept well-established but not game-specific implementation)
- **RPG Stat System Design** — Derived stats and character progression (general patterns but not needs-specific)

### Source Summary by Research File
- **STACK.md sources:** MobX official docs (computed values, chaining), Utility AI references (Wikipedia, Game AI Pro PDF, The Shaggy Dev), existing codebase patterns (Character.ts, balance.ts)
- **FEATURES.md sources:** The Sims Wiki (needs, mood, traits, personality), autonomous AI articles (GMTK, Popular Mechanics), rehabilitation research (PMC), life sim design patterns
- **ARCHITECTURE.md sources:** MobX docs (stores, observable state, actions), Unreal docs (Subsystems, Components), community patterns (Root Store with React Hooks, requestAnimationFrame game loops)
- **PITFALLS.md sources:** The Sims 4 2025 patches (EA official, SimsCommunity), community mods (Better Autonomy, Waffle's Decay Overhaul), Will Wright interviews, Game Developer articles, utility AI docs

---
*Research completed: 2026-01-23*
*Ready for roadmap: yes*
