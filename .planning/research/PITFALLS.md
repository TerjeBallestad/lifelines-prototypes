# Pitfalls Research: Needs-Based Game Balance & Autonomous AI

**Domain:** Sims-style needs systems and autonomous behavior AI
**Researched:** 2026-01-23
**Context:** Adding needs-based resource system to existing life-sim prototype (v1.1)
**Confidence:** MEDIUM (WebSearch verified with multiple sources, The Sims community data)

---

## Summary

The three biggest risks when adding needs systems and autonomous AI to an existing game:

1. **Death spirals** - Cascading needs failures create unrecoverable negative feedback loops where low mood causes poor decisions which worsen mood further
2. **Dumb AI syndrome** - Autonomous characters make obviously wrong choices (doing push-ups while starving), frustrating players and destroying immersion
3. **Optimal strategy collapse** - Players discover boring but effective patterns (spam sleep/eat loop) that bypass intended gameplay

These aren't theoretical - The Sims 4 shipped major balance patches in 2025 to fix exactly these issues. Preventing them requires careful tuning of decay rates, utility scoring, and escape valves.

---

## Critical Balance Pitfalls

### Pitfall 1: Imbalanced Death Spiral

**What goes wrong:** When needs drop low, derived stats (Mood, Overskudd) plummet, making it harder to perform activities that restore needs. This creates a negative feedback loop where struggling players are punished by making success harder. Once a patient enters this spiral, they can't recover without player micromanagement.

**Why it happens:**
- Derived stats like Mood calculated as average of primary needs amplify small failures
- Activity costs don't scale down when patient is struggling
- Multiple needs decay simultaneously while activities restore only one
- No "emergency mode" that helps characters prioritize survival

**Real-world example:** The Sims 4's Balance system (2025) had this exact problem. Witnessing death or experiencing extreme emotions instantly drained Balance to zero, causing Very Imbalanced status. While Imbalanced, all needs drained 25% faster, creating a cascade. Players reported being unable to recover without naturopath intervention every 3 days. EA patched it to prevent instant drops and give "time for Sims to react and get proper care."

**Warning signs:**
- Playtests where patient gets stuck in "barely surviving" loop
- Mood/Overskudd oscillating between crisis states
- Player feels forced to micromanage even late-game autonomous patients
- "One bad day ruins everything" feedback
- Patient can't recover from low state without player intervention

**Prevention:**
1. **Nonlinear decay curves** - Needs should decay slowly when high (comfortable), faster in middle (noticing), then SLOWER again when critical (survival mode kicks in). The Sims uses this to give players reaction time.

2. **Escape valves** - When Overskudd drops below threshold (e.g., 20), reduce ALL activity costs by 50% temporarily. Makes recovery actions affordable even when struggling.

3. **Need prioritization scaling** - When ANY need drops below 30, autonomous AI should weight that need 2-3x higher in utility scoring, overriding personality preferences.

4. **Recovery activities** - Include low-cost "rest" activities that restore multiple needs slightly (nap: +20 Energy, +10 Mood, +5 Hygiene) as emergency options.

5. **Mood floor** - Don't calculate Mood as pure average. Use: `max(20, average(needs))` so even total failure leaves some agency.

**Which phase should address it:** Phase 2 (Needs Implementation) - Build escape valves INTO the needs system from day one. Don't wait for playtesting to reveal the spiral.

**Testing strategy:**
- Manually set all needs to 20 and see if patient can autonomously recover
- Set one need to 0 and verify patient prioritizes fixing it
- Observe 24-hour simulation without player intervention from low-need start

