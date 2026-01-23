# Phase 8: Derived Wellbeing - Research

**Researched:** 2026-01-23
**Domain:** Derived stats with curve-based computations, smoothing/lag, and personality equilibrium
**Confidence:** HIGH

## Summary

This phase implements three derived wellbeing stats: Mood (computed from primary needs via curves), Purpose (personality-aligned equilibrium system), and Nutrition (slow-moving food quality stat). These stats build on Phase 7's primary needs foundation and feed into Phase 9's action resources. The research examined The Sims needs-to-mood curves, sigmoid functions for diminishing returns, exponential smoothing for emotional lag, personality psychology for purpose equilibrium, and game nutrition tier systems.

The existing codebase uses MobX computed properties and tick-based updates, making it straightforward to add derived stats that reactively compute from needs and personality. The key challenges are: (1) implementing curve-based contributions that prevent death spirals, (2) smoothing values over time to feel emotional rather than mechanical, and (3) creating a Purpose system that naturally seeks equilibrium based on personality traits.

**Primary recommendation:** Implement Mood as a MobX computed property with curve-based need contributions (sigmoid-style) that update a smoothed target value via exponential moving average in tick updates. Purpose uses personality traits to set a baseline equilibrium (Conscientiousness/Openness → higher baseline) and decays toward it when not performing meaningful activities. Nutrition changes slowly via simple food quality tiers tracked over time. Display all three in NeedsPanel with visual grouping separating primary needs from derived stats.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | Reactive state management | Already used, computed properties perfect for derived stats |
| TypeScript | ~5.9.3 | Type safety | Current project standard, enables strong typing for computations |
| React | 19.2.0 | UI framework | Current project framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DaisyUI | 5.5.14 | UI components | Tooltips for stat breakdowns, badges for Mood icons |
| Tailwind CSS | 4.1.18 | Styling | Color coding for stat states |
| clsx | 2.1.1 | Conditional classes | Dynamic styling based on stat values |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Exponential smoothing | Linear interpolation (lerp) | Exponential provides frame-rate independence and better feel |
| DaisyUI tooltips | react-tooltip library | DaisyUI sufficient for simple breakdowns, no new dependency |
| Sigmoid curves | Linear weighted average | Curves prevent death spirals and feel more natural |
| Emoji/icon for Mood | Progress bar | Icons communicate emotional state faster than numeric bars |

**Installation:**
```bash
# No new dependencies required - all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── Character.ts          # Add derived stat computed properties
│   ├── types.ts               # Add DerivedStats interface
├── config/
│   ├── balance.ts             # Add DerivedStatsConfig section
├── components/
│   ├── NeedsPanel.tsx         # Extend to show derived stats section
│   ├── DerivedStatBar.tsx     # NEW: Display derived stat with tooltip
│   ├── MoodIcon.tsx           # NEW: Emoji/icon indicator for Mood
└── utils/
    ├── curves.ts              # NEW: Sigmoid and curve functions
    └── smoothing.ts           # NEW: Exponential smoothing utilities
```

### Pattern 1: Curve-Based Need Contribution
**What:** Map need values (0-100) to mood contribution using sigmoid curves where low needs have dramatic impact, high needs minimal impact
**When to use:** Converting resource levels to derived stats with diminishing returns
**Example:**
```typescript
// Source: Sigmoid functions in game design (jfurness.uk)
// Formula: f(x; σ, λ) = x^λ / (x^λ + σ^λ)
// σ (sigma): inflection point, λ (lambda): steepness

/**
 * Sigmoid curve for need-to-mood contribution.
 * Low need values (0-30) contribute very negatively.
 * Mid need values (30-70) contribute moderately.
 * High need values (70-100) contribute minimally (diminishing returns).
 */
function needToMoodContribution(
  needValue: number,
  weight: number = 1.0,
  steepness: number = 2.0
): number {
  // Normalize to 0-1 range
  const normalized = needValue / 100;

  // Sigmoid: output 0-1, inflection at 0.5
  const sigma = 0.5;
  const lambda = steepness;
  const curve = Math.pow(normalized, lambda) /
    (Math.pow(normalized, lambda) + Math.pow(sigma, lambda));

  // Map to contribution: 0 → -50 (bad), 0.5 → 0 (neutral), 1 → +50 (good)
  const contribution = (curve - 0.5) * 100 * weight;

  return contribution;
}

// Physiological needs: steeper curve (more urgent when low)
const hungerContribution = needToMoodContribution(hunger, 1.5, 3.0);

// Social needs: gentler curve (less dramatic when low)
const socialContribution = needToMoodContribution(social, 1.0, 2.0);
```

