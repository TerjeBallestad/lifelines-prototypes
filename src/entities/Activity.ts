import { makeAutoObservable } from 'mobx';
import type {
  ActivityData,
  SkillDomain,
  ResourceKey,
  CapacityKey,
  DurationMode,
} from './types';
import type { SkillRequirement, DifficultyBreakdown } from '../types/difficulty';
import type { Character } from './Character';

/**
 * Activity entity - represents an activity that a character can perform.
 * Uses class-based pattern to mirror Character/Skill structure.
 * All properties are observable, all methods are actions.
 */
export class Activity {
  // Readonly static properties from ActivityData
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly domain: SkillDomain;
  readonly durationMode: DurationMode;
  readonly resourceEffects: Partial<Record<ResourceKey, number>>;
  readonly capacityProfile: Partial<Record<CapacityKey, number>>;
  readonly baseXPRate: number;
  readonly startRequirements?: {
    minOverskudd?: number;
    minEnergy?: number;
  };

  // Difficulty system (Phase 9.1)
  readonly baseDifficulty: number; // 1-5 stars
  readonly skillRequirements: SkillRequirement[];

  // Mutable mastery properties
  masteryLevel = 1; // 1-10
  masteryXP = 0;

  constructor(data: ActivityData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.domain = data.domain;
    this.durationMode = data.durationMode;
    this.resourceEffects = data.resourceEffects;
    this.capacityProfile = data.capacityProfile;
    this.baseXPRate = data.baseXPRate;
    this.startRequirements = data.startRequirements;

    // Difficulty system (backward compatible defaults)
    this.baseDifficulty = data.baseDifficulty ?? 3;
    this.skillRequirements = data.skillRequirements ?? [];

    // Makes all properties observable and all methods actions
    makeAutoObservable(this);
  }

  /**
   * Computed: Mastery bonus for efficiency calculations.
   * 0% at level 1, up to 45% at level 10.
   */
  get masteryBonus(): number {
    return (this.masteryLevel - 1) * 0.05;
  }

  /**
   * Computed: Drain reduction from mastery.
   * 0% at level 1, up to 27% at level 10.
   */
  get masteryDrainReduction(): number {
    return (this.masteryLevel - 1) * 0.03;
  }

  /**
   * Computed: Speed bonus from mastery.
   * 0% at level 1, up to 18% at level 10.
   */
  get masterySpeedBonus(): number {
    return (this.masteryLevel - 1) * 0.02;
  }

  /**
   * Computed: Domain XP multiplier (diminishing returns).
   * 100% at level 1, down to 10% at level 10.
   * Encourages variety over grinding single activity.
   */
  get domainXPMultiplier(): number {
    return 1 - (this.masteryLevel - 1) * 0.1;
  }

  /**
   * Computed: XP required to reach next mastery level.
   * Formula: 100 * (level + 1)^1.5
   * Returns Infinity if already at max level (10).
   */
  get nextMasteryXPRequired(): number {
    if (this.masteryLevel >= 10) {
      return Infinity;
    }
    return Math.floor(100 * Math.pow(this.masteryLevel + 1, 1.5));
  }

  /**
   * Action: Add mastery XP and auto-level up if threshold reached.
   * Caps at level 10.
   */
  addMasteryXP(amount: number): void {
    this.masteryXP += amount;

    // Auto-level up while XP exceeds threshold (handles multiple levels at once)
    while (
      this.masteryLevel < 10 &&
      this.masteryXP >= this.nextMasteryXPRequired
    ) {
      this.masteryXP -= this.nextMasteryXPRequired;
      this.masteryLevel++;
    }
  }

  // ============================================================================
  // Difficulty Calculation (Phase 9.1)
  // ============================================================================

