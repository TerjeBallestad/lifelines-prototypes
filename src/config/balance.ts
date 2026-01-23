import { makeAutoObservable } from 'mobx';
import type { NeedKey } from '../entities/types';
import type { DifficultyConfig } from '../types/difficulty';

// ============================================================================
// Primary Needs Configuration (v1.1)
// ============================================================================

/**
 * Configuration for primary needs decay rates and thresholds.
 * Physiological needs decay 3-4x faster than social needs to create
 * urgency hierarchy - biological needs press harder than psychological ones.
 */
export interface NeedsConfig {
  // Physiological decay rates (faster: 0.7-1.0 range)
  hungerDecayRate: number;
  energyDecayRate: number;
  hygieneDecayRate: number;
  bladderDecayRate: number;

  // Social/psychological decay rates (slower: 0.15-0.3 range, ~3-4x slower)
  socialDecayRate: number;
  funDecayRate: number;
  securityDecayRate: number;

  // Personality modifier strength for needs (multiplier)
  personalityModifierNeeds: number;

  // Threshold for "critical" need state (triggers urgent behaviors)
  criticalThreshold: number;
}

export const DEFAULT_NEEDS_CONFIG: NeedsConfig = {
  // Physiological: decay 0.7-1.0 per tick (fast)
  hungerDecayRate: 0.8,
  energyDecayRate: 0.7,
  hygieneDecayRate: 0.5,
  bladderDecayRate: 1.0,

  // Social: decay 0.15-0.3 per tick (~3-4x slower)
  socialDecayRate: 0.25,
  funDecayRate: 0.2,
  securityDecayRate: 0.15,

  // Personality effects multiplier
  personalityModifierNeeds: 1.0,

  // Critical threshold (below this = urgent state)
  criticalThreshold: 20,
};

// ============================================================================
// Derived Stats Configuration (v1.1)
// ============================================================================

/**
 * Configuration for derived wellbeing stats (mood, purpose, nutrition).
 * Controls smoothing alphas, bounds, and weights for the derivation formulas.
 */
export interface DerivedStatsConfig {
  // Mood configuration
  /** Smoothing alpha for mood changes (0.1 = moderate lag) */
  moodSmoothingAlpha: number;
  /** Minimum mood value (prevents reaching 0) */
  moodFloor: number;
  /** Maximum mood value (prevents reaching 100) */
  moodCeiling: number;
  /** Weights for each need's contribution to mood */
  needWeights: Record<NeedKey, number>;

  // Purpose configuration
  /** Smoothing alpha for purpose changes (0.05 = slower than mood) */
  purposeSmoothingAlpha: number;
  /** Rate at which purpose decays toward equilibrium (0.02 = slow) */
  purposeDecayRate: number;
  /** Personality trait weights for purpose equilibrium calculation */
  purposeEquilibriumWeights: {
    conscientiousness: number;
    openness: number;
  };

  // Nutrition configuration
  /** Smoothing alpha for nutrition changes (0.01 = very slow) */
  nutritionSmoothingAlpha: number;
  /** Energy regeneration modifier at nutrition 0 (0.5 = 50%) */
  nutritionEnergyModMin: number;
  /** Energy regeneration modifier at nutrition 100 (1.0 = 100%) */
  nutritionEnergyModMax: number;
  /** Max mood penalty at nutrition 0 (-20 = subtract 20 from mood) */
  nutritionMoodPenalty: number;
}

/**
 * Default derived stats configuration.
 * Tuned for smooth transitions and preventing extreme states.
 */
export const DEFAULT_DERIVED_STATS_CONFIG: DerivedStatsConfig = {
  // Mood: moderate responsiveness with soft bounds
  moodSmoothingAlpha: 0.1,
  moodFloor: 10,
  moodCeiling: 95,
  needWeights: {
    hunger: 1.5, // High impact - basic survival
    energy: 1.5, // High impact - basic survival
    hygiene: 1.0, // Standard impact
    bladder: 1.0, // Standard impact
    social: 1.0, // Standard impact
    fun: 1.0, // Standard impact
    security: 1.0, // Standard impact
  },

  // Purpose: slow-moving equilibrium system
  purposeSmoothingAlpha: 0.05,
  purposeDecayRate: 0.02,
  purposeEquilibriumWeights: {
    conscientiousness: 20, // High conscientiousness = higher purpose ceiling
    openness: 10, // High openness = moderate purpose ceiling bonus
  },

  // Nutrition: very slow-moving, affects energy and mood
  nutritionSmoothingAlpha: 0.01,
  nutritionEnergyModMin: 0.5, // 50% energy regen at nutrition 0
  nutritionEnergyModMax: 1.0, // 100% energy regen at nutrition 100
  nutritionMoodPenalty: -20, // Max -20 mood penalty at nutrition 0
};