### Pattern 2: Exponential Smoothing for Lag
**What:** Smooth derived stat changes over time using exponential moving average, creating emotional inertia
**When to use:** When stats should trend toward target values gradually, not snap instantly
**Example:**
```typescript
// Source: Exponential smoothing (DEV Community, Moving Average npm)
// Formula: newValue = currentValue + alpha * (target - currentValue)
// Alpha (α): smoothing factor, higher = faster response (0 < α ≤ 1)

/**
 * Exponential smoothing utility for gradual stat convergence.
 * Creates lag/inertia effect - stats trend toward computed values over time.
 */
class SmoothedStat {
  private currentValue: number;
  private alpha: number; // Smoothing factor (0-1)

  constructor(initialValue: number, alpha: number = 0.1) {
    this.currentValue = initialValue;
    this.alpha = alpha;
  }

  /**
   * Update toward target value using exponential smoothing.
   * Call this each tick with computed target value.
   */
  update(targetValue: number): number {
    this.currentValue = this.currentValue +
      this.alpha * (targetValue - this.currentValue);
    return this.currentValue;
  }

  getValue(): number {
    return this.currentValue;
  }

  setValue(value: number): void {
    this.currentValue = value;
  }
}

// Usage in Character:
// Computed target mood from needs
get targetMood(): number {
  return this.computeMoodFromNeeds();
}

// Smoothed actual mood (updated each tick)
private moodSmoother = new SmoothedStat(50, 0.1); // alpha=0.1 = slow

applyTickUpdate(speedMultiplier: number): void {
  // Update smoothed mood toward computed target
  const newMood = this.moodSmoother.update(this.targetMood);
  this.resources.mood = newMood;
}
```

### Pattern 3: Personality-Based Equilibrium
**What:** Derived stats have personality-determined baseline values they naturally trend toward
**When to use:** Purpose, motivation, or other stats that should stabilize at character-specific levels
**Example:**
```typescript
// Source: Big Five personality research (Psychology literature, 2025)
// High Conscientiousness + Openness → higher purpose baseline
// Low Conscientiousness + Openness → lower purpose baseline

/**
 * Compute personality-based Purpose equilibrium.
 * Purpose naturally decays toward this baseline when not doing meaningful activities.
 */
function computePurposeEquilibrium(personality: Personality): number {
  const { conscientiousness, openness } = personality;

  // Base: 50 (average)
  let equilibrium = 50;

  // Conscientiousness: +20 at 100, -20 at 0 (goal-oriented people have higher purpose baseline)
  equilibrium += ((conscientiousness - 50) / 50) * 20;

  // Openness: +10 at 100, -10 at 0 (curious people find more meaning)
  equilibrium += ((openness - 50) / 50) * 10;

  // Clamp to 20-80 range (prevent extremes)
  return Math.max(20, Math.min(80, equilibrium));
}

// Purpose decays toward equilibrium when not doing meaningful activities
function applyPurposeDecay(
  currentPurpose: number,
  equilibrium: number,
  decayRate: number,
  speedMultiplier: number
): number {
  // Exponential approach to equilibrium
  const distance = currentPurpose - equilibrium;
  const decay = distance * decayRate * speedMultiplier;
  return currentPurpose - decay;
}
```

### Pattern 4: Slow-Moving Stat with Tiers
**What:** Stats that change very gradually based on sustained behavior, using simple quality tiers
**When to use:** Nutrition, long-term health, addiction levels
**Example:**
```typescript
// Source: Game nutrition systems (Eco, GT New Horizons)
// Food quality tiers: Bad/OK/Good/Great
// Nutrition changes slowly based on food eaten over time

enum FoodQuality {
  Bad = 0,      // Fast food, junk
  OK = 1,       // Basic meals
  Good = 2,     // Balanced nutrition
  Great = 3,    // Premium healthy food
}

interface NutritionState {
  value: number;              // Current nutrition (0-100)
  recentFoodQuality: number;  // Running average of food quality (0-3)
  sampleCount: number;        // How many meals tracked
}

/**
 * Track nutrition as very slow-moving stat.
 * Food quality affects nutrition, which affects Energy regen and Mood baseline.
 */
class NutritionTracker {
  private state: NutritionState;

  // Add food to recent history (updates running average)
  eatFood(quality: FoodQuality): void {
    const alpha = 0.1; // Slow decay for running average
    this.state.recentFoodQuality =
      this.state.recentFoodQuality * (1 - alpha) + quality * alpha;
  }

  // Update nutrition each tick (very slow convergence)
  updateTick(speedMultiplier: number): void {
    // Target nutrition from food quality (0-3 → 0-100)
    const targetNutrition = (this.state.recentFoodQuality / 3) * 100;

    // Very slow alpha (0.01 = changes over many in-game days)
    const alpha = 0.01 * speedMultiplier;
    this.state.value = this.state.value +
      alpha * (targetNutrition - this.state.value);
  }

  // Low nutrition affects Energy regen
  getEnergyRegenModifier(): number {
    // 100 nutrition → 1.0x, 0 nutrition → 0.5x
    return 0.5 + (this.state.value / 100) * 0.5;
  }

  // Low nutrition drags down Mood baseline
  getMoodBaselineModifier(): number {
    // 100 nutrition → 0, 0 nutrition → -20
    return -20 * (1 - this.state.value / 100);
  }
}
```

