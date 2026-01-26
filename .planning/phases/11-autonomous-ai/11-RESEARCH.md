# Phase 11: Autonomous AI - Research

**Researched:** 2026-01-26
**Domain:** Utility-based AI decision systems for autonomous NPC behavior
**Confidence:** MEDIUM

## Summary

Utility-based AI is the industry-standard approach for autonomous NPC decision-making in simulation games like The Sims. The system evaluates all available actions using a weighted scoring formula that considers need urgency, personality fit, and resource availability, then selects from top-scoring options with configurable variety.

The architecture fits cleanly into the existing MobX-based TypeScript codebase. Activities already "advertise" their benefits via `needEffects` and personality alignment via `tags`. The autonomous system scores each activity, applies hysteresis to prevent oscillation, and uses weighted random selection from the top N candidates.

Critical implementation concerns include:
1. **Normalization**: All utility scores must use the same 0-100 scale to be comparable
2. **Hysteresis**: Give the current activity a 15-25% bonus to prevent oscillation between similar-scoring options
3. **Weighted variety**: Pick randomly from top 3-5 options using personality-modulated probability
4. **Critical override**: When needs drop below 15%, switch to pure urgency scoring (personality ignored)

**Primary recommendation:** Implement a `UtilityAIStore` following the existing store pattern, with scoring logic that mirrors existing `calculatePersonalityAlignment` and `getResourceCosts` patterns. Use weighted random selection from top N candidates with personality-based variety multipliers.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.x | State management | Already used throughout codebase for reactive updates |
| TypeScript | 5.x | Type safety | Project standard, essential for utility scoring complexity |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Existing `weightedRandom.ts` | - | Weighted selection without replacement | Top N activity selection with variety |
| Existing `curves.ts` | - | Sigmoid normalization curves | Need urgency to utility score conversion |
| Existing `personalityFit.ts` | - | Personality alignment scoring | Activity-personality fit calculation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Utility AI | Behavior Trees | BTs better for complex hierarchical logic, but utility AI better for emergent variety from simple rules |
| Utility AI | Finite State Machines | FSMs simpler but become unwieldy with many states, utility AI scales better |
| Utility AI | Goal-Oriented Action Planning (GOAP) | GOAP better for planning sequences, but overkill for single-action selection |

**Rationale:** Utility AI is the proven solution for The Sims-style autonomous behavior where variety and personality-driven decisions matter more than complex planning.

**Installation:**

No new dependencies required - use existing MobX store pattern and utility functions.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── stores/
│   └── UtilityAIStore.ts           # Main autonomous AI logic
├── utils/
│   ├── utilityScoring.ts           # Scoring formula and normalization
│   └── weightedRandom.ts           # (existing) Top N selection
├── types/
│   └── autonomy.ts                 # AIDecision, DecisionLog types
└── components/
    └── DecisionLogPanel.tsx        # Debug UI for decision visibility
```

### Pattern 1: Utility Scoring with Weighted Sum

**What:** Calculate a single 0-100 utility score for each activity by combining multiple weighted factors

**When to use:** Core decision-making - run this every time the AI needs to pick an activity

**Example:**
```typescript
// Source: Game AI Pro Chapter 9 - Introduction to Utility Theory
// http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf

interface UtilityFactors {
  needUrgency: number;      // 0-100: how badly needs require this activity
  personalityFit: number;   // 0-100: how well activity matches personality
  resourceAvailable: number; // 0-100: whether character has resources to perform
}

function calculateUtility(
  activity: Activity,
  character: Character,
  weights: { need: number; personality: number; resource: number }
): number {
  const factors = evaluateFactors(activity, character);

  // Weighted sum - all factors normalized to 0-100
  const utility =
    factors.needUrgency * weights.need +
    factors.personalityFit * weights.personality +
    factors.resourceAvailable * weights.resource;

  return Math.max(0, Math.min(100, utility));
}
```

**Critical warning:** All factors MUST be normalized to the same 0-100 scale. If one factor uses 0-1 and another uses 0-1000, the system will always pick the higher-range factor.

### Pattern 2: Hysteresis Bonus to Prevent Oscillation

**What:** Give the currently executing activity a 15-25% bonus to its utility score

**When to use:** Every scoring cycle - prevents thrashing between similar-scoring activities

**Example:**
```typescript
// Source: Game AI Pro Chapter 9
// Also: https://shawnhargreaves.com/blog/hysteresis.html

