// Big Five personality dimensions
export type Personality = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

// Mental capacities that affect activity success
export type Capacities = {
  divergentThinking: number;
  convergentThinking: number;
  workingMemory: number;
  attentionSpan: number;
  processingSpeed: number;
  emotionalRegulation: number;
};

// ============================================================================
// Primary Needs System Types (v1.1)
// ============================================================================

/**
 * Primary needs that drive character wellbeing.
 * 7 needs on 0-100 scale where higher = better satisfied.
 * Split into physiological (fast decay) and social (slow decay) categories.
 */
export type Needs = {
  // Physiological needs (decay 3-4x faster)
  hunger: number; // Food satisfaction
  energy: number; // Rest/sleep satisfaction
  hygiene: number; // Cleanliness satisfaction
  bladder: number; // Bathroom need satisfaction

  // Social/psychological needs (slower decay)
  social: number; // Connection need satisfaction
  fun: number; // Entertainment/pleasure satisfaction
  security: number; // Safety/stability satisfaction
};

// Type-safe need key access
export type NeedKey = keyof Needs;

// ============================================================================
// Derived Wellbeing System Types (v1.1)
// ============================================================================

/**
 * Derived stats computed from primary needs and other factors.
 * These are second-order values that emerge from need satisfaction,
 * activity-personality fit, and dietary habits.
 */
export type DerivedStats = {
  /** Mood: 0-100, computed from weighted average of need satisfaction */
  mood: number;
  /** Purpose: 0-100, personality equilibrium system based on activity fit */
  purpose: number;
  /** Nutrition: 0-100, slow-moving stat based on food quality over time */
  nutrition: number;
};

/**
 * Food quality levels for nutrition tracking.
 * Higher quality food contributes more to the nutrition stat.
 */
export const FoodQuality = {
  Bad: 0, // Junk food, fast food
  OK: 1, // Basic meals, convenience food
  Good: 2, // Balanced nutrition, home cooking
  Great: 3, // Premium healthy food, fresh ingredients
} as const;

export type FoodQuality = (typeof FoodQuality)[keyof typeof FoodQuality];

/**
 * Breakdown of a stat value for UI tooltip display.
 * Shows the total and individual contributions from various sources.
 */
export type StatBreakdown = {
  /** The final displayed value */
  total: number;
  /** Individual contributions that sum to (approximately) the total */
  contributions: Array<{ source: string; value: number }>;
};

/**
 * Factory function for default starting derived stats.
 * Values chosen to provide neutral starting point:
 * - Mood: 50 (neutral, will adjust based on needs)
 * - Purpose: 50 (neutral, will adjust to personality equilibrium)
 * - Nutrition: 70 (decent starting diet, room to improve or decline)
 */
export function defaultDerivedStats(): DerivedStats {
  return {
    mood: 50,
    purpose: 50,
    nutrition: 70,
  };
}

// ============================================================================
// Action Resources System Types (v1.1)
// ============================================================================

/**
 * Action resources that gate activities and autonomous decisions.
 * 4 resources on 0-100 scale computed from needs, personality, and wellbeing.
 */
export type ActionResources = {
  /** Overskudd: Surplus capacity computed from Mood + Energy + Purpose */
  overskudd: number;
  /** socialBattery: Charge/drain inverted by Extraversion personality */
  socialBattery: number;
  /** Focus: Depleted by concentration activities */
  focus: number;
  /** Willpower: Depleted by difficult tasks, boosted by Fun */
  willpower: number;
};

/**
 * Social context levels for socialBattery drain/charge calculation.
 * 0 = Solo (alone, no social interaction)
 * 1 = Social (casual social contact)
 * 2 = Intense (active/demanding social interaction)
 */
export type SocialContext = 0 | 1 | 2;

/**
 * Factory function for default starting action resources.
 * Values chosen to start moderate, allowing adjustment to computed targets:
 * - Overskudd: 70 (moderate, will adjust to Mood+Energy+Purpose)
 * - socialBattery: 70 (moderate start)
 * - Focus: 100 (start full)
 * - Willpower: 80 (start high)
 */
export function defaultActionResources(): ActionResources {
  return {
    overskudd: 70,
    socialBattery: 70,
    focus: 100,
    willpower: 80,
  };
}

/**
 * Factory function for default starting needs.
 * Values chosen to give player time to establish routines:
 * - Physiological: start high (recently satisfied)
 * - Social/psychological: start moderate (room to grow)
 */
