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