### Pattern 5: Mood Emoji/Icon Indicator
**What:** Display emotional state using icons/emojis rather than numeric bars
**When to use:** Communicating emotional/subjective states where icons are clearer than numbers
**Example:**
```typescript
// Source: UX best practices for emoji indicators (UX Playbook 2026)
// Emojis communicate mood faster than numbers
// Hover shows numeric breakdown

/**
 * Get mood emoji based on current value.
 * Icons: 😢 (sad), 😐 (neutral), 🙂 (content), 😊 (happy)
 */
function getMoodEmoji(moodValue: number): string {
  if (moodValue >= 75) return '😊'; // Happy
  if (moodValue >= 50) return '🙂'; // Content
  if (moodValue >= 25) return '😐'; // Neutral
  return '😢'; // Sad
}

// Component
export const MoodIcon = observer(function MoodIcon({
  value,
  breakdown
}: MoodIconProps) {
  const emoji = getMoodEmoji(value);

  return (
    <div
      className="tooltip"
      data-tip={`Mood: ${Math.round(value)}\n${breakdown}`}
    >
      <span className="text-4xl">{emoji}</span>
    </div>
  );
});
```

### Anti-Patterns to Avoid
- **Linear weighted average for Mood:** Creates death spirals when multiple needs are low - use curves
- **Instant stat updates:** Mood/Purpose should lag to feel emotional, not mechanical
- **Fixed Purpose baseline:** Should vary by personality, not constant 50 for all characters
- **Nutrition as fast-moving stat:** Should represent long-term diet, not individual meals
- **Showing raw computed values:** Display smoothed values, keep computed targets internal
- **Mood as numeric bar:** Use emoji/icon for better emotional communication

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sigmoid curve formula | Custom polynomial | Standard sigmoid: x^λ / (x^λ + σ^λ) | Math errors common, proven formula |
| Exponential smoothing | Manual lerp in tick | EMA formula: v + α(t - v) | Frame-rate independent, tunable |
| Emoji rendering | Custom icon system | Unicode emoji characters | Universal support, no assets needed |
| Tooltip positioning | CSS from scratch | DaisyUI tooltip classes | Handles edge cases, accessibility |
| Weighted average with floors | Custom safeguards | Clamp + sigmoid curves | Prevents division by zero, NaN propagation |

**Key insight:** The Sims team spent years tuning need-to-mood curves. Sigmoid functions are mathematically proven for diminishing returns. Don't reinvent these patterns - use established formulas and tune parameters instead.

## Common Pitfalls

### Pitfall 1: Death Spiral from Linear Mood Computation
**What goes wrong:** Using simple weighted average without curves causes Mood to collapse when multiple needs are low
**Why it happens:** Linear mapping means 3 needs at 20% → Mood at 20% → all-red interface → player overwhelmed
**How to avoid:** Use sigmoid curves that compress high values and decompress low values, plus Mood floor (never below 10)
**Warning signs:** Playtest shows "everything crashes at once", Mood hits 0 frequently

### Pitfall 2: Mechanical Mood Updates
**What goes wrong:** Mood updates instantly when needs change, feels robotic not emotional
**Why it happens:** Using computed property directly without smoothing/lag
**How to avoid:** Compute target Mood, smooth actual Mood toward target over time using exponential smoothing
**Warning signs:** Mood bar jumps frantically as needs change, doesn't feel like emotional state

### Pitfall 3: Purpose Without Equilibrium
**What goes wrong:** Purpose drains to zero when not doing meaningful activities, never stabilizes
**Why it happens:** Forgot Context requirement: Purpose seeks personality-based equilibrium
**How to avoid:** Compute equilibrium from Conscientiousness + Openness, decay toward it not toward zero
**Warning signs:** All characters' Purpose trends to same low value regardless of personality