export function defaultNeeds(): Needs {
  return {
    // Physiological - start well-satisfied
    hunger: 80,
    energy: 100,
    hygiene: 100,
    bladder: 100,

    // Social/psychological - start moderate
    social: 70,
    fun: 60,
    security: 50,
  };
}

// Data required to construct a Character
export type CharacterData = {
  id: string;
  name: string;
  personality: Personality;
  capacities: Capacities;
  needs?: Needs; // Optional for backward compatibility with saved data
};

// Factory functions - always return valid defaults (0-100 scale, 50 = average)
export function defaultPersonality(): Personality {
  return {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };
}

export function defaultCapacities(): Capacities {
  return {
    divergentThinking: 50,
    convergentThinking: 50,
    workingMemory: 50,
    attentionSpan: 50,
    processingSpeed: 50,
    emotionalRegulation: 50,
  };
}

// Import difficulty types (Phase 9.1)
import type { SkillRequirement } from '../types/difficulty';

// Skill domain categories
export type SkillDomain =
  | 'social'
  | 'organisational'
  | 'analytical'
  | 'physical'
  | 'creative';

// Skill state for UI display
export type SkillState = 'locked' | 'unlockable' | 'unlocked' | 'mastered';

// Data required to construct a Skill
export type SkillData = {
  id: string;
  name: string;
  description: string;
  domain: SkillDomain;
  prerequisites: Array<string>; // skill IDs that must be level >= 1
};

// Prerequisite status for "why locked" display
export type PrerequisiteStatus = {
  skillId: string;
  name: string;
  required: number; // always 1 for now
  current: number; // current level
  met: boolean;
};

// ============================================================================
// Activity System Types
// ============================================================================

// Type-safe capacity key access
export type CapacityKey = keyof Capacities;

// Duration mode discriminated union
export type DurationMode =
  | { type: 'fixed'; ticks: number } // fixed duration activities (eating)
  | { type: 'needThreshold'; need: NeedKey; target: number } // until need reaches target (resting until needs.energy >= 80)
  | { type: 'variable'; baseTicks: number }; // affected by mastery

// Activity execution state
export type ActivityState =
  | 'queued'
  | 'starting'
  | 'active'
  | 'completed'
  | 'failed';

// Data required to construct an Activity
export type ActivityData = {
  id: string;
  name: string;
  description: string;
  domain: SkillDomain;
  durationMode: DurationMode;
  capacityProfile: Partial<Record<CapacityKey, number>>; // target capacity values for success calculation
  baseXPRate: number; // domain XP per tick
  startRequirements?: {
    minOverskudd?: number;
    minEnergy?: number;
  };
  // Difficulty system (Phase 9.1) - optional for backward compatibility
  baseDifficulty?: number; // 1-5 stars (default 3)
  skillRequirements?: Array<SkillRequirement>; // Skills that reduce difficulty
  // Personality alignment system (Phase 10) - optional
  tags?: Array<string>; // Personality alignment tags: 'social', 'solo', 'routine', 'creative', 'cooperative', 'stressful', 'concentration'
  /**
   * Need restoration effects applied gradually during activity execution (not on completion).
   * Positive values restore needs (e.g., hunger: 5 restores 5 hunger per tick).
   * Can affect multiple needs simultaneously.
   */
  needEffects?: Partial<Record<NeedKey, number>>;
};

// ============================================================================
// Talent System Types
// ============================================================================

// Talent rarity tiers (affects spawn weight)
export type TalentRarity = 'common' | 'rare' | 'epic';

// Modifier effect types
export type ModifierType = 'flat' | 'percentage' | 'conditional';

// Modifier effect definition
export type ModifierEffect = {
  type: ModifierType;
  target: 'capacity' | 'resource' | 'skill' | 'activity';
  targetKey: string; // capacity name, resource name, etc.
  value: number; // +10 flat, or 0.15 for 15%
  condition?: {
    type: 'resource_threshold' | 'activity_type' | 'domain';
    check: string; // e.g., "energy < 30", "domain === 'physical'"
  };
  description: string; // For UI display
};

// Data required to construct a Talent
export type TalentData = {
  id: string;
  name: string;
  description: string;
  rarity: TalentRarity;
  domain: SkillDomain | null; // null = universal talent
  effects: Array<ModifierEffect>;
};
