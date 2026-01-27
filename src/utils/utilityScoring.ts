/**
 * Utility scoring functions for the autonomous AI decision system.
 *
 * These pure functions compute utility scores for activity selection based on:
 * - Need urgency: How badly the patient's needs require this activity
 * - Personality fit: How well the activity aligns with personality traits
 * - Resource availability: Whether the patient can afford the activity costs
 * - Willpower-difficulty match: Whether willpower comfortably exceeds difficulty
 * - Mood delta: Projected mood improvement from completing the activity
 *
 * All scoring functions return values on a 0-100 scale (except scoreInCriticalMode).
 */

import type { Activity } from '../entities/Activity';
import type { Character } from '../entities/Character';
import type { NeedKey } from '../entities/types';
import type { UtilityFactors, UtilityWeights } from '../types/autonomy';
import { needToMoodCurve } from './curves';
import { calculatePersonalityAlignment } from './personalityFit';

/**
 * Check if the character should override normal decision-making for critical needs.
 * Critical mode activates when any physiological need is below 15%.
 *
 * In critical mode, the AI prioritizes pure survival over personality fit,
 * resource optimization, or mood improvement.
 *
 * @param character - The character to check
 * @returns True if any of hunger/bladder/energy is below 15
 */
export function shouldOverrideToCriticalMode(character: Character): boolean {
  const { hunger, bladder, energy } = character.needs;
  return hunger < 15 || bladder < 15 || energy < 15;
}

/**
 * Calculate need urgency score for an activity.
 * High urgency when the activity restores needs that are currently low.
 * Negative urgency (penalty) when needs are already satisfied.
 *
 * Uses inverted sigmoid curve from needToMoodCurve:
 * - Low need value -> high urgency (need is desperate)
 * - Medium need value -> moderate urgency
 * - High need value (>80%) -> negative urgency (satiation penalty)
 *
 * The satiation penalty prevents the AI from selecting activities
 * for needs that are already satisfied (e.g., eating when full).
 *
 * @param activity - The activity being scored
 * @param character - The character considering the activity
 * @returns Urgency score (-50 to 100, higher = more urgent, negative = satiated)
 */
