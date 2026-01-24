/**
 * Skill requirement definition for activities.
 * Specifies how much a skill contributes to difficulty reduction.
 */
export type SkillRequirement = {
  /** ID of the skill that affects this activity */
  skillId: string;
  /** Weight of this skill in difficulty calculation (0-1, higher = more important) */
  weight: number;
  /** Maximum stars of difficulty this skill can reduce (typically 0.5-2.0) */
  maxReduction: number;
};

/**
 * Skill detail entry for difficulty breakdown tooltips.
 */
export type SkillDetail = {
  /** Skill ID */
  skillId: string;
  /** Skill name for display */
  skillName: string;
  /** Character's current level in this skill */
  level: number;
  /** Stars of difficulty reduced by this skill */
  reduction: number;
};

/**
 * Difficulty breakdown for UI tooltip display.
 * Shows how base difficulty is modified by skills and mastery.
 */
export type DifficultyBreakdown = {
  /** Base difficulty before any reductions (1-5 stars) */
  base: number;
  /** Effective difficulty after all reductions (1-5 stars) */
  effective: number;
  /** Total difficulty reduction from all skills (stars) */
  skillReduction: number;
  /** Difficulty reduction from activity mastery (stars) */
  masteryReduction: number;
  /** Per-skill contributions to difficulty reduction */
  skillDetails: Array<SkillDetail>;
};

/**
 * Configuration for difficulty calculation tuning.
 * Controls how skills and mastery reduce activity difficulty.
 */
export type DifficultyConfig = {
  /** Maximum total difficulty reduction from all skills combined (stars, default 1.5) */
  maxSkillReduction: number;
  /** Maximum difficulty reduction from activity mastery (stars, default 1.0) */
  maxMasteryReduction: number;
  /** Diminishing returns curve type for skill levels (default 'sqrt') */
  skillDiminishingReturns: 'sqrt' | 'linear';
};