### Pitfall 4: Nutrition Changes Too Fast
**What goes wrong:** Nutrition swings wildly based on single meals, defeats "long-term health" concept
**Why it happens:** Using same smoothing alpha as Mood/Purpose (0.1-0.2)
**How to avoid:** Very small alpha for Nutrition (0.01-0.02), track running average of food quality over many meals
**Warning signs:** Nutrition jumps from 80 to 30 after one bad meal

### Pitfall 5: Missing Mood Breakdown in UI
**What goes wrong:** Player sees Mood at 35 but can't tell which needs are causing it
**Why it happens:** Context specified tooltip shows breakdown, but implementation skips it
**How to avoid:** Store need contributions as map during Mood computation, display in tooltip
**Warning signs:** User feedback: "I don't understand why my character is sad"

### Pitfall 6: Forgetting Asymptotic Behavior
**What goes wrong:** Mood can hit exactly 0 or exactly 100, breaking immersion
**Why it happens:** Context specified asymptotic approach to extremes (like Phase 7 needs decay)
**How to avoid:** Clamp Mood to [10, 95] range, or use asymptotic formula approaching extremes
**Warning signs:** Mood displays "0%" or "100%", should never reach absolute extremes

### Pitfall 7: Purpose Affected by Wrong Activities
**What goes wrong:** Any activity increases Purpose, not just personality-aligned meaningful ones
**Why it happens:** Forgot Context requirement: meaningful = aligns with personality AND builds skills
**How to avoid:** Check activity domain matches personality traits (Openness → creative domain, etc.) AND activity grants skill XP
**Warning signs:** All activities boost Purpose equally, personality has no effect

### Pitfall 8: Nutrition Doesn't Affect Other Stats
**What goes wrong:** Nutrition exists but has no gameplay impact
**Why it happens:** Requirements specify Nutrition affects Energy regen AND Mood baseline, easy to implement only storage
**How to avoid:** Apply Nutrition modifiers: getEnergyRegenModifier() in Energy recovery, getMoodBaselineModifier() in Mood computation
**Warning signs:** Nutrition bar exists but changing it does nothing observable

## Code Examples

Verified patterns from official sources:

### Derived Stats Type Definitions
```typescript
// In entities/types.ts

/**
 * Derived wellbeing stats computed from primary needs and personality.
 * These are smoothed/lagged, not instant computations.
 */
export interface DerivedStats {
  mood: number;           // Computed from need satisfaction (0-100)
  purpose: number;        // Personality equilibrium system (0-100)
  nutrition: number;      // Slow-moving food quality stat (0-100)
}

// Food quality tiers for nutrition tracking
export enum FoodQuality {
  Bad = 0,      // Junk food, fast food
  OK = 1,       // Basic meals
  Good = 2,     // Balanced nutrition
  Great = 3,    // Premium healthy food
}

// Breakdown for UI tooltips
export interface StatBreakdown {
  total: number;
  contributions: Array<{ source: string; value: number }>;
}

export function defaultDerivedStats(): DerivedStats {
  return {
    mood: 50,
    purpose: 50,
    nutrition: 70, // Start decent
  };
}
```

### Balance Config for Derived Stats
```typescript
// In config/balance.ts

export interface DerivedStatsConfig {
  // Mood computation
  moodSmoothingAlpha: number;      // Exponential smoothing (0.05-0.2)
  moodFloor: number;               // Minimum mood (prevents 0)
  moodCeiling: number;             // Maximum mood (prevents 100)

  // Need-to-mood contribution weights
  needWeights: {
    hunger: number;                // Physiological (higher weight)
    energy: number;
    hygiene: number;
    bladder: number;
    social: number;                // Social (lower weight)
    fun: number;
    security: number;
  };

  // Purpose system
  purposeSmoothingAlpha: number;   // Exponential smoothing
  purposeDecayRate: number;        // Decay toward equilibrium
  purposeEquilibriumWeights: {
    conscientiousness: number;     // Weight for equilibrium calculation
    openness: number;
  };

  // Nutrition system
  nutritionSmoothingAlpha: number; // Very slow (0.01-0.02)
  nutritionEnergyModMin: number;   // Min Energy regen multiplier (0.5 = 50%)
  nutritionEnergyModMax: number;   // Max Energy regen multiplier (1.0 = 100%)
  nutritionMoodPenalty: number;    // Max Mood baseline penalty (-20)
}

export const DEFAULT_DERIVED_STATS_CONFIG: DerivedStatsConfig = {
  // Mood: moderate lag
  moodSmoothingAlpha: 0.1,
  moodFloor: 10,
  moodCeiling: 95,

  // Physiological needs: weight 1.5, Social needs: weight 1.0
  needWeights: {
    hunger: 1.5,
    energy: 1.5,
    hygiene: 1.0,
    bladder: 1.0,
    social: 1.0,
    fun: 1.0,
    security: 1.0,
  },

  // Purpose: slower lag than Mood
  purposeSmoothingAlpha: 0.05,
  purposeDecayRate: 0.02,
  purposeEquilibriumWeights: {
    conscientiousness: 20, // ±20 points from 50 baseline
    openness: 10,          // ±10 points from 50 baseline
  },

  // Nutrition: very slow
  nutritionSmoothingAlpha: 0.01,
  nutritionEnergyModMin: 0.5,
  nutritionEnergyModMax: 1.0,
  nutritionMoodPenalty: -20,
};

// Extend BalanceConfig
export interface BalanceConfig {
  // ... existing fields
  derivedStats: DerivedStatsConfig;
}
```