export function calculateNeedUrgency(
  activity: Activity,
  character: Character
): number {
  // No need effects = no urgency from needs
  if (!activity.needEffects) {
    return 0;
  }

  const needKeys = Object.keys(activity.needEffects) as Array<NeedKey>;
  if (needKeys.length === 0) {
    return 0;
  }

  let totalUrgency = 0;
  let totalWeight = 0;

  for (const needKey of needKeys) {
    const restoration = activity.needEffects[needKey] ?? 0;
    if (restoration <= 0) continue; // Only positive restoration contributes

    const currentValue = character.needs[needKey];

    // Weight by restoration amount (assume max restore ~10)
    const weight = Math.min(1, restoration / 10);

    // Satiation penalty: when need > 80%, apply negative urgency
    // This discourages activities for already-satisfied needs
    if (currentValue > 80) {
      // Linear penalty: 80% -> 0, 90% -> -25, 100% -> -50
      const satiationPenalty = -((currentValue - 80) / 20) * 50;
      totalUrgency += satiationPenalty * weight;
      totalWeight += weight;
      continue;
    }

    // Normal urgency calculation for needs <= 80%
    // Inverted sigmoid: high urgency when need is low
    // needToMoodCurve returns negative for low needs, positive for high needs
    // We want the opposite: high score for low needs
    const moodContribution = needToMoodCurve(currentValue, 1.0, 2.5);
    const urgency = 50 - moodContribution;

    totalUrgency += urgency * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  // Average urgency across all affected needs
  // Can be negative for satiated needs (no clamping to preserve penalty)
  return totalUrgency / totalWeight;
}

/**
 * Calculate resource availability score for an activity.
 * Penalizes activities the character can barely afford,
 * but caps at neutral (50) when comfortable.
 *
 * This prevents cheap activities from getting a bonus just for being cheap.
 * Resource availability answers "can I afford this?" not "should I do this?"
 *
 * Scoring:
 * - Ratio < 1.0 (can't afford): 0-30 (penalty)
 * - Ratio 1.0-2.0 (tight budget): 30-50 (slight penalty to neutral)
 * - Ratio > 2.0 (comfortable): 50 (neutral, no bonus)
 *
 * @param activity - The activity being scored
 * @param character - The character considering the activity
 * @returns Availability score (0-50, higher = more affordable, capped at neutral)
 */
export function calculateResourceAvailability(
  activity: Activity,
  character: Character
): number {
  const costs = activity.getResourceCosts(character);

  // Calculate ratio for each resource: current / max(1, cost)
  const overskuddRatio =
    character.actionResources.overskudd / Math.max(1, costs.overskudd);
  const willpowerRatio =
    character.actionResources.willpower / Math.max(1, costs.willpower);
  const focusRatio =
    costs.focus > 0 ? character.actionResources.focus / costs.focus : 1.0;
  const socialRatio =
    costs.socialBattery > 0
      ? character.actionResources.socialBattery / costs.socialBattery
      : 1.0;

  // Use minimum ratio (bottleneck resource determines affordability)
  const minRatio = Math.min(
    overskuddRatio,
    willpowerRatio,
    focusRatio,
    socialRatio
  );

  // Convert ratio to score with cap at 50 (neutral)
  // ratio < 1.0: can't comfortably afford, score 0-30
  // ratio 1.0-2.0: tight budget, score 30-50
  // ratio >= 2.0: comfortable, score 50 (neutral, no bonus)
  if (minRatio < 1.0) {
    // Can't afford: linear scale 0-30
    return minRatio * 30;
  } else if (minRatio < 2.0) {
    // Tight budget: linear scale 30-50
    return 30 + (minRatio - 1.0) * 20;
  } else {
    // Comfortable: cap at neutral
    return 50;
  }
}

/**
 * Calculate personality fit score for an activity.
 * Uses the calculatePersonalityAlignment utility to get gain multiplier,
 * then converts to 0-100 scale.
 *
 * Gain multiplier range: 0.6-1.4
 * Converted to: (multiplier - 0.6) / 0.8 * 100
 *
 * @param activity - The activity being scored
 * @param character - The character considering the activity
 * @returns Personality fit score (0-100, higher = better fit)
 */
export function calculatePersonalityFitScore(
  activity: Activity,
  character: Character
): number {
  const alignment = calculatePersonalityAlignment(
    activity.tags,
    character.personality
  );

  // gainMultiplier is 0.6-1.4 range
  // Convert to 0-100: (gainMultiplier - 0.6) / 0.8 * 100
  const normalized = (alignment.gainMultiplier - 0.6) / 0.8;
  return Math.max(0, Math.min(100, normalized * 100));
}

/**
 * Calculate difficulty comfort score.
 * Penalizes activities that are too hard, but caps at neutral for easy activities.
 *
 * This prevents easy activities from getting a bonus just for being easy.
 * Difficulty match answers "can I handle this?" not "should I do easy things?"
 *
 * Uses EFFECTIVE difficulty (after skill/mastery reductions):
 * - Difficulty 0-2: 50 (easy/moderate, neutral - no bonus)
 * - Difficulty 2-3: 30-50 (challenging, slight penalty)
 * - Difficulty 3-4: 15-30 (hard, significant penalty)
 * - Difficulty 4-5: 0-15 (very hard, strong penalty)
 *
 * Skills reduce effective difficulty, making hard activities more accessible
 * for trained characters.
 *
 * @param activity - The activity being scored
 * @param character - The character considering the activity
 * @returns Difficulty comfort score (0-50, higher = more comfortable, capped at neutral)
 */
export function calculateWillpowerDifficultyMatch(
  activity: Activity,
  character: Character
): number {
  // Use effective difficulty (reduced by skills and mastery)
  const effectiveDifficulty = activity.getEffectiveDifficulty(character);

  // Penalty curve for difficulty, capped at 50 (neutral) for easy activities
  // Easy activities don't get a bonus, hard activities get penalized
  if (effectiveDifficulty <= 2) {
    // Easy to moderate: cap at neutral
    return 50;
  } else if (effectiveDifficulty <= 3) {
    // Challenging: linear scale 50->30
    return 50 - (effectiveDifficulty - 2) * 20;
  } else if (effectiveDifficulty <= 4) {
    // Hard: linear scale 30->15
    return 30 - (effectiveDifficulty - 3) * 15;
  } else {
    // Very hard: linear scale 15->0
    return Math.max(0, 15 - (effectiveDifficulty - 4) * 15);
  }
}

/**
 * Calculate projected mood delta from an activity.
 * Estimates how much the activity would improve mood based on need restoration.
 *
 * For each need affected:
 * - Calculate current mood contribution
 * - Calculate projected mood contribution after restoration
 * - Sum the deltas
 *
 * Normalized to 0-100 scale where 100 = maximum possible mood improvement.
 *
 * @param activity - The activity being scored
 * @param character - The character considering the activity
 * @returns Mood delta score (0-100, higher = bigger mood improvement)
 */
export function calculateMoodDelta(
  activity: Activity,
  character: Character
): number {
  // No need effects = no mood impact
  if (!activity.needEffects) {
    return 0;
  }

  const needKeys = Object.keys(activity.needEffects) as Array<NeedKey>;
  if (needKeys.length === 0) {
    return 0;
  }

  let totalMoodDelta = 0;

  for (const needKey of needKeys) {
    const restoration = activity.needEffects[needKey] ?? 0;
    if (restoration <= 0) continue;

    const currentValue = character.needs[needKey];
    const projectedValue = Math.min(100, currentValue + restoration);

    // Calculate mood contribution before and after
    const moodBefore = needToMoodCurve(currentValue, 1.0, 2.5);
    const moodAfter = needToMoodCurve(projectedValue, 1.0, 2.5);

    totalMoodDelta += moodAfter - moodBefore;
  }

  // Normalize to 0-100 scale
  // Max possible mood improvement is roughly 100 points (from all needs at 0 to all at 100)
  // Scale the actual delta to this range
  const normalizedDelta = Math.max(0, Math.min(100, totalMoodDelta * 2));
  return normalizedDelta;
}

/**
 * Calculate pure urgency score for critical mode.
 * Ignores personality, willpower match, and mood delta.
 * Only considers how much the activity helps critical needs.
 *
 * This is NOT normalized to 0-100 - higher is always better.
 * Used for survival-focused decision making when needs are critical.
 *
 * @param activity - The activity being scored
 * @param character - The character in critical mode
 * @returns Raw urgency score (not normalized, higher = better)
 */
export function scoreInCriticalMode(
  activity: Activity,
  character: Character
): number {
  if (!activity.needEffects) {
    return 0;
  }

  let urgencyScore = 0;

  // Only score for critical needs (hunger, bladder, energy below 15)
  const criticalNeeds: Array<NeedKey> = ['hunger', 'bladder', 'energy'];

  for (const needKey of criticalNeeds) {
    const currentValue = character.needs[needKey];
    const restoration = activity.needEffects[needKey] ?? 0;

    // Only score if need is critical (below 15) and activity restores it
    if (currentValue < 15 && restoration > 0) {
      // Higher score when:
      // - Restoration is higher
      // - Need is lower (more critical)
      urgencyScore += restoration * (15 - currentValue);
    }
  }

  return urgencyScore;
}

/**
 * Calculate the full utility score for an activity.
 * Combines all 5 factors with configurable weights.
 *
 * If isCurrentActivity is true, applies 25% hysteresis bonus to prevent
 * constant activity switching when scores are close.
 *
 * @param activity - The activity being scored
 * @param character - The character considering the activity
 * @param weights - Weights for each factor (must sum to 1.0)
 * @param isCurrentActivity - True if this is the character's current activity
 * @returns Object with final score and factor breakdown
 */
export function calculateUtilityScore(
  activity: Activity,
  character: Character,
  weights: UtilityWeights,
  isCurrentActivity: boolean
): { score: number; factors: UtilityFactors } {
  // Calculate all 5 factors
  const needUrgency = calculateNeedUrgency(activity, character);
  const personalityFit = calculatePersonalityFitScore(activity, character);
  const resourceAvailability = calculateResourceAvailability(
    activity,
    character
  );
  const willpowerMatch = calculateWillpowerDifficultyMatch(activity, character);
  const moodDelta = calculateMoodDelta(activity, character);

  // Compute weighted sum
  let score =
    needUrgency * weights.need +
    personalityFit * weights.personality +
    resourceAvailability * weights.resource +
    willpowerMatch * weights.willpower +
    moodDelta * weights.mood;

  // Apply hysteresis bonus for current activity
  if (isCurrentActivity) {
    score *= 1.25;
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    factors: {
      needUrgency,
      personalityFit,
      resourceAvailability,
      willpowerMatch,
      moodDelta,
    },
  };
}