function scoreActivitiesWithHysteresis(
  activities: Activity[],
  character: Character,
  currentActivity: Activity | null
): Map<Activity, number> {
  const scores = new Map<Activity, number>();

  for (const activity of activities) {
    let score = calculateUtility(activity, character, weights);

    // Apply hysteresis: boost current activity by 25%
    if (currentActivity && activity.id === currentActivity.id) {
      score *= 1.25;
    }

    scores.set(activity, score);
  }

  return scores;
}
```

**Why it works:** Two nearly-equal behaviors won't oscillate if the current one gets a bonus. The AI develops "preferential memory" without explicit state tracking.

### Pattern 3: Weighted Random Selection from Top N

**What:** Instead of always picking the #1 highest-scoring activity, randomly select from the top 3-5 using weighted probability

**When to use:** Final selection step - creates variety while still being "smart"

**Example:**
```typescript
// Source: Game AI Pro Chapter 3 - Advanced Randomness Techniques
// http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter03_Advanced_Randomness_Techniques_for_Game_AI.pdf

function selectActivityWithVariety(
  scoredActivities: Map<Activity, number>,
  personalityVarietyMultiplier: number // High Openness = more variety
): Activity {
  // Sort by score descending
  const sorted = Array.from(scoredActivities.entries())
    .sort((a, b) => b[1] - a[1]);

  // Take top 3-5 candidates
  const topN = sorted.slice(0, 5);

  // Filter: never pick activity scoring <50% of best option
  const best = topN[0][1];
  const viable = topN.filter(([_, score]) => score >= best * 0.5);

  // Use existing weightedSampleWithoutReplacement utility
  const weights = viable.map(([_, score]) => score * personalityVarietyMultiplier);
  const [selectedIndex] = weightedSampleWithoutReplacement(weights, 1);

  return viable[selectedIndex][0];
}
```

**Personality modulation:**
- High Openness (>70): 1.5x variety multiplier (picks from top 5 more evenly)
- High Conscientiousness (>70): 0.7x variety multiplier (favors optimal choice)
- Average personality: 1.0x multiplier (~25% chance to pick #2 or #3)

### Pattern 4: Critical Need Override Mode

**What:** When needs drop below 15%, switch to pure urgency scoring - personality has no influence

**When to use:** Check before normal utility calculation - emergency behavior

**Example:**
```typescript
// Source: The Sims autonomy hierarchy (via research)
// https://amt-lab.org/blog/2023/4/how-ai-is-used-in-video-games-the-sims-4-and-red-dead-redemption-2

function shouldOverrideToCriticalMode(character: Character): boolean {
  return (
    character.needs.hunger < 15 ||
    character.needs.bladder < 15 ||
    character.needs.energy < 15
  );
}

function scoreInCriticalMode(
  activity: Activity,
  character: Character
): number {
  // Pure urgency: score = how much this activity addresses critical needs
  let urgencyScore = 0;

  if (activity.needEffects) {
    for (const [needKey, restore] of Object.entries(activity.needEffects)) {
      const needValue = character.needs[needKey as NeedKey];

      // Only count if need is critical (below 15)
      if (needValue < 15) {
        // Score = restoration amount * urgency (inverse of current value)
        urgencyScore += restore * (15 - needValue);
      }
    }
  }

  return urgencyScore;
}
```

**Top reason display:** In critical mode, the AI decision log shows "Eating because hungry (Hunger: 12%)" - no need for special "survival mode" indicator.

### Pattern 5: Free Will Toggle with Sims-Style Priority

**What:** Per-patient toggle that enables autonomous behavior to fill idle time, but player commands always override

**When to use:** Check on every tick - if player has queued an activity, skip autonomous selection

**Example:**
```typescript
// Source: The Sims free will system (via research)

class UtilityAIStore {
  // Per-character free will state
  freeWillEnabled = new Map<string, boolean>();