  /**
   * Calculate skill-based difficulty reduction for a character.
   * Uses square root diminishing returns to prevent min/maxing.
   *
   * @param character - Character attempting the activity
   * @returns Total difficulty reduction from skills (stars, capped at config.maxSkillReduction)
   */
  private calculateSkillReduction(character: Character): number {
    if (this.skillRequirements.length === 0) {
      return 0;
    }

    let totalWeightedReduction = 0;
    let totalWeight = 0;

    for (const req of this.skillRequirements) {
      // Get skill level from character (default 0 if skill not found)
      const skill = character.skills?.get(req.skillId);
      const skillLevel = skill?.level ?? 0;

      // Apply square root diminishing returns
      // Formula: sqrt(level / 5) * maxReduction * weight
      // At level 5: sqrt(1) = 1.0 (100% of maxReduction)
      // At level 10: sqrt(2) = 1.41 (141% of maxReduction, but capped)
      const normalizedLevel = skillLevel / 5;
      const sqrtFactor = Math.sqrt(normalizedLevel);
      const reduction = sqrtFactor * req.maxReduction * req.weight;

      totalWeightedReduction += reduction;
      totalWeight += req.weight;
    }

    // Normalize by total weight to get final reduction
    const skillReduction = totalWeight > 0 ? totalWeightedReduction / totalWeight : 0;

    // Cap at configured maximum (default 1.5 stars)
    // Note: We don't have access to root/config here, so we'll apply a hard cap
    // The config system can be integrated later if needed
    const maxSkillReduction = 1.5;
    return Math.min(skillReduction, maxSkillReduction);
  }

  /**
   * Calculate mastery-based difficulty reduction.
   * Uses square root diminishing returns.
   *
   * @returns Difficulty reduction from mastery (stars, capped at config.maxMasteryReduction)
   */
  private calculateMasteryReduction(): number {
    // Apply square root diminishing returns
    // Formula: sqrt((masteryLevel - 1) / 9) * maxMasteryReduction
    // At mastery 1: sqrt(0/9) = 0 (0% reduction)
    // At mastery 10: sqrt(9/9) = 1.0 (100% of maxMasteryReduction)
    const normalizedMastery = (this.masteryLevel - 1) / 9;
    const sqrtFactor = Math.sqrt(normalizedMastery);

    const maxMasteryReduction = 1.0;
    return sqrtFactor * maxMasteryReduction;
  }

  /**
   * Get effective difficulty for a character.
   * Applies skill and mastery reductions, clamped to 1-5 range.
   *
   * @param character - Character attempting the activity
   * @returns Effective difficulty (1-5 stars)
   */
  getEffectiveDifficulty(character: Character): number {
    const skillReduction = this.calculateSkillReduction(character);
    const masteryReduction = this.calculateMasteryReduction();

    const effectiveDifficulty =
      this.baseDifficulty - skillReduction - masteryReduction;

    // Clamp to 1-5 range
    return Math.max(1, Math.min(5, effectiveDifficulty));
  }

  /**
   * Get difficulty breakdown for tooltip display.
   * Shows how base difficulty is modified by skills and mastery.
   *
   * @param character - Character attempting the activity
   * @returns Full breakdown with per-skill details
   */
  getDifficultyBreakdown(character: Character): DifficultyBreakdown {
    const skillReduction = this.calculateSkillReduction(character);
    const masteryReduction = this.calculateMasteryReduction();
    const effectiveDifficulty = this.getEffectiveDifficulty(character);

    // Build per-skill details
    const skillDetails = this.skillRequirements.map((req) => {
      const skill = character.skills?.get(req.skillId);
      const skillLevel = skill?.level ?? 0;
      const skillName = skill?.name ?? 'Unknown Skill';

      // Calculate this skill's contribution
      const normalizedLevel = skillLevel / 5;
      const sqrtFactor = Math.sqrt(normalizedLevel);
      const reduction = sqrtFactor * req.maxReduction * req.weight;

      return {
        skillId: req.skillId,
        skillName,
        level: skillLevel,
        reduction: Math.round(reduction * 100) / 100, // Round to 2 decimals
      };
    });

    return {
      base: this.baseDifficulty,
      effective: Math.round(effectiveDifficulty * 100) / 100, // Round to 2 decimals
      skillReduction: Math.round(skillReduction * 100) / 100,
      masteryReduction: Math.round(masteryReduction * 100) / 100,
      skillDetails,
    };
  }
}
