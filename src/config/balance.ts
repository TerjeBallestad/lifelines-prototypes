import { makeAutoObservable } from 'mobx';

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

import { NeedKey } from '../entities/types';

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
    hunger: 1.5,   // High impact - basic survival
    energy: 1.5,   // High impact - basic survival
    hygiene: 1.0,  // Standard impact
    bladder: 1.0,  // Standard impact
    social: 1.0,   // Standard impact
    fun: 1.0,      // Standard impact
    security: 1.0, // Standard impact
  },

  // Purpose: slow-moving equilibrium system
  purposeSmoothingAlpha: 0.05,
  purposeDecayRate: 0.02,
  purposeEquilibriumWeights: {
    conscientiousness: 20, // High conscientiousness = higher purpose ceiling
    openness: 10,          // High openness = moderate purpose ceiling bonus
  },

  // Nutrition: very slow-moving, affects energy and mood
  nutritionSmoothingAlpha: 0.01,
  nutritionEnergyModMin: 0.5,  // 50% energy regen at nutrition 0
  nutritionEnergyModMax: 1.0,  // 100% energy regen at nutrition 100
  nutritionMoodPenalty: -20,   // Max -20 mood penalty at nutrition 0
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