// ============================================================================
// Action Resources Configuration (v1.1)
// ============================================================================

/**
 * Configuration for action resources (Overskudd, socialBattery, Focus, Willpower).
 * Controls smoothing, target computation, and drain/charge rates.
 */
export interface ActionResourcesConfig {
  // Overskudd configuration
  /** Smoothing alpha for Overskudd changes (0.1 = moderate) */
  overskuddAlpha: number;
  /** Weight of Mood in Overskudd computation (should sum to 1.0 with energy+purpose) */
  overskuddMoodWeight: number;
  /** Weight of Energy in Overskudd computation */
  overskuddEnergyWeight: number;
  /** Weight of Purpose in Overskudd computation */
  overskuddPurposeWeight: number;

  // socialBattery configuration
  /** Smoothing alpha for socialBattery changes (0.08 = slower than Overskudd) */
  socialBatteryAlpha: number;
  /** Drain rate for introverts in social context (per tick) */
  introvertDrainRate: number;
  /** Charge rate for introverts in solo context (per tick) */
  introvertChargeRate: number;
  /** Drain rate for extroverts in solo context (per tick) */
  extrovertDrainRate: number;
  /** Charge rate for extroverts in social context (per tick) */
  extrovertChargeRate: number;
  /** Neutral drain rate for ambiverts (per tick) */
  ambivertDrainRate: number;
  /** Willpower cost per tick when socialBattery is at 0 */
  zeroSocialBatteryWillpowerCost: number;

  // Focus configuration
  /** Smoothing alpha for Focus changes (0.1 = moderate) */
  focusAlpha: number;
  /** Passive regen rate when no concentration activity (per tick) */
  focusRegenRate: number;
  /** Cost per tick for concentration activities */
  focusCostPerTick: number;

  // Willpower configuration
  /** Smoothing alpha for Willpower changes (0.08 = slower than Focus) */
  willpowerAlpha: number;
  /** Passive regen rate when no difficult activity (per tick) */
  willpowerRegenRate: number;
  /** Boost to willpower target from Fun need satisfaction */
  willpowerFunBoost: number;
  /** Willpower cost for decision-making (per decision) */
  willpowerDecisionCost: number;
}

/**
 * Default action resources configuration.
 * Tuned for personality differentiation and meaningful resource pressure.
 */
export const DEFAULT_ACTION_RESOURCES_CONFIG: ActionResourcesConfig = {
  // Overskudd: weighted from Mood + Energy + Purpose
  overskuddAlpha: 0.1,
  overskuddMoodWeight: 0.4,
  overskuddEnergyWeight: 0.35,
  overskuddPurposeWeight: 0.25,

  // socialBattery: personality-inverted drain/charge
  socialBatteryAlpha: 0.08,
  introvertDrainRate: 0.5, // Introverts drain faster in social
  introvertChargeRate: 0.3, // Introverts charge slower when solo
  extrovertDrainRate: 0.4, // Extroverts drain moderately when solo
  extrovertChargeRate: 0.4, // Extroverts charge moderately when social
  ambivertDrainRate: 0.1, // Ambiverts drain slowly in both contexts
  zeroSocialBatteryWillpowerCost: 20, // High cost to force breaks

  // Focus: depleted by concentration activities
  focusAlpha: 0.1,
  focusRegenRate: 0.2, // Regen when resting
  focusCostPerTick: 0.5, // Cost for concentration activities

  // Willpower: depleted by difficult tasks, boosted by Fun
  willpowerAlpha: 0.08,
  willpowerRegenRate: 0.15, // Regen when resting
  willpowerFunBoost: 0.3, // Boost from Fun need satisfaction
  willpowerDecisionCost: 5, // Cost per autonomous decision
};

// ============================================================================
// Difficulty Configuration (Phase 9.1)
// ============================================================================

/**
 * Default difficulty configuration.
 * Tuned for meaningful skill/mastery impact with diminishing returns.
 */