**Sources:**
- [The Sims 4 Balance & Imbalance Guide](https://simscommunity.info/2025/07/13/the-sims-4-balance-imbalance-guide/)
- [EA Forums: Balance system reacts way too extreme](https://forums.ea.com/discussions/the-sims-4-feedback-en/ebn-balance-system-reacts-way-to-extreme/12335024)
- [Game Developer: The Art of the Spiral - Failure Cascades in Simulation Games](https://www.gamedeveloper.com/design/the-art-of-the-spiral-failure-cascades-in-simulation-games)

---

### Pitfall 2: Decay Rate Tuning Guesswork

**What goes wrong:** Setting arbitrary decay rates (Hunger -2/hour, Energy -1.5/hour) without considering their interaction creates either constant micromanagement or trivial needs that never threaten. Getting rates wrong means either frustrating busywork or meaningless systems.

**Why it happens:**
- Intuitive rates feel right in isolation but create problems in combination
- Not accounting for activity duration (8-hour sleep vs 15-minute shower)
- Forgetting needs decay DURING activities that restore other needs
- No clear design target for "how often should player intervene?"

**Real-world data:** The Sims community reverse-engineered default decay rates:
- Bladder: 19 hours (max to empty)
- Hunger: 16 hours
- Hygiene: 48 hours
- Energy: 24 hours
- Fun: 22.5 hours
- Social: 38 hours

These create natural rhythm where Hunger/Bladder need attention ~2x per day, Hygiene every other day. Community mods that changed rates discovered The Sims 2's faster decay made early game harder, making upgrades more meaningful.

**Warning signs:**
- Playtesters report spending 80%+ time satisfying needs vs. doing activities
- Multiple needs hit critical simultaneously (bad cascades)
- Needs never drop below 50 (too slow, feels pointless)
- "I'm just cycling through Eat > Sleep > Bathroom" feedback
- Skill progression invisible because patient always managing survival

**Prevention:**
1. **Design target first** - Decide: "Autonomous patient should need player direction every X minutes" then work backward to rates that achieve it.

2. **Staggered decay rates** - Avoid multiple needs decaying at same speed. Use Fibonacci-like spacing: if Hunger is 12 hours, make Energy 18-20 hours, Social 30+ hours. Prevents "everything failing at once."

3. **Activity-aware tuning** - If eating takes 30 minutes and restores 40 Hunger, Hunger must decay >40 points in next 12 hours or eating becomes optional. Map activities to needs mathematically.

4. **Skill multipliers** - As skills improve, decay rates should SLOW (cooking skill → less Hunger decay) or restore amounts INCREASE (shower skill → more Hygiene restored). Rewards progression.

5. **Difficulty curves via decay** - Start with slow decay (easy mode for learning), increase decay rates as patient gains skills (challenge scales with capability).

**Tuning formula:**
```
time_to_critical = (100 - critical_threshold) / decay_rate
interventions_per_day = 24 / time_to_critical

// Example: Want 2 Hunger interventions per day
// Critical threshold = 20 (need to eat before this)
// 24 hours / 2 interventions = 12 hours per intervention
// decay_rate = (100 - 20) / 12 = 6.67 points/hour
```

**Which phase should address it:** Phase 3 (Tuning & Balance) - After needs system exists but before autonomous AI. Use accelerated time simulation to test 7-day cycles in minutes.

**Testing tools:**
- Simulation mode: run 168 hours (1 week) at 60x speed, log need trajectories
- Heat map: visualize when needs hit critical across different decay configurations
- MCCC-style tuning UI: expose decay multipliers (50% - 200%) for runtime adjustment during playtesting

**Sources:**
- [Waffle's Motive Decay Overhaul](https://www.patreon.com/posts/waffles-motive-3-99128564)
- [Steam: Micro-managing Sims lives is not fun](https://steamcommunity.com/app/1222670/discussions/0/4343238688631975548/)
- [Modern RPGs and Skill Progression](http://scottfinegamedesign.com/design-blog/2024/1/7/diabloxstarfield)

---

### Pitfall 3: Derived Stat Cascading Failures

**What goes wrong:** When Mood is calculated from 7 primary needs, and Overskudd is calculated from Mood + Energy + Purpose + Willpower, a failure in ONE primary need (Bladder = 0) can cascade through the entire system, making ALL actions unavailable. This creates brittleness where the patient becomes helpless from a single oversight.

**Why it happens:**
- Averaging stats amplifies low outliers (one 0 pulls average down drastically)
- Each layer of derivation multiplies the fragility
- No dampening or isolation between subsystems
- Linear calculations assume all inputs equally critical

**Example cascade:**
```
Bladder drops to 0 (emergency!)
→ Mood = average(7 needs) drops from 70 to 60 (one 0 brings average down)
→ Overskudd = (Mood 60 + Energy 70 + Purpose 60 + Willpower 50) / 4 = 60
→ "Use Bathroom" activity costs 25 Overskudd → Still affordable
→ But anxiety reduces Willpower to 30 because Mood is low
→ Overskudd recalculates: (60 + 70 + 60 + 30) / 4 = 55
→ Patient tries to go to bathroom but gets distracted by low Social need (also urgent)
→ Attempts social activity instead, Bladder continues to drop
→ Bladder accident occurs, Hygiene drops, Mood drops further
→ Overskudd now 45, many activities become unaffordable
→ Death spiral begins
```

**Warning signs:**
- Patient becomes paralyzed when any single need is critical
- Derived stats swing wildly from small primary need changes
- Activities that should always be affordable (sleep, eat) become blocked
- Player can't predict what will happen when needs shift
- "Why won't they just eat?!" frustration

**Prevention:**
1. **Nonlinear aggregation** - Don't use pure averaging. Use weighted formulas that resist outliers:
   ```typescript
   // Bad: Pure average amplifies failures
   mood = (hunger + energy + hygiene + bladder + social + fun + security) / 7

   // Better: Weighted with floor
   mood = max(30, (
     min(hunger, 70) * 0.2 +     // Cap contribution of any single need
     min(energy, 70) * 0.2 +
     min(hygiene, 70) * 0.15 +
     // ... etc
   ))

   // Best: Logarithmic resistance to low values
   mood = 100 * (1 - exp(-sum(needs) / 500))  // Softens impact of zeros
   ```

2. **Subsystem isolation** - Overskudd should have minimum value from EACH component, not just average:
   ```typescript
   // Ensures patient always has 20 Overskudd even if Mood = 0
   overskudd = max(20, (mood * 0.3 + energy * 0.3 + purpose * 0.2 + willpower * 0.2))
   ```

3. **Emergency bypass** - When ANY primary need < 10, that need's restore activity costs ZERO Overskudd. Prevents "too tired to sleep" paradox.

4. **Separate resource pools** - Don't make every action cost Overskudd. Use:
   - Physical activities cost Energy directly
   - Social activities cost socialBattery directly
   - Complex activities cost Focus directly
   - Only willpower-requiring activities cost Overskudd

   This prevents one depleted stat from blocking ALL actions.

5. **Dampening delays** - When needs change, derived stats should update gradually (lerp over 5 minutes) rather than instantly. Prevents thrashing between states.

**Which phase should address it:** Phase 1 (Architecture) - Design the derivation formulas with isolation and dampening from the start. Harder to retrofit later.

**Testing:**
- Unit tests: Set each need to 0 individually, verify patient can still perform critical restore actions
- Stress test: Set 3 random needs to 0, simulate 2 hours, patient should recover
- Log derived stat calculations to catch unexpected swings

**Sources:**
- [Game Developer: The Art of the Spiral - Failure Cascades](https://www.gamedeveloper.com/design/the-art-of-the-spiral-failure-cascades-in-simulation-games)
- [Self-Determination Theory & Game Design](https://pmc.ncbi.nlm.nih.gov/articles/PMC12412733/)

---

### Pitfall 4: Optimal Strategy Emerges (Boring Gameplay Loop)

**What goes wrong:** Players discover that spamming "Sleep 8 hours → Eat → Shower → Repeat" keeps all needs satisfied while minimizing skill-training activities. The mathematically optimal strategy bypasses intended gameplay, making the game trivial and boring.

**Why it happens:**
- Need-restoring activities are too efficient (cost 15 minutes, restore 50 points, lasts 20 hours)
- No incentive to engage with skill-training activities that cost more and restore less
- Personality and Purpose don't sufficiently penalize boring repetitive routines
- Players optimize for "needs never drop below 70" instead of "interesting patient development"

**Real-world example:** Game design research (2024) warns that when deterministic optimal strategies emerge with easy-to-calculate expected values, it's "not a good thing." Players described strategy games with this problem as having "boring gameplay loops" where you're just "sitting at waves waiting."

**Warning signs:**
- Playtesters report ignoring skill activities in favor of maintenance loops
- Patients with different personalities play identically
- "Just spam X to win" feedback
- Skill progression stalls because patients never attempt difficult activities
- Purpose stat becomes irrelevant (high Purpose never preferred over low-Purpose-safe-activities)

**Prevention:**
1. **Diminishing returns on maintenance** - Eating when Hunger > 60 should restore less than eating at Hunger = 30. Showering twice in a day provides minimal benefit. Discourages preemptive spam.

2. **Purpose drain from misalignment** - If patient has high Openness but does "Eat → Sleep" loop (low Openness activities), Purpose should drain faster. Eventually they NEED novelty to maintain Overskudd.

3. **Mood bonuses from variety** - Track "activity diversity in last 24 hours". If patient did 6+ different activity types, Mood gets +10 bonus. Encourages exploration.

4. **Skill-activity coupling** - Make some skill-training activities ALSO restore needs:
   - "Cook complex meal" trains Cooking skill AND restores Hunger better than "Eat snack"
   - "Exercise" trains Fitness skill AND restores Energy (post-workout endorphin boost)
   - "Read philosophy" trains Cognition skill AND restores Purpose

   Now optimal strategy IS skill progression.

5. **Personality-based efficiency** - Introverts should restore Social FASTER from solo activities ("Journal about feelings" vs "Party"). Extroverts restore Social SLOWER from solo activities. Makes personality matter mechanically.

6. **Time pressure** - If there's a weekly "therapy evaluation" that checks skill progress, patients can't afford to spam maintenance. They need to show growth.

**Design target:** Optimal strategy should be "balanced mix of need maintenance and skill-building activities chosen based on personality," not "spam safest options."

**Which phase should address it:** Phase 4 (Integration) - After both needs and skills exist, tune the interactions. Can't balance this until both systems operational.

**Formula for variety incentive:**
```typescript
const uniqueActivitiesLast24h = new Set(recentActivities).size;
const varietyBonus = min(20, uniqueActivitiesLast24h * 3);
mood = baseMood + varietyBonus;

// With 6 different activities: +18 Mood (significant)
// With 2 repetitive activities: +6 Mood (minimal)
```

**Sources:**
- [Game Design Balance: Effective But Boring](https://gametek.substack.com/p/effective-but-boring)
- [Quantic Foundry: Strategy Decline - Players Less Interested in Planning](https://quanticfoundry.com/2024/05/21/strategy-decline/)

---

## AI Behavior Pitfalls

### Pitfall 5: Dumb Autonomous AI (Obvious Wrong Choices)

**What goes wrong:** Autonomous patient chooses to do push-ups while starving, watches TV during a date, uses the computer instead of sleeping when exhausted. AI makes decisions that are obviously stupid to any observer, breaking immersion and frustrating players who expect competent autonomous behavior.

**Why it happens:**
- Utility scoring doesn't properly weight urgency (all needs weighted equally)
- AI evaluates actions in isolation without considering context (on date, at work, etc.)
- Personality modifiers override critical needs (high Fun preference → play games even when Bladder = 5)
- No short-term goal memory (forgets it was heading to bathroom, gets distracted)
- Scoring doesn't account for activity duration vs. need urgency

**Real-world Sims data:** The Sims 4 community describes default autonomy as "mostly bad" with Sims being "bumbling idiots that can hardly keep themselves alive." Players report Sims doing push-ups in the middle of weddings, using computers during dates, and choosing to watch TV instead of addressing critical needs. The "Better Autonomy" mod exists specifically to fix this by rebalancing AI priorities.

**Warning signs:**
- "Why won't they just go to the bathroom?!" frustration during playtests
- Patients starting long activities (8-hour sleep) when need will become critical mid-activity
- Context-inappropriate actions (exercising during work hours, socializing during sleep time)
- Patients switching between activities without completing any (action thrashing)
- Players disable autonomy because it's worse than manual control

**Prevention:**
1. **Utility scoring with urgency tiers:**
   ```typescript
   function calculateUtilityScore(activity, patient) {
     let baseScore = personalityFit(activity, patient.traits);

     // CRITICAL tier: Needs below 15 override everything
     const criticalNeeds = patient.needs.filter(n => n.value < 15);
     if (criticalNeeds.length > 0) {
       // Only consider activities that restore critical needs
       if (!activity.restores.some(n => criticalNeeds.includes(n))) {
         return 0;  // Can't choose this, critical need demands attention
       }
       baseScore *= 10;  // Massively boost critical-need activities
     }

     // URGENT tier: Needs 15-30 get 3x weight
     const urgentNeeds = patient.needs.filter(n => n.value < 30);
     if (activity.restores.some(n => urgentNeeds.includes(n))) {
       baseScore *= 3;
     }

     // Context penalties
     if (patient.context === 'on_date' && !activity.tags.includes('social')) {
       baseScore *= 0.1;  // Heavily penalize non-social activities during date
     }

     return baseScore;
   }
   ```

2. **Activity commitment** - Once patient starts activity, they should complete it unless a need becomes CRITICAL (drops below 10 during activity). Prevents thrashing.

3. **Duration awareness** - Before starting 8-hour sleep, AI should project: "Will any need become critical during this activity?" If yes, choose shorter activity or address urgent need first.

4. **Goal persistence** - When patient forms intent ("I should eat"), lock that intent for 2-5 minutes. Prevents distraction by every small stimulus.

5. **Social context awareness** - Tag activities with required context (work, social, rest). When patient is "on date," only social-tagged activities get positive scores.

6. **Cooldown on repeated actions** - If patient just watched TV, watching TV again gets 50% reduced score for next 2 hours. Forces variety even if personality wants repetition.

**Utility AI tuning tool:**
Create debug overlay showing:
- Top 5 scoring activities with numerical scores
- Why patient chose current activity (which need triggered it)
- What needs are blocking other activities
- Projected need states after current activity completes

This makes bad AI choices visible and debuggable.

**Which phase should address it:** Phase 5 (Autonomous AI) - Implement tiered urgency from day one. Don't ship basic utility AI and plan to "improve it later."

**Testing:**
- Set Bladder to 10, observe if patient immediately chooses bathroom (should)
- Put patient "on date," verify they don't abandon date for TV
- Start 8-hour sleep with Hunger at 35, verify patient eats first (or hunger will hit critical at hour 4)

**Sources:**
- [Steam: Sims Autonomy Questions - "bumbling idiots that can hardly keep themselves alive"](https://steamcommunity.com/app/1222670/discussions/0/501693985385917376/)
- [Better Autonomy Mod](https://www.patreon.com/posts/better-autonomy-62529639)
- [Utility AI - Game Creator Documentation](https://docs.gamecreator.io/behavior/utility-ai/)

---

### Pitfall 6: Player Agency vs. Autonomy Paradox

**What goes wrong:** When autonomous AI is competent, players feel useless and question their role. When autonomous AI is incompetent, players are frustrated by constant micromanagement. Finding the balance where player feels helpful-but-not-required is extremely difficult.

**Why it happens:**
- Will Wright intentionally made The Sims AI worse because early versions were "too good" and "almost anything the player did was worse than the Sims running on autopilot"
- Game needs to justify player's existence while also promising "autonomous patient"
- Competent AI makes player feel like they're just watching
- Incompetent AI makes player feel like the autonomy promise was a lie

**Real-world lesson:** Will Wright revealed in 2024 that The Sims creators deliberately made the AI less capable because when it ran perfectly on autopilot, players had nothing meaningful to do. The game needs the player to feel needed.

**Warning signs:**
- Playtest feedback: "What's the point? Patient handles everything themselves."
- Playtest feedback: "This isn't autonomous, I'm babysitting a toddler."
- Players optimize by disabling autonomy and micromanaging
- No clear moment where autonomy feels like an upgrade vs. a frustration
- Late-game patients play identically to early-game (autonomy didn't improve)

**Prevention:**
1. **Progression-gated competence** - Early game: AI only handles critical needs (bathroom, hunger) and ignores optimization. Late game (high skills): AI makes smart choices including skill-building and personality-aligned activities. Player SEES the improvement.

2. **Player role as coach, not micromanager** - Player shouldn't assign every activity. Instead:
   - Player sets GOALS: "Focus on Cooking skill this week"
   - Patient autonomously chooses Cooking-related activities
   - Player intervenes only when patient is stuck or making poor tradeoffs

   This is coaching, not puppeteering.

3. **Opt-in autonomy** - Give player control slider:
   - "Full Manual" - Player queues all activities (for control-focused players)
   - "Assisted" - Patient handles maintenance (eat/sleep/bathroom), player directs skill-building
   - "Full Autonomy" - Patient makes all choices, player only adjusts goals/priorities

   Different players have different fun thresholds.

4. **Visible AI reasoning** - Show WHY patient chose an activity:
   - "Reading book because Hunger is satisfied and patient likes Openness activities"
   - "Ignoring Social opportunities because Introversion trait + Social battery depleted"

   When player understands AI logic, "wrong" choices feel like personality, not bugs.

5. **Failure as content** - Early game patients SHOULD make suboptimal choices (high Neuroticism → avoids challenging skill-building). Player role is to guide them past anxiety. This makes player feel needed without requiring micromanagement.

**Design philosophy:** Game is about teaching patient to be autonomous, not about player performing tasks through a patient-shaped puppet. Autonomy should feel like progression, not a takeover.

**Which phase should address it:** Phase 6 (Polish & Feel) - After autonomous AI works, tune the PERCEPTION of helpfulness. This is game feel, not functionality.

**Player value propositions by game phase:**
- Early: "Patient can't handle complex decisions, needs your guidance" (player feels needed)
- Mid: "Patient handles basics, you focus on skill development" (player feels effective)
- Late: "Patient mostly autonomous, you provide high-level direction" (player feels proud)

**Sources:**
- [PC Gamer: Will Wright says original Sims AI was actually too good](https://www.pcgamer.com/games/the-sims/will-wright-says-the-original-sims-ai-was-actually-too-good-almost-anything-the-player-did-was-worse-than-the-sims-running-on-autopilot/)
- [The Gamer: Sims Creator Made Characters Dumb On Purpose](https://www.thegamer.com/the-sims-ai-bad-on-purpose-first-game-will-wright/)
- [AI Agents in Gaming](https://inworld.ai/blog/ai-agents-in-video-games-current-and-future-state)

---

### Pitfall 7: Personality Traits That Don't Affect Behavior

**What goes wrong:** Patient has "high Extraversion" trait but autonomous AI doesn't choose more social activities. Traits are cosmetic labels that don't mechanically change behavior, making personality system feel meaningless.

**Why it happens:**
- Personality modifiers too small to overcome need-driven urgency (±5% vs. ±100% need urgency)
- AI utility scoring doesn't actually read personality traits
- No negative consequences for trait-violating activities (Introvert parties with no penalty)
- Activity selection driven purely by "what need is lowest" without personality consideration

**Warning signs:**
- Playtesters can't tell patient personalities apart by watching behavior
- "Why does my Introverted patient keep going to parties?" confusion
- All patients converge to same activity patterns regardless of traits
- Personality only visible in UI labels, not emergent actions
- No "this feels like them" moments during observation

**Prevention:**
1. **Personality as need modifiers:**
   ```typescript
   // Extraversion affects Social need decay and restore
   socialDecayRate = baseSocialDecay * (1 - extraversion / 200);
   // Extrovert (extraversion=80): decays 0.6x speed (needs less social)
   // Introvert (extraversion=20): decays 1.4x speed (needs more social)

   socialRestoreAmount = baseRestore * (extraversion / 50);
   // Extrovert restores 160% from parties, 80% from solo activities
   // Introvert restores 40% from parties, 120% from solo activities
   ```

2. **Personality as utility weights:**
   ```typescript
   function calculateUtility(activity, patient) {
     let score = needRestoreValue(activity, patient);

     // Openness boosts novel/creative activities
     if (activity.tags.includes('creative')) {
       score *= (1 + patient.openness / 100);
     }

     // Conscientiousness boosts structured/productive activities
     if (activity.tags.includes('structured')) {
       score *= (1 + patient.conscientiousness / 100);
     }

     return score;
   }
   ```

3. **Trait violations have consequences:**
   - Introvert attending party: Social need restored but socialBattery drains, Mood -10
   - Extravert staying home alone: Social restored but Fun decreases, Purpose -5
   - This creates personality-specific optimal strategies

4. **Emergent personality expression** - Don't script "Extroverts do X." Instead, set up systems where Extroversion naturally leads to more social activities:
   - Social activities restore more for Extroverts
   - Solo activities cost less socialBattery for Introverts
   - Let behavior emerge from incentive structures

5. **Activity-personality fit score** - Already planned in v1.1 as Purpose stat. This is critical:
   ```typescript
   purpose = average(
     recentActivities.map(a => personalityAlignment(a, patient.traits))
   );

   // High Openness patient doing Creative Writing → alignment = 90 → Purpose increases
   // High Openness patient doing Repetitive Data Entry → alignment = 20 → Purpose decreases
   ```

**Testing personality expression:**
- Create two patients: one Introvert (E=20), one Extravert (E=80)
- Run both autonomously for 7 days
- Compare activity logs - should see clear behavioral differences
- Introverts should choose 60%+ solo activities, Extraverts 60%+ social activities

**Which phase should address it:** Phase 2 (Needs Implementation) when personality modifiers are applied to needs, AND Phase 5 (Autonomous AI) when utility scoring uses personality.

**Sources:**
- [Self-Determination Theory and Game Design 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC12412733/)
- [Profiling Personality Traits with Games](https://dl.acm.org/doi/10.1145/3230738)

---

## Integration Pitfalls

### Pitfall 8: Replacing Flat Resources Without Transition Plan

**What goes wrong:** v1.0 has 9 flat-drain resources that just deplete to 0 and stay there. v1.1 wants interconnected needs with derivation. Trying to swap systems in one big-bang migration breaks everything, loses validation work from v1.0, and creates untestable "everything changed at once" situations.

**Why it happens:**
- Excitement about new system makes old system feel obsolete
- "Might as well rewrite it properly" instinct
- Not recognizing what from v1.0 still works and should be kept
- Assuming new needs system is strictly better in all ways

**Warning signs:**
- Plan involves deleting entire resource systems and starting over
- No incremental migration path identified
- "We'll just rebuild it" without preserving learnings
- Testing strategy is "build whole new system and see if it works"
- Can't demo progress until entire system replaced

**Prevention:**
1. **Parallel implementation first:**
   - Keep v1.0 flat resources running
   - Implement v1.1 needs system alongside
   - Add toggle to switch between systems
   - Validate new system works before removing old system

2. **Incremental migration:**
   ```
   Phase 1: Add primary needs, derive from flat resources (needs mirror resources)
   Phase 2: Add Mood/Purpose derived stats, still using flat resources underneath
   Phase 3: Switch needs to decay independently, keep flat resources as debug fallback
   Phase 4: Remove flat resources once needs proven stable
   ```

3. **Preserve validated concepts:**
   - v1.0 validated that personality affects resource drain → keep this in needs
   - v1.0 validated that activity costs create interesting choices → keep in needs system
   - Don't throw out validated mechanics when changing implementation

4. **Compatibility layer:**
   ```typescript
   // Old code expects getResource('energy')
   // New code has needs.energy
   // Adapter lets both coexist:

   function getResource(name: string): number {
     if (USE_NEW_NEEDS_SYSTEM) {
       return patient.needs[name]?.value ?? 0;
     }
     return patient.resources[name] ?? 0;
   }
   ```

5. **Side-by-side comparison:**
   - Run same scenario in v1.0 (flat resources) and v1.1 (needs)
   - Compare emergent behavior
   - If v1.1 loses desirable behaviors from v1.0, understand why before proceeding

**Which phase should address it:** Phase 1 (Architecture) - Plan migration strategy before writing code. Document "What are we keeping from v1.0?"

**Migration checklist:**
- [ ] List all v1.0 resources and what they do
- [ ] Map each to v1.1 equivalent (or mark as deprecated)
- [ ] Identify v1.0 behaviors we want to preserve
- [ ] Create adapter layer for compatibility
- [ ] Define success criteria: "v1.1 works when..."
- [ ] Plan rollback strategy if new system doesn't work

**Prevention:** Don't delete working code until replacement is validated to work better.

**Sources:**
- v1.0 validation results (see PROJECT.md)
- Personal experience with big-bang rewrites (they always find unexpected dependencies)

---

### Pitfall 9: Overskudd Calculation Too Complex to Debug

**What goes wrong:** Overskudd = f(Mood, Energy, Purpose, Willpower) where Mood = f(7 needs), Purpose = f(activity history, personality fit), Willpower = f(anxiety, stress). With 4 layers of derivation, when Overskudd is wrong, debugging requires tracing through 10+ intermediate calculations. Impossible to tune, impossible to verify correctness.

**Why it happens:**
- Elegant system design on paper becomes debugging nightmare in practice
- Each derived stat seems reasonable in isolation
- Didn't consider "how will I debug this when it's wrong?"
- No visibility into intermediate calculations

**Warning signs:**
- "Why is Overskudd 23 instead of 45?" takes 30 minutes to answer
- Changing one need unexpectedly affects Overskudd (non-obvious dependency path)
- Can't manually verify if calculation is correct without spreadsheet
- Tuning one parameter has ripple effects across 5 other stats
- Bugs reported as "Overskudd feels wrong" with no reproducible case

**Prevention:**
1. **Calculation transparency:**
   ```typescript
   interface CalculationTrace {
     finalValue: number;
     breakdown: {
       mood: { value: 60, contributingNeeds: [...] },
       energy: { value: 70 },
       purpose: { value: 55, recentActivities: [...] },
       willpower: { value: 40, anxietyPenalty: -10 }
     },
     formula: "(60*0.3 + 70*0.3 + 55*0.2 + 40*0.2)",
     timestamp: Date
   }

   patient.overskudd.getTrace();  // Returns full calculation chain
   ```

2. **Debug UI overlay:**
   - Show Overskudd with expandable tree of contributing factors
   - Click Mood → see all 7 needs with current values
   - Click Purpose → see activity history and personality fit scores
   - Visual diff: "Overskudd dropped from 65 to 45 because Energy dropped 20"

3. **Formula simplicity over realism:**
   - Resist urge to add "accuracy" if it makes debugging harder
   - `overskudd = (mood + energy + purpose + willpower) / 4` is debuggable
   - `overskudd = mood^1.2 * log(energy) * sigmoid(purpose - willpower)` is not
   - Simpler formula that's tunable > Complex formula that's theoretically correct

4. **Unit tests for edge cases:**
   ```typescript
   test('Overskudd never negative even when all inputs zero', () => {
     patient.needs.setAll(0);
     expect(patient.overskudd.value).toBeGreaterThanOrEqual(0);
   });

   test('Overskudd calculation is deterministic', () => {
     const state = patient.getState();
     const overskudd1 = patient.overskudd.value;
     patient.setState(state);
     const overskudd2 = patient.overskudd.value;
     expect(overskudd1).toBe(overskudd2);
   });
   ```

5. **Limit derivation depth:**
   - Max 2 layers: Primary stats → Derived stats
   - Don't derive from derived stats (no tertiary stats)
   - Overskudd can depend on Mood (derived) BUT Mood can't depend on other derived stats

**Which phase should address it:** Phase 1 (Architecture) when designing derived stat formulas. Build debug tooling BEFORE complex calculations.

**Debug tooling requirements:**
- Log all stat calculations with full breakdown
- UI to visualize stat dependency graph
- "Why is this value X?" inspector
- Regression tests that catch formula changes

**Sources:**
- Years of debugging complex game systems (personal experience)
- AI systems' self-evaluation failures - [Why AI Systems Can't Catch Their Own Mistakes](https://www.novaspivack.com/technology/ai-technology/why-ai-systems-cant-catch-their-own-mistakes-and-what-to-do-about-it)

---

### Pitfall 10: socialBattery for Introverts/Extroverts Without Clear Rules

**What goes wrong:** socialBattery drains during social activities for Introverts and regens for Extroverts - sounds simple. But what about group activities vs. one-on-one? What about socializing while doing other activities (cooking together)? What about quality of social interaction (deep conversation vs. small talk)? Edge cases explode, behavior becomes inconsistent and confusing.

**Why it happens:**
- Initial design covers happy path (party = social) but not nuances
- Real social interaction is complex, game system tries to capture it with simple rules
- Didn't enumerate all social contexts before implementing
- "We'll handle edge cases later" becomes "why does this behave weirdly?"

**Warning signs:**
- Playtesters ask "Why did socialBattery go up during lunch?" (is eating together social?)
- Inconsistent behavior: Same activity drains battery sometimes, regens other times
- Implementation has 15 special cases and exceptions
- "It depends" is the answer to most socialBattery questions
- Introverts and Extroverts don't feel mechanically different

**Prevention:**
1. **Clear taxonomy of social contexts:**
   ```typescript
   enum SocialIntensity {
     SOLO = 0,           // Alone, no interaction
     PARALLEL = 1,       // Same room but independent (library, gym)
     CASUAL = 2,         // Small talk, background social (office chat)
     ACTIVE = 3,         // Direct social engagement (dinner party)
     INTENSE = 4         // Deep connection (therapy, intimate conversation)
   }

   // Activities tagged with social intensity, not binary social/non-social
   ```

2. **Extraversion as social intensity preference:**
   ```typescript
   function socialBatteryDelta(activity: Activity, extraversion: number): number {
     const intensity = activity.socialIntensity;
     const preferredIntensity = extraversion / 25;  // 0-4 scale

     // Extroverts (E=80): prefer intensity 3-4, drained by 0-1
     // Introverts (E=20): prefer intensity 0-1, drained by 3-4

     const mismatch = Math.abs(intensity - preferredIntensity);
     return 10 - (mismatch * 5);  // Perfect match: +10, bad match: -10
   }
   ```

3. **Group size matters:**
   - Introverts: Comfortable with 1-2 people, drained by 5+ people
   - Extroverts: Energized by 5+ people, bored by 1-2 people
   - Same "Party" activity has different effect based on attendance

4. **Quality over quantity:**
   - Introvert having deep 1-on-1 conversation: socialBattery regens, Social need satisfied
   - Introvert at loud party: socialBattery drains, Social need satisfied anyway
   - Separation: Social need = "have I interacted with people?" socialBattery = "was that comfortable for my personality?"

5. **Opt-out mechanics:**
   - Introverts should have "Leave early" option for parties (restores battery, satisfies 80% of Social need)
   - Extroverts should have "Invite more people" option (increases intensity, drains battery for Introverts present)

**Design document template:**
Before implementing socialBattery, fill this out:

| Scenario | Social Need Impact | Introvert Battery | Extrovert Battery | Why |
|----------|-------------------|-------------------|-------------------|-----|
| Solo reading | No change | +5/hour | -2/hour | I: recharging, E: lonely |
| Coffee with friend | +10 | +3 (comfortable) | +5 (nice but small) | Quality 1-on-1 |
| Office small talk | +5 | -2 (draining) | +8 (energizing) | E likes casual social |
| Large party | +20 | -10 (overwhelming) | +15 (thriving) | Intensity mismatch |
| Group project work | +8 | +1 (focused social) | +6 (collaborative) | Task-focused reduces intensity |

**Which phase should address it:** Phase 2 (Needs Implementation) when socialBattery is first designed. Enumerate edge cases BEFORE coding.

**Testing:**
- Introvert (E=20) autonomously chooses solo activities when socialBattery low
- Extrovert (E=80) autonomously seeks social activities when socialBattery low
- Both can satisfy Social need but with different battery costs
- Check logs: Battery changes match documented rules

**Sources:**
- [Self-Determination Theory - Autonomy and Relatedness](https://pmc.ncbi.nlm.nih.gov/articles/PMC12412733/)

---

## The Sims Lessons Learned

### What The Sims Got Right

1. **Staggered need decay rates** - Bladder (19h), Hunger (16h), Energy (24h), Social (38h) create natural rhythms. Not all needs hit critical simultaneously. Different timescales prevent overwhelming players.

2. **Nonlinear consequences** - Needs dropping to 0 don't instantly kill, but trigger escalating penalties. Bladder accident → Hygiene drops. Low Energy → can't perform many activities. Graduated consequences, not binary failure.

3. **Object quality matters** - Better furniture/appliances restore needs faster and higher. Gives progression meaning (expensive shower restores more Hygiene) without changing core mechanics. Rewards player investment.

4. **Autonomous AI tunable per-Sim** - Free Will can be enabled/disabled globally or per-Sim. Lets players choose their preferred control level. Some players want full autonomy, others want puppets.

5. **Social activities restore Social** - Obvious but critical. Every need has activities that restore it. No "you're social-starved but there's nothing you can do about it" dead ends.

6. **Mood as derived stat** - Mood = f(needs) is visible and affects social interactions, work performance, skill gain. Gives needs MEANING beyond "bars to fill." Low Hygiene → sad → work performance drops → fired. Cascades are content.

### What The Sims Got Wrong (2025 Balance Patches)

1. **Instant Imbalanced cascades** - Witnessing death or extreme emotions INSTANTLY dropped Balance to zero, causing all needs to drain 25% faster with no recovery time. EA patched to give "time to react and get proper care." **Lesson: Never instant-fail derived stats. Always give player reaction time.**

2. **Ailments too contagious** - Ailments spread so aggressively that players needed naturopath visits every 3 days. Frequency reduced by 75% in July 2025 patch. **Lesson: Negative status effects that spread need careful tuning. Exponential growth kills fun.**

3. **Infant needs decay too fast** - Community created mods to cut infant need decay by 50% because default was overwhelming. **Lesson: Dependent entities need SLOWER decay or caretaker becomes full-time job.**

4. **Traits barely affect autonomy** - Community mods exist to make traits actually influence autonomous behavior because default is "bumbling idiots" who ignore personality. **Lesson: Personality must mechanically affect utility scoring, not just UI flavor.**

5. **No variety incentive** - Optimal strategy is spam Sleep → Eat → Shower. No penalty for repetition, no reward for diversity. **Lesson: Needs aren't enough. Need Purpose/Mood bonuses for varied activities.**

6. **Micromanagement required** - Players report 80% of time spent keeping needs satisfied. "Lazy Duchess" mod exists to slow decay because default is exhausting. **Lesson: Tune for "intervention needed every X minutes" that matches target engagement.**

### The Will Wright Revelation

Will Wright admitted in 2024 that early Sims AI was deliberately made WORSE because when it was competent, "almost anything the player did was worse than the Sims running on autopilot" and players felt useless.

**Critical insight:** Autonomous AI competence is not the goal. Player feeling helpful is the goal. AI must be good enough to justify "autonomous" label but bad enough that player intervention feels valuable. This is a game design problem, not a technical problem.

**Application to v1.1:** Early-game patients SHOULD make suboptimal choices (avoids challenging activities, spams safe options). Player role is to coach them toward better decisions. Late-game patients can handle themselves, player provides high-level goals. Autonomy is progression content, not a starting feature.

---

## Phase-Specific Warnings

| Phase | Focus | Likely Pitfall | Prevention Strategy |
|-------|-------|---------------|-------------------|
| Phase 1: Architecture | Derived stat calculations | Overskudd too complex to debug | Build calculation trace tooling first, limit derivation depth to 2 layers |
| Phase 2: Needs Implementation | Decay rates | Arbitrary rates create micromanagement | Design target first (intervention every X min), work backward to rates |
| Phase 2: Needs Implementation | Death spirals | Cascading failures with no escape | Build escape valves (cost reduction when struggling) into formulas |
| Phase 3: Action Resources | socialBattery | Edge case explosion | Enumerate all social contexts before implementing, create taxonomy |
| Phase 4: Derived Wellbeing | Mood/Purpose formulas | Cascading failures from averaging | Use nonlinear aggregation with floors, don't amplify single failures |
| Phase 5: Autonomous AI | Utility scoring | Obvious wrong choices | Implement urgency tiers (critical/urgent/normal), context awareness from day one |
| Phase 5: Autonomous AI | Personality expression | Traits don't affect behavior | Apply personality to need modifiers AND utility weights, test behavioral differences |
| Phase 6: Integration | Big-bang migration | Breaking v1.0 validation | Parallel implementation with toggle, incremental migration, preserve validated mechanics |
| Phase 6: Tuning | Optimal strategy emerges | Spam eat/sleep loop trivializes game | Diminishing returns, variety bonuses, couple skills with needs, purpose drain from misalignment |
| Phase 7: Polish | Player agency paradox | AI too good (useless player) or too bad (frustrating) | Progression-gated competence, player as coach not micromanager, visible AI reasoning |

---

## Validation Checklist

Before considering needs-based balance system "done," verify:

### Balance Validation
- [ ] Patient can autonomously recover from all needs at 20 without player intervention (death spiral escape test)
- [ ] Setting each need to 0 individually doesn't block critical restore actions (cascading failure test)
- [ ] 7-day autonomous simulation shows sustainable need maintenance, not constant crisis (decay rate test)
- [ ] Optimal strategy requires variety of activities, not spam eat/sleep loop (strategy diversity test)

### AI Behavior Validation
- [ ] Patient chooses bathroom when Bladder < 15 even if personality prefers other activities (urgency override test)
- [ ] Patient doesn't start 8-hour sleep when Hunger < 30 (duration awareness test)
- [ ] Patient on date doesn't abandon social activity for TV (context awareness test)
- [ ] Patient completes started activities unless need becomes critical (commitment test)

### Personality Validation
- [ ] Introvert (E=20) and Extrovert (E=80) show different activity patterns over 7 days (behavior differentiation test)
- [ ] High Openness patient chooses more creative activities than low Openness (trait expression test)
- [ ] Activity-personality misalignment drains Purpose measurably (mechanical consequence test)

### Integration Validation
- [ ] Can toggle between v1.0 flat resources and v1.1 needs system (migration safety test)
- [ ] v1.1 preserves v1.0's validated personality-affects-resources behavior (regression test)
- [ ] Overskudd calculation trace shows full breakdown of contributing factors (debuggability test)

### Player Experience Validation
- [ ] Playtesters can answer "What is my patient's personality?" by watching behavior, not reading UI (emergence test)
- [ ] Playtesters feel needs system creates interesting choices, not busywork (engagement test)
- [ ] Autonomous AI feels like "mostly competent with occasional need for guidance," not "helpless" or "I'm useless" (agency balance test)

---

## Research Confidence Assessment

| Area | Confidence | Evidence | Gaps |
|------|-----------|----------|------|
| Death spiral mechanics | HIGH | The Sims 4 2025 balance patches directly addressed this, community data on MCCC decay tuning | Specific formula that works for our 7 needs |
| Decay rate tuning | MEDIUM | Community reverse-engineered Sims rates, modders documented impact of changes | Our activity durations differ from Sims |
| Utility AI scoring | MEDIUM | Multiple game dev sources on utility AI, Sims community on autonomy failures | Integration with our personality system untested |
| Personality expression | MEDIUM | Self-Determination Theory research, multiple game design sources | How our Big Five maps to activity utility |
| socialBattery mechanics | LOW | General extraversion psychology, no specific game implementations found | Edge case handling needs design work |
| Optimal strategy prevention | MEDIUM | Game design literature on deterministic strategies, but not specific to needs systems | Testing required to find actual exploits |
| Player agency balance | HIGH | Will Wright's direct statement about deliberately worse AI, supported by Sims community feedback | How this applies to our "teaching autonomy" theme |

---

## Open Research Questions

1. **socialBattery formula:** What exact formula makes Introverts and Extroverts FEEL different in autonomous play? Need playtesting data.

2. **Purpose decay rate:** How fast should Purpose drain from personality-misaligned activities to matter but not dominate? Needs tuning.

3. **Overskudd floor:** What minimum Overskudd (if any) should patient always have to prevent total paralysis? 20? 10? 0?

4. **Skill-cost reduction:** As skills improve, should activity costs decrease linearly (skill 0 → 100% cost, skill 100 → 50% cost) or nonlinearly?

5. **Escape valve threshold:** At what need value should emergency cost reduction kick in? 20? 15? 10?

6. **Variety bonus magnitude:** How much Mood bonus for activity diversity to incentivize without forcing? +5? +10? +20?

These questions can't be answered through research. They require implementation and playtesting.

---

## Sources

### The Sims Balance & Community Data
- [The Sims 4 Balance & Imbalance Guide - SimsCommunity](https://simscommunity.info/2025/07/13/the-sims-4-balance-imbalance-guide/)
- [EA Update 7-29-2025: Restoring Balance and Soothing Ailments](https://www.ea.com/en/games/the-sims/the-sims-4/news/update-7-29-2025)
- [EA Forums: Balance system reacts way too extreme](https://forums.ea.com/discussions/the-sims-4-feedback-en/ebn-balance-system-reacts-way-to-extreme/12335024)
- [Waffle's Motive Decay Overhaul - Patreon](https://www.patreon.com/posts/waffles-motive-3-99128564)
- [Steam: Micro-managing Sims lives is not fun](https://steamcommunity.com/app/1222670/discussions/0/4343238688631975548/)
- [Steam: Sims Autonomy Questions](https://steamcommunity.com/app/1222670/discussions/0/501693985385917376/)
- [Better Autonomy Mod v1.0](https://www.patreon.com/posts/better-autonomy-62529639)

### The Sims Design Insights
- [PC Gamer: Will Wright says original Sims AI was actually too good](https://www.pcgamer.com/games/the-sims/will-wright-says-the-original-sims-ai-was-actually-too-good-almost-anything-the-player-did-was-worse-than-the-sims-running-on-autopilot/)
- [The Gamer: Sims Creator Made Characters Dumb On Purpose](https://www.thegamer.com/the-sims-ai-bad-on-purpose-first-game-will-wright/)

### Utility AI & Autonomous Behavior
- [Utility AI - Game Creator Documentation](https://docs.gamecreator.io/behavior/utility-ai/)
- [Medium: AI Made Easy with Utility AI](https://medium.com/@morganwalkupdev/ai-made-easy-with-utility-ai-fef94cd36161)
- [The Shaggy Dev: An Introduction to Utility AI](https://shaggydev.com/2023/04/19/utility-ai/)
- [AI Agents in Gaming - Inworld AI](https://inworld.ai/blog/ai-agents-in-video-games-current-and-future-state)

### Game Design - Balance & Strategy
- [Game Developer: The Art of the Spiral - Failure Cascades in Simulation Games](https://www.gamedeveloper.com/design/the-art-of-the-spiral-failure-cascades-in-simulation-games)
- [GameTek: Effective But Boring](https://gametek.substack.com/p/effective-but-boring)
- [Quantic Foundry: Strategy Decline](https://quanticfoundry.com/2024/05/21/strategy-decline/)
- [Modern RPGs and Skill Progression - Scott Fine Game Design](http://scottfinegamedesign.com/design-blog/2024/1/7/diabloxstarfield)

### Personality & Psychology in Games
- [Self-Determination Theory & Game Design 2024 - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12412733/)
- [ACM: Profiling Personality Traits with Games](https://dl.acm.org/doi/10.1145/3230738)

### AI System Challenges
- [Why AI Systems Can't Catch Their Own Mistakes - Nova Spivack](https://www.novaspivack.com/technology/ai-technology/why-ai-systems-cant-catch-their-own-mistakes-and-what-to-do-about-it)
- [EvaCodes: AI in Gaming Industry Challenges 2025](https://evacodes.com/blog/ai-in-gaming-industry)

---

*Researched: 2026-01-23*
*Confidence: MEDIUM - Substantial Sims community data and game design research, but our specific implementation untested*
*Primary sources: The Sims 4 2025 balance patches, community mod documentation, Will Wright interviews, utility AI documentation, game design literature*