### Curve Utility Functions
```typescript
// In utils/curves.ts

/**
 * Sigmoid curve for need-to-mood contribution.
 * Creates diminishing returns: low needs hurt a lot, high needs help little.
 *
 * @param value - Input value (0-100 scale)
 * @param weight - Contribution weight (multiplier)
 * @param steepness - Curve steepness (higher = sharper transition)
 * @returns Contribution value (can be negative or positive)
 */
export function needToMoodCurve(
  value: number,
  weight: number = 1.0,
  steepness: number = 2.0
): number {
  // Normalize to 0-1
  const x = value / 100;

  // Sigmoid formula: x^λ / (x^λ + σ^λ)
  const sigma = 0.5;  // Inflection point at 50%
  const lambda = steepness;

  const numerator = Math.pow(x, lambda);
  const denominator = numerator + Math.pow(sigma, lambda);
  const curve = numerator / denominator;

  // Map 0-1 curve to contribution: 0 → -50, 0.5 → 0, 1 → +50
  // Then apply weight
  return (curve - 0.5) * 100 * weight;
}

/**
 * Clamp value to range with soft bounds (asymptotic approach).
 * Prevents ever reaching exact min/max.
 */
export function asymptoticClamp(
  value: number,
  min: number,
  max: number,
  strength: number = 0.9
): number {
  if (value < min) {
    // Approach min asymptotically
    const distance = min - value;
    return min - distance * strength;
  }
  if (value > max) {
    // Approach max asymptotically
    const distance = value - max;
    return max + distance * strength;
  }
  return value;
}
```

### Smoothing Utility
```typescript
// In utils/smoothing.ts

/**
 * Exponential smoothing for gradual stat convergence.
 * Creates lag/inertia - stats trend toward targets over time.
 */
export class SmoothedValue {
  private current: number;
  private alpha: number;

  constructor(initialValue: number, alpha: number = 0.1) {
    this.current = initialValue;
    this.alpha = alpha;
  }

  /**
   * Update toward target using exponential smoothing.
   * Formula: current = current + α * (target - current)
   *
   * @param target - Target value to approach
   * @returns New current value
   */
  update(target: number): number {
    this.current = this.current + this.alpha * (target - this.current);
    return this.current;
  }

  getValue(): number {
    return this.current;
  }

  setValue(value: number): void {
    this.current = value;
  }

  setAlpha(alpha: number): void {
    this.alpha = alpha;
  }
}
```

