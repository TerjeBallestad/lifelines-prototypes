/**
 * Types for the autonomous AI decision-making system.
 *
 * The AI uses utility scoring to select activities for the patient based on:
 * - Current need urgency (how badly needs require attention)
 * - Personality fit (activity-personality alignment)
 * - Resource availability (can afford the activity costs)
 * - Willpower-difficulty match (comfortable margin over difficulty)
 * - Mood delta (projected mood improvement from activity)
 */

/**
 * Utility factors that contribute to activity scoring.
 * All factors are normalized to 0-100 scale where higher is better.
 */
export type UtilityFactors = {
  /** How badly needs require this activity (0-100, high = urgent need) */
  needUrgency: number;
  /** Activity-personality alignment score (0-100, high = good fit) */
  personalityFit: number;
  /** Can afford the activity costs (0-100, high = plenty of resources) */
  resourceAvailability: number;
  /** Willpower comfortably exceeds difficulty (0-100, high = easy match) */
  willpowerMatch: number;
  /** Projected mood improvement from activity (0-100, high = big boost) */
  moodDelta: number;
};

/**
 * Weights for utility scoring factors.
 * Must sum to 1.0 for normalized output.
 */
export type UtilityWeights = {
  /** Weight for need urgency factor (default 0.30) */
  need: number;
  /** Weight for personality fit factor (default 0.20) */
  personality: number;
  /** Weight for resource availability factor (default 0.15) */
  resource: number;
  /** Weight for willpower-difficulty match factor (default 0.15) */
  willpower: number;
  /** Weight for mood delta factor (default 0.20) */
  mood: number;
};

/**
 * Default utility weights balancing all 5 factors.
 * Sum = 0.30 + 0.20 + 0.15 + 0.15 + 0.20 = 1.0
 *
 * - Need urgency (30%): Highest priority - critical needs must be addressed
 * - Personality fit (20%): Aligned activities are more sustainable
 * - Mood delta (20%): Activities that improve mood are valuable
 * - Resource availability (15%): Must be able to afford the activity
 * - Willpower match (15%): Comfortable margin prevents burnout
 */
export const DEFAULT_UTILITY_WEIGHTS: UtilityWeights = {
  need: 0.3,
  personality: 0.2,
  resource: 0.15,
  willpower: 0.15,
  mood: 0.2,
};

/**
 * Record of an AI decision for activity selection.
 * Used for debugging, player insight, and learning what the AI is thinking.
 */
export type AIDecision = {
  /** Unix timestamp of when decision was made */
  timestamp: number;
  /** Selected activity ID */
  activityId: string;
  /** Selected activity name for display */
  activityName: string;
  /** Human-readable reason for selection (e.g., "Eating because Hunger critical (12%)") */
  topReason: string;
  /** Final utility score (0-100) */
  score: number;
  /** Breakdown of all 5 utility factors */
  breakdown: UtilityFactors;
  /** Top alternatives that were considered but not selected */
  topAlternatives: Array<{
    activityId: string;
    activityName: string;
    score: number;
  }>;
  /** True if decision was made in critical mode (survival override) */
  criticalMode: boolean;
};

/**
 * Log of recent AI decisions (last 5).
 * Used for UI display and debugging AI behavior patterns.
 */
export type DecisionLog = Array<AIDecision>;