  processTick(character: Character, activityStore: ActivityStore): void {
    // Player commands always take priority
    if (activityStore.hasQueuedActivities) {
      return; // Don't interfere with player queue
    }

    // Only pick autonomous activity if:
    // 1. Free will is enabled for this character
    // 2. Character is idle (no current activity)
    const enabled = this.freeWillEnabled.get(character.id) ?? true; // Default ON

    if (enabled && activityStore.isIdle) {
      const decision = this.makeDecision(character);
      if (decision) {
        activityStore.enqueue(decision.activity.data);
      }
    }
  }
}
```

**Mid-activity toggle behavior (Claude's discretion):** Recommended approach - finish current activity before respecting Free Will OFF. Interrupting feels jarring.

### Anti-Patterns to Avoid

- **Don't mix scales:** Never combine unnormalized factors (e.g., hunger 0-1 with overskudd 0-100)
- **Don't always pick #1:** Pure optimization creates predictable, boring behavior
- **Don't ignore hysteresis:** Without it, AI will thrash between similar options
- **Don't apply personality in critical mode:** When hunger is 12%, personality shouldn't matter
- **Don't use utility AI for everything:** Pathfinding and state management have better-suited tools

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Weighted random selection | Custom probability sampling | `weightedSampleWithoutReplacement()` (existing) | Already implemented and tested with proper edge cases |
| Sigmoid normalization | Linear clamping | `needToMoodCurve()` (existing) | S-curves create better urgency perception than linear |
| Personality fit scoring | Custom tag matching | `calculatePersonalityAlignment()` (existing) | Already handles Big Five trait mapping to activity tags |
| Need urgency calculation | Manual threshold checks | Response curves with existing sigmoid | Non-linear urgency feels more natural |

**Key insight:** The codebase already has most utility scoring primitives. Don't rebuild - compose existing utilities into the AI decision system.

## Common Pitfalls

### Pitfall 1: Normalization Mismatch Causes Dominated Decisions

**What goes wrong:** If need urgency scores 0-1 but personality fit scores 0-100, the system always picks based on personality, ignoring urgent needs.

**Why it happens:** Different utility factors use different scales, and weighted sum combines them directly without normalization.

**How to avoid:**
- All factors MUST return 0-100 scores
- Use existing `needToMoodCurve()` pattern for need urgency (input 0-100 → output 0-100)
- Document expected range for every scoring function
- Add runtime assertions: `assert(score >= 0 && score <= 100)`

**Warning signs:**
- AI never picks certain activity types
- Changing weights by 10x has no effect
- Debug logs show one factor consistently 100x larger than others

### Pitfall 2: No Hysteresis Leads to Oscillation (Thrashing)

**What goes wrong:** AI switches between "Eat snack" and "Drink water" every tick because their scores fluctuate slightly.

**Why it happens:** Two nearly-equal options have scores that cross due to minor state changes (e.g., needs decaying by 0.1% per tick).

**How to avoid:**
- Always apply 15-25% bonus to current activity's score
- Add cooldown: don't switch activities for minimum N ticks (e.g., 5 ticks)
- Consider score gap threshold: only switch if new option scores >10% better

**Warning signs:**
- Activity queue flickers between same 2-3 options
- AI cancels and restarts activities repeatedly
- Decision log shows rapid switching every few ticks

### Pitfall 3: Variety System Picks Terrible Options

**What goes wrong:** AI picks "Exercise" (score 80) when "Sleep" (score 20) is also in top 5, because weighted random still has 5% chance of picking the worst option.

**Why it happens:** Top N selection without filtering allows low-scoring options if they make it into the candidate pool.

**How to avoid:**
- Filter top N: never include options scoring <50% of best option
- Example: If best = 90, worst acceptable = 45
- This prevents "random variety" from becoming "random stupidity"

**Warning signs:**
- AI makes obviously poor decisions occasionally
- Player sees "Why would you do that?" moments
- Decision log shows selected activity scored 30 when option scoring 95 existed

### Pitfall 4: Critical Override Doesn't Actually Override

**What goes wrong:** Patient has Hunger at 8% but still picks "Watch TV" because personality makes it score higher.

**Why it happens:** Critical mode check happens after normal utility calculation, or personality weights still apply in critical mode.

**How to avoid:**
- Check for critical needs FIRST, before normal scoring
- In critical mode, use pure urgency formula (restoration × (15 - current))
- Zero out personality weights when in override mode
- Log critical mode activation: "CRITICAL: Hunger 8%, entering survival mode"

**Warning signs:**
- Patient ignores food/sleep when critically low
- Debug shows critical flag true but personality factors still applied
- Death spiral: needs drop to 0 without triggering eating/sleeping

### Pitfall 5: Free Will Toggle Doesn't Respect Player Commands

**What goes wrong:** Player queues "Make Phone Call" but AI overwrites it with "Tidy Room" because free will is ON.

**Why it happens:** AI selection runs before checking if player has already assigned work.

**How to avoid:**
- ALWAYS check `activityStore.hasQueuedActivities` first
- Only run autonomous selection if queue is empty AND character is idle
- Player commands should clear autonomous picks, not vice versa

**Warning signs:**
- Player-queued activities get cancelled mysteriously
- UI shows player's choice but character does something else
- Players report "character won't listen to me"

### Pitfall 6: Decision Log Spam with No Useful Info

**What goes wrong:** Decision log shows 50 identical entries "Selected: Eat snack (score 75.3)" with no breakdown.

**Why it happens:** Logging happens but doesn't capture the "why" - just the final score.

**How to avoid:**
- Log full breakdown: `{ needUrgency: 85, personalityFit: 60, resourceAvail: 80 }`
- Show top 3 options with scores, not just selected one
- Include "top reason": e.g., "Eating because Hunger critical (12%)"
- Limit log to last 5-10 decisions to avoid memory bloat

**Warning signs:**
- Debug log is useless for understanding AI behavior
- Can't reproduce why AI made a specific choice
- No way to identify which factor is dominating decisions

## Code Examples

Verified patterns from research and existing codebase:

### Need Urgency Calculation

```typescript
// Uses existing sigmoid curve for non-linear urgency perception
import { needToMoodCurve } from '../utils/curves';

