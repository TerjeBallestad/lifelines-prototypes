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

/**
 * Default needs configuration.
 * Tuned for death spiral prevention via asymptotic decay.
 */
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