export const DEFAULT_DIFFICULTY_CONFIG: DifficultyConfig = {
  maxSkillReduction: 1.5, // Max 1.5 stars reduction from skills
  maxMasteryReduction: 1.0, // Max 1.0 star reduction from mastery
  skillDiminishingReturns: 'sqrt', // Square root diminishing returns
};

// ============================================================================
// Core Balance Configuration (v1.0)
// ============================================================================

/**
 * Balance configuration for game tuning.
 * All balance parameters centralized for experimentation via Dev Tools.
 */
export interface BalanceConfig {
  // Activity system
  minOverskuddToStart: number; // Minimum overskudd required to start activities
  masteryBonusPerLevel: number; // Success probability bonus per mastery level (e.g., 0.05 = +5%)
  masteryXPOnSuccess: number; // Base XP awarded on activity success
  masteryXPOnFailure: number; // Base XP awarded on activity failure

  // Talent system
  talentPickThreshold: number; // Domain XP threshold to trigger talent pick
  maxPendingPicks: number; // Maximum pending talent picks allowed

  // Personality system
  personalityModifierStrength: number; // Multiplier for personality modifier effects (1.0 = normal)

  // Simulation system
  simulationTickMs: number; // Milliseconds per simulation tick

  // Primary Needs system (v1.1)
  needs: NeedsConfig;

  // Derived Stats system (v1.1)
  derivedStats: DerivedStatsConfig;

  // Action Resources system (v1.1)
  actionResources: ActionResourcesConfig;

  // Difficulty system (Phase 9.1)
  difficulty: DifficultyConfig;
}

/**
 * Default balance configuration.
 * These values represent the baseline "designed" experience.
 */
export const DEFAULT_BALANCE: BalanceConfig = {
  minOverskuddToStart: 20,
  masteryBonusPerLevel: 0.05,
  masteryXPOnSuccess: 10,
  masteryXPOnFailure: 5,
  talentPickThreshold: 500,
  maxPendingPicks: 3,
  personalityModifierStrength: 1.0,
  simulationTickMs: 1000,
  needs: DEFAULT_NEEDS_CONFIG,
  derivedStats: DEFAULT_DERIVED_STATS_CONFIG,
  actionResources: DEFAULT_ACTION_RESOURCES_CONFIG,
  difficulty: DEFAULT_DIFFICULTY_CONFIG,
};

/**
 * MobX store for runtime balance configuration.
 * Provides reactive balance parameters that can be tuned via Dev Tools.
 */
export class BalanceConfigStore {
  config: BalanceConfig;

  constructor() {
    // Initialize from defaults
    this.config = { ...DEFAULT_BALANCE };
    makeAutoObservable(this);
  }

  // Computed getters for each config field (convenient access)
  get minOverskuddToStart(): number {
    return this.config.minOverskuddToStart;
  }

  get masteryBonusPerLevel(): number {
    return this.config.masteryBonusPerLevel;
  }

  get masteryXPOnSuccess(): number {
    return this.config.masteryXPOnSuccess;
  }

  get masteryXPOnFailure(): number {
    return this.config.masteryXPOnFailure;
  }

  get talentPickThreshold(): number {
    return this.config.talentPickThreshold;
  }

  get maxPendingPicks(): number {
    return this.config.maxPendingPicks;
  }

  get personalityModifierStrength(): number {
    return this.config.personalityModifierStrength;
  }

  get simulationTickMs(): number {
    return this.config.simulationTickMs;
  }

  get needsConfig(): NeedsConfig {
    return this.config.needs;
  }

  get derivedStatsConfig(): DerivedStatsConfig {
    return this.config.derivedStats;
  }

  get actionResourcesConfig(): ActionResourcesConfig {
    return this.config.actionResources;
  }

  get difficultyConfig(): DifficultyConfig {
    return this.config.difficulty;
  }

  /**
   * Action: Update balance configuration with partial updates.
   * Validates that values are non-negative.
   */
  update(updates: Partial<BalanceConfig>): void {
    // Validate: all values must be non-negative
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'number' && value < 0) {
        console.warn(
          `BalanceConfigStore: Ignoring negative value for ${key}: ${value}`
        );
        return;
      }
    }

    // Apply updates
    Object.assign(this.config, updates);
  }

  /**
   * Action: Reset all balance parameters to defaults.
   */
  reset(): void {
    this.config = { ...DEFAULT_BALANCE };
  }
}