function calculateNeedUrgency(
  activity: Activity,
  character: Character
): number {
  if (!activity.needEffects) return 0;

  let totalUrgency = 0;
  let factorCount = 0;

  for (const [needKey, restoration] of Object.entries(activity.needEffects)) {
    const currentValue = character.needs[needKey as NeedKey];

    // Use inverted sigmoid: low need (0-30) = high urgency
    // needToMoodCurve at 0 returns -50, at 100 returns +50
    // Invert and normalize to 0-100
    const urgency = (50 - needToMoodCurve(currentValue, 1.0, 2.5)) / 100 * 100;

    // Weight by how much this activity restores
    totalUrgency += urgency * (restoration / 10); // Assume max restore ~10
    factorCount++;
  }

  return factorCount > 0 ? totalUrgency / factorCount : 0;
}
```

### Personality Fit Calculation

```typescript
// Uses existing personality alignment system
import { calculatePersonalityAlignment } from '../utils/personalityFit';

function calculatePersonalityFitScore(
  activity: Activity,
  character: Character
): number {
  const alignment = calculatePersonalityAlignment(
    activity.tags,
    character.personality
  );

  // alignment.gainMultiplier is 0.6-1.4 range
  // Convert to 0-100 score: 0.6 = 0, 1.0 = 50, 1.4 = 100
  const normalized = (alignment.gainMultiplier - 0.6) / 0.8 * 100;

  return Math.max(0, Math.min(100, normalized));
}
```

### Resource Availability Check

```typescript
// Check if character has sufficient resources to perform activity
function calculateResourceAvailability(
  activity: Activity,
  character: Character
): number {
  const costs = activity.getResourceCosts(character);
  const resources = character.actionResources;

  // Calculate how well resources meet costs (0-100 scale)
  const overskuddRatio = resources.overskudd / Math.max(1, costs.overskudd);
  const willpowerRatio = resources.willpower / Math.max(1, costs.willpower);
  const focusRatio = costs.focus > 0
    ? resources.focus / costs.focus
    : 1.0;
  const socialRatio = costs.socialBattery > 0
    ? resources.socialBattery / costs.socialBattery
    : 1.0;

  // Average ratios, clamp to 0-100
  const avgRatio = (overskuddRatio + willpowerRatio + focusRatio + socialRatio) / 4;
  return Math.max(0, Math.min(100, avgRatio * 100));
}
```

### Complete Utility Calculation

```typescript
// Combines all factors into final 0-100 utility score
interface UtilityWeights {
  need: number;        // Default: 0.5 (50%)
  personality: number; // Default: 0.3 (30%)
  resource: number;    // Default: 0.2 (20%)
}