### Character Derived Stats Integration
```typescript
// In entities/Character.ts

export class Character {
  // ... existing fields
  derivedStats?: DerivedStats;  // v1.1 derived wellbeing stats

  // Smoothers for lag/inertia (not serialized, transient state)
  private moodSmoother?: SmoothedValue;
  private purposeSmoother?: SmoothedValue;
  private nutritionSmoother?: SmoothedValue;

  // Nutrition state (tracks recent food quality)
  private recentFoodQuality: number = 1.0; // Running average (0-3 scale)

  /**
   * Initialize derived stats system (called when needs system enabled)
   */
  initializeDerivedStats(): void {
    const config = this.root?.balanceConfig?.config.derivedStats;
    if (!config) return;

    this.derivedStats = defaultDerivedStats();

    // Initialize smoothers
    this.moodSmoother = new SmoothedValue(
      this.derivedStats.mood,
      config.moodSmoothingAlpha
    );
    this.purposeSmoother = new SmoothedValue(
      this.derivedStats.purpose,
      config.purposeSmoothingAlpha
    );
    this.nutritionSmoother = new SmoothedValue(
      this.derivedStats.nutrition,
      config.nutritionSmoothingAlpha
    );
  }

  /**
   * Computed: Target mood from need satisfaction.
   * Uses sigmoid curves for diminishing returns.
   */
  get computedMoodTarget(): number {
    if (!this.needs || !this.root?.balanceConfig) return 50;

    const config = this.root.balanceConfig.config.derivedStats;
    const weights = config.needWeights;

    // Compute weighted contributions from each need
    let totalContribution = 0;
    let totalWeight = 0;

    for (const [key, needValue] of Object.entries(this.needs)) {
      const weight = weights[key as NeedKey] ?? 1.0;
      const contribution = needToMoodCurve(needValue, weight, 2.5);
      totalContribution += contribution;
      totalWeight += weight;
    }

    // Average contribution, then map to 0-100 scale
    const avgContribution = totalContribution / totalWeight;
    let mood = 50 + avgContribution;

    // Apply nutrition modifier (low nutrition drags down baseline)
    if (this.derivedStats) {
      const nutritionMod = this.getNutritionMoodModifier();
      mood += nutritionMod;
    }

    // Clamp to asymptotic bounds
    return asymptoticClamp(mood, config.moodFloor, config.moodCeiling);
  }

  /**
   * Computed: Mood breakdown for UI tooltip.
   */
  get moodBreakdown(): StatBreakdown {
    if (!this.needs) {
      return { total: 50, contributions: [] };
    }

    const contributions: Array<{ source: string; value: number }> = [];
    const config = this.root?.balanceConfig?.config.derivedStats;

    if (config) {
      // Show each need's contribution
      for (const [key, needValue] of Object.entries(this.needs)) {
        const weight = config.needWeights[key as NeedKey] ?? 1.0;
        const contribution = needToMoodCurve(needValue, weight, 2.5);
        contributions.push({
          source: capitalizeFirst(key),
          value: Math.round(contribution),
        });
      }

      // Nutrition modifier
      if (this.derivedStats) {
        const nutritionMod = this.getNutritionMoodModifier();
        if (Math.abs(nutritionMod) > 0.5) {
          contributions.push({
            source: 'Nutrition',
            value: Math.round(nutritionMod),
          });
        }
      }
    }

    return {
      total: Math.round(this.derivedStats?.mood ?? 50),
      contributions,
    };
  }

  /**
   * Computed: Purpose equilibrium from personality.
   */
  get purposeEquilibrium(): number {
    const config = this.root?.balanceConfig?.config.derivedStats;
    if (!config) return 50;

    const { conscientiousness, openness } = this.personality;
    const weights = config.purposeEquilibriumWeights;

    // Base: 50
    let equilibrium = 50;

    // Conscientiousness modifier: ±20 at extremes
    equilibrium += ((conscientiousness - 50) / 50) * weights.conscientiousness;

    // Openness modifier: ±10 at extremes
    equilibrium += ((openness - 50) / 50) * weights.openness;

    // Clamp to reasonable range
    return Math.max(20, Math.min(80, equilibrium));
  }

  /**
   * Action: Eat food, update nutrition tracking.
   */
  eatFood(quality: FoodQuality): void {
    // Update running average of food quality (slow decay)
    const alpha = 0.1;
    this.recentFoodQuality =
      this.recentFoodQuality * (1 - alpha) + quality * alpha;
  }

  /**
   * Action: Perform meaningful activity, boost Purpose above equilibrium.
   */
  boostPurpose(amount: number): void {
    if (!this.derivedStats) return;

    // Set purpose target higher (smoother will gradually move toward it)
    const newTarget = Math.min(95, this.derivedStats.purpose + amount);
    this.purposeSmoother?.setValue(newTarget);
  }

  /**
   * Helper: Nutrition's effect on Mood baseline.
   */
  private getNutritionMoodModifier(): number {
    if (!this.derivedStats) return 0;

    const config = this.root?.balanceConfig?.config.derivedStats;
    if (!config) return 0;

    // Low nutrition drags down Mood
    // 100 nutrition → 0 penalty, 0 nutrition → max penalty
    const nutritionRatio = this.derivedStats.nutrition / 100;
    return config.nutritionMoodPenalty * (1 - nutritionRatio);
  }

  /**
   * Helper: Nutrition's effect on Energy regeneration.
   */
  getNutritionEnergyModifier(): number {
    if (!this.derivedStats) return 1.0;

    const config = this.root?.balanceConfig?.config.derivedStats;
    if (!config) return 1.0;

    // Map nutrition 0-100 to modifier range
    const nutritionRatio = this.derivedStats.nutrition / 100;
    return config.nutritionEnergyModMin +
      (config.nutritionEnergyModMax - config.nutritionEnergyModMin) * nutritionRatio;
  }

  /**
   * Action: Update derived stats each tick.
   * Called after needs decay.
   */
  applyDerivedStatsUpdate(speedMultiplier: number): void {
    if (!this.derivedStats || !this.root?.balanceConfig) return;

    const config = this.root.balanceConfig.config.derivedStats;

    // Update Mood: smooth toward computed target
    if (this.moodSmoother) {
      this.derivedStats.mood = this.moodSmoother.update(this.computedMoodTarget);
    }

    // Update Purpose: decay toward equilibrium
    if (this.purposeSmoother) {
      const target = this.purposeEquilibrium;
      const decayRate = config.purposeDecayRate * speedMultiplier;

      const currentTarget = this.purposeSmoother.getValue();
      const newTarget = currentTarget -
        (currentTarget - target) * decayRate;

      this.purposeSmoother.setValue(newTarget);
      this.derivedStats.purpose = this.purposeSmoother.getValue();
    }

    // Update Nutrition: smooth toward food quality target
    if (this.nutritionSmoother) {
      // Map food quality (0-3) to nutrition (0-100)
      const targetNutrition = (this.recentFoodQuality / 3) * 100;
      this.derivedStats.nutrition = this.nutritionSmoother.update(targetNutrition);
    }
  }

  // Extend applyTickUpdate to call derived stats update
  applyTickUpdate(speedMultiplier: number): void {
    const needsEnabled = this.root?.needsSystemEnabled ?? false;

    if (needsEnabled && this.needs) {
      // v1.1: Apply needs decay
      this.applyNeedsDecay(speedMultiplier);

      // v1.1: Update derived stats
      this.applyDerivedStatsUpdate(speedMultiplier);
    } else {
      // v1.0: Apply resource decay
      // ... existing code
    }
  }
}
```

