// Big Five personality dimensions
export interface Personality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// Mental capacities that affect activity success
export interface Capacities {
  divergentThinking: number;
  convergentThinking: number;
  workingMemory: number;
  attentionSpan: number;
  processingSpeed: number;
  emotionalRegulation: number;
}

// Resources that drain and recover (9 total per CONTEXT.md)
export interface Resources {
  // Core vitality
  energy: number;
  socialBattery: number;
  stress: number; // 0 = good (low stress), 100 = bad (high stress)

  // Mental state
  overskudd: number; // Norwegian: surplus/capacity/headroom
  mood: number;
  motivation: number;

  // Stability & function
  security: number;
  focus: number; // Focus/Attention
  nutrition: number; // Nutrition/Health
}

// Type-safe resource key access
export type ResourceKey = keyof Resources;

// ============================================================================
// Primary Needs System Types (v1.1)
// ============================================================================

/**
 * Primary needs that drive character wellbeing.
 * 7 needs on 0-100 scale where higher = better satisfied.
 * Split into physiological (fast decay) and social (slow decay) categories.
 */
export interface Needs {
  // Physiological needs (decay 3-4x faster)
  hunger: number;    // Food satisfaction
  energy: number;    // Rest/sleep satisfaction
  hygiene: number;   // Cleanliness satisfaction
  bladder: number;   // Bathroom need satisfaction

  // Social/psychological needs (slower decay)
  social: number;    // Connection need satisfaction
  fun: number;       // Entertainment/pleasure satisfaction
  security: number;  // Safety/stability satisfaction
}

// Type-safe need key access
export type NeedKey = keyof Needs;

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
export interface CharacterData {
  id: string;
  name: string;
  personality: Personality;
  capacities: Capacities;
  resources: Resources;
}

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

export function defaultResources(): Resources {
  return {
    // Full = best
    energy: 100,
    socialBattery: 100,
    focus: 100,
    nutrition: 100,
    overskudd: 100,

    // Low = best (inverted)
    stress: 0,

    // Neutral = average starting point
    mood: 50,
    motivation: 50,
    security: 50,
  } satisfies Resources;
}

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
export interface SkillData {
  id: string;
  name: string;
  description: string;
  domain: SkillDomain;
  prerequisites: string[]; // skill IDs that must be level >= 1
}

// Prerequisite status for "why locked" display
export interface PrerequisiteStatus {
  skillId: string;
  name: string;
  required: number; // always 1 for now
  current: number; // current level
  met: boolean;
}

// ============================================================================
// Activity System Types
// ============================================================================

// Type-safe capacity key access
export type CapacityKey = keyof Capacities;

// Duration mode discriminated union
export type DurationMode =
  | { type: 'fixed'; ticks: number } // fixed duration activities (eating)
  | { type: 'threshold'; resource: ResourceKey; target: number } // until resource reaches target (sleeping until energy >= 80)
  | { type: 'variable'; baseTicks: number }; // affected by mastery

// Activity execution state
export type ActivityState = 'queued' | 'starting' | 'active' | 'completed' | 'failed';

// Data required to construct an Activity
export interface ActivityData {
  id: string;
  name: string;
  description: string;
  domain: SkillDomain;
  durationMode: DurationMode;
  resourceEffects: Partial<Record<ResourceKey, number>>; // negative = drain, positive = restore
  capacityProfile: Partial<Record<CapacityKey, number>>; // target capacity values for success calculation
  baseXPRate: number; // domain XP per tick
  startRequirements?: {
    minOverskudd?: number;
    minEnergy?: number;
  };
}

// ============================================================================
// Talent System Types
// ============================================================================

// Talent rarity tiers (affects spawn weight)
export type TalentRarity = 'common' | 'rare' | 'epic';

// Modifier effect types
export type ModifierType = 'flat' | 'percentage' | 'conditional';

// Modifier effect definition
export interface ModifierEffect {
  type: ModifierType;
  target: 'capacity' | 'resource' | 'skill' | 'activity';
  targetKey: string; // capacity name, resource name, etc.
  value: number; // +10 flat, or 0.15 for 15%
  condition?: {
    type: 'resource_threshold' | 'activity_type' | 'domain';
    check: string; // e.g., "energy < 30", "domain === 'physical'"
  };
  description: string; // For UI display
}

// Data required to construct a Talent
export interface TalentData {
  id: string;
  name: string;
  description: string;
  rarity: TalentRarity;
  domain: SkillDomain | null; // null = universal talent
  effects: ModifierEffect[];
}