function calculateUtilityScore(
  activity: Activity,
  character: Character,
  weights: UtilityWeights,
  isCurrentActivity: boolean
): number {
  // All factors return 0-100
  const needUrgency = calculateNeedUrgency(activity, character);
  const personalityFit = calculatePersonalityFitScore(activity, character);
  const resourceAvail = calculateResourceAvailability(activity, character);

  // Weighted sum (weights should sum to 1.0)
  let score =
    needUrgency * weights.need +
    personalityFit * weights.personality +
    resourceAvail * weights.resource;

  // Apply hysteresis: 25% bonus for current activity
  if (isCurrentActivity) {
    score *= 1.25;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}
```

### Decision Structure for Logging

```typescript
// Log format for AI decision visibility
interface AIDecision {
  timestamp: number;
  selectedActivity: Activity;
  topReason: string; // e.g., "Eating because Hunger critical (12%)"
  score: number;
  breakdown: {
    needUrgency: number;
    personalityFit: number;
    resourceAvailability: number;
  };
  topAlternatives: Array<{
    activity: Activity;
    score: number;
  }>;
  criticalMode: boolean;
}

// Example decision log entry
const decision: AIDecision = {
  timestamp: Date.now(),
  selectedActivity: eatSnackActivity,
  topReason: "Eating because Hunger urgent (22%)",
  score: 87.5,
  breakdown: {
    needUrgency: 92,
    personalityFit: 75,
    resourceAvailability: 95,
  },
  topAlternatives: [
    { activity: sleepActivity, score: 78.2 },
    { activity: watchTVActivity, score: 65.0 },
  ],
  criticalMode: false,
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Finite State Machines (FSMs) | Utility AI with behavior trees | ~2010s | FSMs still used for hierarchical states, but utility AI handles action selection |
| Always pick highest score | Weighted random from top N | ~2015+ | Creates emergent variety without appearing random/stupid |
| Hard thresholds for needs | Sigmoid response curves | The Sims 2+ | Non-linear urgency feels more human |
| Global autonomy toggle | Per-character free will | The Sims 2+ | Player controls individual autonomy |
| Hidden AI logic | Debug visualizations | ~2018+ (dev tools) | Essential for tuning and debugging emergent behavior |

**Deprecated/outdated:**
- Pure FSMs for complex decision-making: Still useful for state transitions, but poor for scoring/comparing many options
- Always picking optimal action: Creates predictable, boring AI behavior
- Hard-coded priority hierarchies: Rigid, doesn't adapt to personality or context

**Current best practices (2026):**
- Utility AI for action selection
- Behavior trees for hierarchical logic
- Sigmoid/response curves for factor evaluation
- Hysteresis/cooldowns to prevent oscillation
- Weighted random selection for variety
- Per-character autonomy toggles
- Decision logging for visibility/debugging

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal weight distribution for utility factors**
   - What we know: Need urgency, personality fit, and resource availability should all contribute
   - What's unclear: Exact percentages - is 50/30/20 better than 40/40/20?
   - Recommendation: Start with 50% need urgency, 30% personality fit, 20% resource availability. Make weights configurable in balance config for tuning in Phase 12.

2. **Variety multiplier curve for personality traits**
   - What we know: High Openness should increase variety, high Conscientiousness should decrease it
   - What's unclear: Should it be linear (Openness 70 = 1.2x, 80 = 1.4x) or sigmoid?
   - Recommendation: Start linear, gather data in Phase 12 balance tuning. Formula: `varietyMult = 1.0 + (openness - 50) * 0.01 - (conscientiousness - 50) * 0.005`

3. **Decision log retention and performance**
   - What we know: Need to track last N decisions for debugging panel
   - What's unclear: Does storing 5 vs 20 decisions impact performance with MobX reactivity?
   - Recommendation: Start with 5 decisions, use plain array (not observable array) to avoid excessive renders. Profile if needed.

4. **Behavior when switching modes mid-activity**
   - What we know: The Sims lets current activity finish when toggling autonomy
   - What's unclear: Does Lifelines need immediate interrupt or gradual transition?
   - Recommendation: Finish current activity before respecting Free Will OFF. Less jarring for player.

5. **Top N candidate pool size**
   - What we know: Should pick from top 3-5, not just top 1
   - What's unclear: Does pool size need to scale with number of available activities?
   - Recommendation: Fixed size of 5 works for most cases. If activity pool grows beyond 20, consider scaling to top 7-10.

## Sources

### Primary (HIGH confidence)

- [Game AI Pro Chapter 9: An Introduction to Utility Theory](http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf) - Comprehensive utility AI fundamentals
- [Game AI Pro 3 Chapter 13: Choosing Effective Utility-Based Considerations](http://www.gameaipro.com/GameAIPro3/GameAIPro3_Chapter13_Choosing_Effective_Utility-Based_Considerations.pdf) - Advanced scoring patterns
- [Game AI Pro Chapter 3: Advanced Randomness Techniques](http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter03_Advanced_Randomness_Techniques_for_Game_AI.pdf) - Weighted selection patterns
- Existing codebase patterns: `calculatePersonalityAlignment()`, `needToMoodCurve()`, `weightedSampleWithoutReplacement()`

### Secondary (MEDIUM confidence)

- [Intelligent Play: Intro to NPC Design and AI](https://scenegraph.academy/article/intelligent-play-intro-to-npc-design-and-ai-in-modern-video-games/) - Modern NPC AI overview
- [AI Decision-Making with Utility Scores](https://mcguirev10.com/2019/01/03/ai-decision-making-with-utility-scores-part-1.html) - Practical implementation guide
- [Shawn Hargreaves: Hysteresis](https://shawnhargreaves.com/blog/hysteresis.html) - Oscillation prevention pattern
- [How AI Is Used in The Sims 4](https://amt-lab.org/blog/2023/4/how-ai-is-used-in-video-games-the-sims-4-and-red-dead-redemption-2) - The Sims autonomy hierarchy
- [MobX Documentation](https://mobx.js.org/getting-started) - React state management patterns
- [Normalized Tunable Sigmoid Functions](https://dinodini.wordpress.com/2010/04/05/normalized-tunable-sigmoid-functions/) - Response curve theory

### Tertiary (LOW confidence)

- [Wikipedia: Utility System](https://en.wikipedia.org/wiki/Utility_system) - Basic definitions
- [Medium: AI Made Easy with Utility AI](https://medium.com/@morganwalkupdev/ai-made-easy-with-utility-ai-fef94cd36161) - Introductory concepts
- [The Shaggy Dev: An Introduction to Utility AI](https://shaggydev.com/2023/04/19/utility-ai/) - Tutorial-level overview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - MobX/TypeScript already in use, patterns proven in existing codebase
- Architecture: HIGH - Utility AI is industry standard for this problem, well-documented in Game AI Pro series
- Pitfalls: MEDIUM - Normalization and hysteresis patterns well-known, but specific tuning values need testing
- Implementation details: MEDIUM - Scoring formulas verified from research, but weight distributions require Phase 12 tuning

**Research date:** 2026-01-26
**Valid until:** ~60 days (stable domain - utility AI patterns haven't changed significantly since 2015)

**What was validated:**
- Existing utilities (`calculatePersonalityAlignment`, `needToMoodCurve`, `weightedSampleWithoutReplacement`) can be composed for utility scoring
- Weighted sum approach with 0-100 normalized factors is standard
- Hysteresis (15-25% bonus) prevents oscillation
- Weighted random from top N (3-5) creates variety without stupidity
- Critical mode override (<15% threshold) matches The Sims pattern
- Free Will toggle per character with player priority is standard UX

**What needs testing in Phase 12:**
- Exact weight distribution (need vs personality vs resource)
- Variety multiplier curve (personality → randomness)
- Decision log retention performance
- Hysteresis percentage (15% vs 25%)
- Top N pool size (3 vs 5 vs 7)