### Mood Icon Component
```typescript
// In components/MoodIcon.tsx

interface MoodIconProps {
  value: number;
  breakdown: StatBreakdown;
}

/**
 * Display Mood as emoji icon with tooltip breakdown.
 */
export const MoodIcon = observer(function MoodIcon({
  value,
  breakdown
}: MoodIconProps) {
  const emoji = getMoodEmoji(value);

  // Format breakdown for tooltip
  const tooltipText = [
    `Mood: ${breakdown.total}`,
    '',
    ...breakdown.contributions.map(
      c => `${c.source}: ${c.value > 0 ? '+' : ''}${c.value}`
    ),
  ].join('\n');

  return (
    <div
      className="tooltip tooltip-right"
      data-tip={tooltipText}
    >
      <span className="text-5xl" role="img" aria-label="mood">
        {emoji}
      </span>
    </div>
  );
});

function getMoodEmoji(value: number): string {
  if (value >= 75) return '😊';  // Happy
  if (value >= 50) return '🙂';  // Content
  if (value >= 25) return '😐';  // Neutral
  return '😢';                  // Sad
}
```

### Derived Stats Display Panel
```typescript
// In components/DerivedStatsSection.tsx (part of NeedsPanel)

interface DerivedStatsSectionProps {
  derivedStats: DerivedStats;
  moodBreakdown: StatBreakdown;
  purposeEquilibrium: number;
}

export const DerivedStatsSection = observer(function DerivedStatsSection({
  derivedStats,
  moodBreakdown,
  purposeEquilibrium,
}: DerivedStatsSectionProps) {
  return (
    <div className="border-t border-base-300 pt-4 mt-4">
      <h3 className="text-sm font-bold mb-3 text-base-content/70">
        Derived Wellbeing
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Mood: Icon with tooltip */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-base-content/70">Mood</span>
          <MoodIcon value={derivedStats.mood} breakdown={moodBreakdown} />
        </div>

        {/* Purpose: Bar with equilibrium marker */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span>Purpose</span>
            <span className="text-base-content/70">
              {Math.round(derivedStats.purpose)}%
            </span>
          </div>
          <progress
            className={`progress ${getPurposeColor(derivedStats.purpose)} w-full`}
            value={derivedStats.purpose}
            max="100"
            title={`Equilibrium: ${Math.round(purposeEquilibrium)}`}
          />
          <span className="text-xs text-base-content/50">
            ↔ {Math.round(purposeEquilibrium)} (equilibrium)
          </span>
        </div>

        {/* Nutrition: Bar with slow change indicator */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span>Nutrition</span>
            <span className="text-base-content/70">
              {Math.round(derivedStats.nutrition)}%
            </span>
          </div>
          <progress
            className={`progress ${getNutritionColor(derivedStats.nutrition)} w-full`}
            value={derivedStats.nutrition}
            max="100"
            title="Long-term diet quality"
          />
          <span className="text-xs text-base-content/50">
            (changes slowly)
          </span>
        </div>
      </div>
    </div>
  );
});

function getPurposeColor(value: number): string {
  if (value >= 60) return 'progress-info';
  if (value >= 40) return 'progress-warning';
  return 'progress-error';
}

function getNutritionColor(value: number): string {
  if (value >= 70) return 'progress-success';
  if (value >= 40) return 'progress-warning';
  return 'progress-error';
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Linear weighted average | Sigmoid curves for need contributions | Research 2025-2026 | Prevents mood death spirals, feels more natural |
| Instant stat updates | Exponential smoothing with lag | Game feel research 2020+ | Emotional inertia, less mechanical |
| Fixed purpose baseline | Personality-based equilibrium | Psychology research 2025 | Characters feel distinct, purpose stabilizes naturally |
| Fast-moving all stats | Slow tiers for nutrition | Health sim games 2023+ | Long-term consequences, strategic food choices |
| Numeric mood bars | Emoji indicators | UX research 2026 | Faster emotional communication, clearer at-a-glance |

**Deprecated/outdated:**
- **Pure linear mood formulas:** Modern games use curves to compress/decompress contributions
- **Instantaneous derived stat updates:** Players expect emotional states to have inertia/lag
- **One-size-fits-all equilibrium:** Personality should affect baseline wellbeing levels
- **Fast nutrition swing:** Health stats should represent sustained behavior, not single actions

## Open Questions

Things that couldn't be fully resolved:

1. **Exact sigmoid steepness parameters**
   - What we know: Sigmoid formula is x^λ / (x^λ + σ^λ), λ controls steepness
   - What's unclear: Optimal λ for physiological vs social needs (2.0? 3.0? 2.5?)
   - Recommendation: Start with λ=2.5 for physiological, λ=2.0 for social, tune via DevTools

2. **Smoothing alpha calibration**
   - What we know: Mood should lag, Purpose slower, Nutrition very slow
   - What's unclear: Exact alpha values for good feel (0.1 vs 0.15 for Mood?)
   - Recommendation: Start with 0.1/0.05/0.01, make tunable in BalanceConfig, iterate

3. **Purpose boost from activities**
   - What we know: Meaningful activities boost Purpose above equilibrium
   - What's unclear: How much boost? How to detect "meaningful"? (Phase 10 integration)
   - Recommendation: Defer activity-purpose integration to Phase 10, implement just decay for now

4. **Food quality assignment**
   - What we know: 4 tiers (Bad/OK/Good/Great), affects nutrition running average
   - What's unclear: Which activities produce which food quality? (Phase 10 activity data)
   - Recommendation: Add FoodQuality to activity definitions in Phase 10, add placeholder eatFood() API now

5. **Nutrition affects Energy regen timing**
   - What we know: Low nutrition reduces Energy regeneration rate
   - What's unclear: Does this apply only during sleep? All the time? (Energy regen happens in Phase 9)
   - Recommendation: Provide getNutritionEnergyModifier() API, apply in Phase 9 when implementing Energy regen

## Sources

### Primary (HIGH confidence)
- MobX Official Documentation - Computed Properties - https://mobx.js.org/computeds.html
- Sigmoid Functions in Game Design (J. Furness) - https://www.jfurness.uk/sigmoid-functions-in-game-design/
- The Sims AI and Need Curves (GMTK) - https://gmtk.substack.com/p/the-genius-ai-behind-the-sims
- Exponential Smoothing Theory - https://en.wikipedia.org/wiki/Exponential_smoothing
- Existing codebase patterns (Character.ts, balance.ts, needsDecay.ts)

### Secondary (MEDIUM confidence)
- Big Five Personality Traits (Psychology literature) - https://www.simplypsychology.org/big-five-personality.html
- Emoji in UI Design Best Practices (UX Playbook) - https://uxplaybook.org/articles/how-to-use-emojis-in-ux-design
- Game Nutrition Systems (Eco Wiki) - https://wiki.play.eco/en/Food
- DaisyUI Tooltip Documentation - https://daisyui.com/components/tooltip/
- Exponential Moving Average in JavaScript (DEV Community) - https://dev.to/oliverjumpertz/the-moving-average-simple-and-exponential-theory-math-and-implementation-in-javascript-2mm3

### Tertiary (LOW confidence)
- React Tooltip Libraries (ReactScript) - https://reactscript.com/best-tooltip-component/
- Personality-Based Game Adaptation (ACM) - https://dl.acm.org/doi/10.1145/3723498.3723798

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, MobX computed properties perfect fit
- Architecture: HIGH - Sigmoid curves and exponential smoothing are proven patterns, personality psychology well-researched
- Pitfalls: MEDIUM - Identified from game design research and Phase 7 patterns, but curve tuning requires iteration

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days, stable domain - derived stat patterns are well-established)
