import { makeAutoObservable } from 'mobx';
import type {
  ActivityData,
  SkillDomain,
  ResourceKey,
  CapacityKey,
  DurationMode,
} from './types';

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

  // Mutable mastery properties
  masteryLevel: number = 1; // 1-10
  masteryXP: number = 0;

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
    while (this.masteryLevel < 10 && this.masteryXP >= this.nextMasteryXPRequired) {
      this.masteryXP -= this.nextMasteryXPRequired;
      this.masteryLevel++;
    }
  }
}
