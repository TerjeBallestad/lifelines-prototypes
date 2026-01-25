import { makeAutoObservable } from 'mobx';
import type {
  CharacterData,
  Personality,
  Capacities,
  CapacityKey,
  Needs,
  NeedKey,
  DerivedStats,
  FoodQuality,
  StatBreakdown,
  ActionResources,
  SocialContext,
} from './types';
import {
  defaultNeeds,
  defaultDerivedStats,
  defaultActionResources,
} from './types';
import { needToMoodCurve, asymptoticClamp } from '../utils/curves';
import { SmoothedValue } from '../utils/smoothing';
import { applyAsymptoticDecay } from '../utils/needsDecay';
import { type RootStore } from '../stores/RootStore';

/** Helper to capitalize first letter of a string */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Character entity - the core game object representing a patient.
 * Uses class-based pattern to mirror Unreal Actor structure.
 * All properties are observable, all methods are actions.
 */
export class Character {
  id: string;
  name: string;
  personality: Personality;
  capacities: Capacities;
  needs: Needs; // v1.1 Primary Needs (required)
  derivedStats: DerivedStats; // v1.1 Derived Wellbeing (required)
  actionResources: ActionResources; // v1.1 Action Resources (required)

  // Transient smoothers (not serialized, recreated on initialization)
  private moodSmoother?: SmoothedValue;
  private purposeSmoother?: SmoothedValue;
  private nutritionSmoother?: SmoothedValue;
  private overskuddSmoother?: SmoothedValue;
  private socialBatterySmoother?: SmoothedValue;
  private focusSmoother?: SmoothedValue;
  private willpowerSmoother?: SmoothedValue;

  /** Running average of food quality (0-3 scale), affects nutrition target */
  private recentFoodQuality = 1.0;

  /** Current social context for socialBattery drain/charge calculation */
  currentSocialContext: SocialContext = 0; // Default to Solo

  private root?: RootStore;

  constructor(data: CharacterData, root?: RootStore) {
    this.id = data.id;
    this.name = data.name;
    this.personality = data.personality;
    this.capacities = data.capacities;
    this.root = root;

    // Always initialize v1.1 properties
    this.needs = data.needs ?? defaultNeeds();
    this.derivedStats = defaultDerivedStats();
    this.actionResources = defaultActionResources();

    // Makes all properties observable and all methods actions
    makeAutoObservable(this);
  }

  /**
   * Set root store reference (called by CharacterStore after construction)
   */
  setRootStore(root: RootStore): void {
    this.root = root;
  }

  /**
   * Get a skill by ID from the skill store.
   * Returns undefined if skill not found or root store not set.
   */
  getSkill(skillId: string) {
    return this.root?.skillStore?.getSkill(skillId);
  }

  // Computed: display name with fallback
  get displayName(): string {
    return this.name.trim() || 'Unnamed Character';
  }

  // Computed: basic validation
  get isValid(): boolean {
    return this.name.trim().length > 0;
  }

  // Action: update name
  setName(name: string): void {
    this.name = name;
  }

  // Action: update personality dimensions
  updatePersonality(updates: Partial<Personality>): void {
    Object.assign(this.personality, updates);
  }

  // Action: update capacities
  updateCapacities(updates: Partial<Capacities>): void {
    Object.assign(this.capacities, updates);
  }

  // ============================================================================
  // v1.1 Primary Needs System
  // ============================================================================

  /**
   * Action: Re-initialize derived stats and smoothers.
   * Called when resetting character state.
   */
  initializeNeeds(): void {
    this.initializeDerivedStats();
  }

  /**
   * Action: Initialize the v1.1 derived wellbeing stats system.
   * Sets up derived stats and smoothers for mood, purpose, and nutrition.
   * Called automatically at the end of initializeNeeds().
   */
  initializeDerivedStats(): void {
    // Guard: only if balance config is available
    if (!this.root?.balanceConfig) return;

    this.derivedStats = defaultDerivedStats();
    const config = this.root.balanceConfig.derivedStatsConfig;

    // Initialize smoothers with starting values and config alphas
    this.moodSmoother = new SmoothedValue(
      this.derivedStats.mood,
      config.moodSmoothingAlpha
    );
    this.purposeSmoother = new SmoothedValue(
      this.derivedStats.purpose,
      config.purposeSmoothingAlpha
    );
    this.nutritionSmoother = new SmoothedValue(
      this.derivedStats.nutrition,
      config.nutritionSmoothingAlpha
    );

    // Chain to action resources initialization
    this.initializeActionResources();
  }

  /**
   * Action: Initialize the v1.1 action resources system.
   * Sets up action resources and smoothers for overskudd, socialBattery, focus, willpower.
   * Called automatically at the end of initializeDerivedStats().
   */
  initializeActionResources(): void {
    // Guard: only if balance config is available
    if (!this.root?.balanceConfig) return;

    this.actionResources = defaultActionResources();
    const config = this.root.balanceConfig.actionResourcesConfig;

    // Initialize smoothers with starting values and config alphas
    this.overskuddSmoother = new SmoothedValue(
      this.actionResources.overskudd,
      config.overskuddAlpha
    );
    this.socialBatterySmoother = new SmoothedValue(
      this.actionResources.socialBattery,
      config.socialBatteryAlpha
    );
    this.focusSmoother = new SmoothedValue(
      this.actionResources.focus,
      config.focusAlpha
    );
    this.willpowerSmoother = new SmoothedValue(
      this.actionResources.willpower,
      config.willpowerAlpha
    );
  }

  /**
   * Computed: Personality modifiers for need decay rates.
   * Returns a Map of NeedKey -> multiplier (1.0 = no modifier).
   *
   * Personality effects on needs:
   * - High Extraversion (>60): Social need decays faster (needs more social contact)
   * - High Neuroticism (>60): Security need decays faster (needs more reassurance)
   */
  get needsModifiers(): Map<NeedKey, number> {
    const modifiers = new Map<NeedKey, number>();
    const { extraversion, neuroticism } = this.personality;

    // Get personality modifier strength from balance config (default 1.0)
    const strength =
      this.root?.balanceConfig?.needsConfig?.personalityModifierNeeds ?? 1.0;

    // Helper to scale trait to modifier (same pattern as activeModifiers)
    // Trait 60 -> 0.1 modifier, Trait 80 -> 0.3 modifier, etc.
    const scaleTraitToModifier = (traitValue: number, threshold: number) => {
      if (traitValue <= threshold) return 0;
      return ((traitValue - threshold) / 100) * strength;
    };

    // High Extraversion: Social need decays faster (extraverts crave more social contact)
    const socialMod = 1 + scaleTraitToModifier(extraversion, 60);
    modifiers.set('social', socialMod);

    // High Neuroticism: Security need decays faster (anxious people need more reassurance)
    const securityMod = 1 + scaleTraitToModifier(neuroticism, 60);
    modifiers.set('security', securityMod);

    // Default modifier of 1.0 for other needs
    const needKeys = Array<NeedKey>(
      'hunger',
      'energy',
      'hygiene',
      'bladder',
      'fun'
    );
    for (const key of needKeys) {
      if (!modifiers.has(key)) {
        modifiers.set(key, 1.0);
      }
    }

    return modifiers;
  }

  /**
   * Action: Apply asymptotic decay to all primary needs.
   * Called by SimulationStore.tick().
   *
   * Uses asymptotic decay formula to prevent death spirals:
   * decay slows as needs approach the floor value (5).
   *
   * @param speedMultiplier - Simulation speed (1 = normal, higher = faster decay)
   */
  applyNeedsDecay(speedMultiplier: number): void {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return;

    const config = this.root.balanceConfig.needsConfig;
    const mods = this.needsModifiers;

    // Apply decay to each need using personality modifiers
    this.needs.hunger = applyAsymptoticDecay(
      this.needs.hunger,
      config.hungerDecayRate * (mods.get('hunger') ?? 1),
      speedMultiplier
    );

    this.needs.energy = applyAsymptoticDecay(
      this.needs.energy,
      config.energyDecayRate * (mods.get('energy') ?? 1),
      speedMultiplier
    );

    this.needs.hygiene = applyAsymptoticDecay(
      this.needs.hygiene,
      config.hygieneDecayRate * (mods.get('hygiene') ?? 1),
      speedMultiplier
    );

    this.needs.bladder = applyAsymptoticDecay(
      this.needs.bladder,
      config.bladderDecayRate * (mods.get('bladder') ?? 1),
      speedMultiplier
    );

    this.needs.social = applyAsymptoticDecay(
      this.needs.social,
      config.socialDecayRate * (mods.get('social') ?? 1),
      speedMultiplier
    );

    this.needs.fun = applyAsymptoticDecay(
      this.needs.fun,
      config.funDecayRate * (mods.get('fun') ?? 1),
      speedMultiplier
    );

    this.needs.security = applyAsymptoticDecay(
      this.needs.security,
      config.securityDecayRate * (mods.get('security') ?? 1),
      speedMultiplier
    );
  }

  // ============================================================================
  // v1.1 Derived Wellbeing Computed Getters
  // ============================================================================

  /**
   * Computed: Target mood value based on need satisfaction.
   * Uses sigmoid curves to convert each need to a mood contribution,
   * with configurable weights for need importance.
   *
   * The mood is computed as:
   * 1. For each need, compute its contribution using needToMoodCurve
   * 2. Weight contributions by physiological importance
   * 3. Average contributions and add to baseline 50
   * 4. Apply nutrition modifier
   * 5. Clamp to soft bounds (floor/ceiling)
   *
   * @returns Target mood value (typically 10-95 range)
   */
  get computedMoodTarget(): number {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return 50;

    const config = this.root.balanceConfig.derivedStatsConfig;
    const weights = config.needWeights;
    const steepness = 2.5; // Slightly steeper curve than default for more dramatic response

    let totalContribution = 0;
    let totalWeight = 0;

    // Calculate weighted mood contribution from each need
    const needKeys = Array<NeedKey>(
      'hunger',
      'energy',
      'hygiene',
      'bladder',
      'social',
      'fun',
      'security'
    );

    for (const key of needKeys) {
      const needValue = this.needs[key];
      const weight = weights[key];
      const contribution = needToMoodCurve(needValue, weight, steepness);
      totalContribution += contribution;
      totalWeight += weight;
    }

    // Average contribution and add to baseline
    const avgContribution = totalContribution / totalWeight;
    let mood = 50 + avgContribution;

    // Apply nutrition modifier (penalty for poor nutrition)
    mood += this.getNutritionMoodModifier();

    // Apply soft bounds
    return asymptoticClamp(mood, config.moodFloor, config.moodCeiling);
  }

  /**
   * Computed: Breakdown of mood contributions for tooltip display.
   * Shows how each need and nutrition contributes to the current mood value.
   *
   * @returns StatBreakdown with total and per-source contributions
   */
  get moodBreakdown(): StatBreakdown {
    // Guard: config must be available
    if (!this.root?.balanceConfig) {
      return { total: 50, contributions: [] };
    }

    const config = this.root.balanceConfig.derivedStatsConfig;
    const weights = config.needWeights;
    const steepness = 2.5;
    const contributions: Array<{ source: string; value: number }> = [];

    // Calculate each need's contribution
    const needKeys = Array<NeedKey>(
      'hunger',
      'energy',
      'hygiene',
      'bladder',
      'social',
      'fun',
      'security'
    );

    for (const key of needKeys) {
      const needValue = this.needs[key];
      const weight = weights[key];
      const contribution = needToMoodCurve(needValue, weight, steepness);

      contributions.push({
        source: capitalizeFirst(key),
        value: Math.round(contribution * 10) / 10, // Round to 1 decimal
      });
    }

    // Add nutrition modifier if significant
    const nutritionMod = this.getNutritionMoodModifier();
    if (Math.abs(nutritionMod) > 0.5) {
      contributions.push({
        source: 'Nutrition',
        value: Math.round(nutritionMod * 10) / 10,
      });
    }

    return {
      total: Math.round(this.derivedStats.mood),
      contributions,
    };
  }

  /**
   * Computed: Personality-based equilibrium for purpose stat.
   * High Conscientiousness and Openness lead to higher baseline purpose.
   *
   * The equilibrium represents the "natural resting point" that purpose
   * decays toward when not being boosted by meaningful activities.
   *
   * @returns Purpose equilibrium value (clamped 20-80)
   */
  get purposeEquilibrium(): number {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return 50;

    const config = this.root.balanceConfig.derivedStatsConfig;
    const { conscientiousness, openness } = this.personality;

    // Start at baseline 50
    let equilibrium = 50;

    // Add conscientiousness modifier: ((trait - 50) / 50) * weight
    // At C=100: +20 (max positive), At C=0: -20 (max negative)
    equilibrium +=
      ((conscientiousness - 50) / 50) *
      config.purposeEquilibriumWeights.conscientiousness;

    // Add openness modifier: ((trait - 50) / 50) * weight
    // At O=100: +10 (max positive), At O=0: -10 (max negative)
    equilibrium +=
      ((openness - 50) / 50) * config.purposeEquilibriumWeights.openness;

    // Clamp to reasonable range (20-80)
    return Math.max(20, Math.min(80, equilibrium));
  }

  /**
   * Private: Calculates mood penalty from poor nutrition.
   * At nutrition 100: returns 0 (no penalty)
   * At nutrition 0: returns full penalty (e.g., -20)
   *
   * @returns Mood modifier from nutrition (typically 0 to -20)
   */
  private getNutritionMoodModifier(): number {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return 0;

    const config = this.root.balanceConfig.derivedStatsConfig;
    // nutritionMoodPenalty is negative (e.g., -20)
    // At nutrition 100: penalty * 0 = 0
    // At nutrition 0: penalty * 1 = -20
    return (
      config.nutritionMoodPenalty * (1 - this.derivedStats.nutrition / 100)
    );
  }

  /**
   * Public: Calculates energy regeneration modifier from nutrition.
   * Used by Phase 9 activity system for energy recovery calculations.
   *
   * At nutrition 100: returns 1.0 (100% energy regen)
   * At nutrition 0: returns 0.5 (50% energy regen)
   *
   * @returns Energy modifier (0.5 to 1.0)
   */
  getNutritionEnergyModifier(): number {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return 1.0;

    const config = this.root.balanceConfig.derivedStatsConfig;
    // Linear interpolation from min to max based on nutrition
    // At nutrition 0: returns nutritionEnergyModMin (0.5)
    // At nutrition 100: returns nutritionEnergyModMax (1.0)
    return (
      config.nutritionEnergyModMin +
      (config.nutritionEnergyModMax - config.nutritionEnergyModMin) *
        (this.derivedStats.nutrition / 100)
    );
  }

  /**
   * Action: Update running food quality average when character eats.
   * Called by eating activities to track nutrition quality over time.
   *
   * Uses exponential moving average (0.9 old + 0.1 new) so nutrition
   * responds slowly to diet changes.
   *
   * @param quality - Quality of food eaten (FoodQuality enum: 0-3)
   */
  eatFood(quality: FoodQuality): void {
    // Exponential moving average: 90% old + 10% new
    this.recentFoodQuality = this.recentFoodQuality * 0.9 + quality * 0.1;
  }

  /**
   * Action: Boost purpose stat from meaningful activities.
   * Called by Phase 10 activities that provide meaning (creative work,
   * helping others, achieving goals, etc.).
   *
   * Purpose is capped at 95 to leave room for the soft ceiling effect.
   *
   * @param amount - Amount to boost purpose by (typically 5-20)
   */
  boostPurpose(amount: number): void {
    // Compute new target, capped at 95
    const newTarget = Math.min(95, this.derivedStats.purpose + amount);

    // Update smoother target for gradual approach
    this.purposeSmoother?.setValue(newTarget);
  }

  // ============================================================================
  // v1.1 Action Resources Computed Getters
  // ============================================================================

  /**
   * Computed: Target overskudd value based on Mood, Energy (need), and Purpose.
   * Weighted average: Mood (40%) + Energy need (35%) + Purpose (25%).
   * Clamped to 0-100 range.
   *
   * @returns Target overskudd value (0-100)
   */
  get overskuddTarget(): number {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return 70;

    const config = this.root.balanceConfig.actionResourcesConfig;
    const mood = this.derivedStats.mood;
    const energy = this.needs.energy;
    const purpose = this.derivedStats.purpose;

    // Weighted average
    const target =
      mood * config.overskuddMoodWeight +
      energy * config.overskuddEnergyWeight +
      purpose * config.overskuddPurposeWeight;

    return Math.max(0, Math.min(100, target));
  }

  /**
   * Computed: Breakdown of overskudd contributions for tooltip display.
   *
   * @returns StatBreakdown with Mood, Energy, Purpose contributions
   */
  get overskuddBreakdown(): StatBreakdown {
    // Guard: config must be available
    if (!this.root?.balanceConfig) {
      return { total: 70, contributions: [] };
    }

    const config = this.root.balanceConfig.actionResourcesConfig;
    const mood = this.derivedStats.mood;
    const energy = this.needs.energy;
    const purpose = this.derivedStats.purpose;

    const contributions = [
      {
        source: 'Mood',
        value: Math.round(mood * config.overskuddMoodWeight * 10) / 10,
      },
      {
        source: 'Energy',
        value: Math.round(energy * config.overskuddEnergyWeight * 10) / 10,
      },
      {
        source: 'Purpose',
        value: Math.round(purpose * config.overskuddPurposeWeight * 10) / 10,
      },
    ];

    return {
      total: Math.round(this.actionResources.overskudd),
      contributions,
    };
  }

  /**
   * Computed: Target socialBattery value based on Extraversion and currentSocialContext.
   *
   * Introvert (E < 40): charges solo (100), drains social (20)
   * Extrovert (E > 60): drains solo (30), charges social (100)
   * Ambivert (40-60): neutral target (50) in both contexts
   *
   * @returns Target socialBattery value (0-100)
   */
  get socialBatteryTarget(): number {
    const extraversion = this.personality.extraversion;

    // Introvert (low extraversion)
    if (extraversion < 40) {
      return this.currentSocialContext === 0 ? 100 : 20; // Solo = charge, Social = drain
    }

    // Extrovert (high extraversion)
    if (extraversion > 60) {
      return this.currentSocialContext === 0 ? 30 : 100; // Solo = drain, Social = charge
    }

    // Ambivert (moderate extraversion)
    return 50; // Neutral in both contexts
  }

  /**
   * Computed: Breakdown of socialBattery for tooltip display.
   *
   * @returns StatBreakdown showing personality effect
   */
  get socialBatteryBreakdown(): StatBreakdown {
    const extraversion = this.personality.extraversion;

    let personalityEffect = '';
    if (extraversion < 40) {
      personalityEffect = 'Introvert: charges solo, drains social';
    } else if (extraversion > 60) {
      personalityEffect = 'Extrovert: drains solo, charges social';
    } else {
      personalityEffect = 'Ambivert: neutral in both contexts';
    }

    return {
      total: Math.round(this.actionResources.socialBattery),
      contributions: [
        { source: 'Context', value: this.currentSocialContext },
        { source: 'Extraversion', value: Math.round(extraversion) },
        { source: personalityEffect, value: this.socialBatteryTarget },
      ],
    };
  }

  /**
   * Computed: Target focus value (full when resting, depleted by activities).
   *
   * @returns Target focus value (0-100)
   */
  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get focusTarget(): number {
    // For now, always target full focus when resting
    // Phase 10 activities will deplete focus
    return 100;
  }

  /**
   * Computed: Breakdown of focus for tooltip display.
   *
   * @returns StatBreakdown (simple for now)
   */
  get focusBreakdown(): StatBreakdown {
    return {
      total: Math.round(this.actionResources.focus),
      contributions: [{ source: 'Resting', value: 100 }],
    };
  }

  /**
   * Computed: Target willpower value (80 base, boosted by Fun need satisfaction).
   *
   * @returns Target willpower value (0-100)
   */
  get willpowerTarget(): number {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return 80;

    const config = this.root.balanceConfig.actionResourcesConfig;
    const fun = this.needs.fun;

    // Base target + Fun boost
    // Fun at 100 -> +30, Fun at 0 -> +0
    const target = 80 + (fun / 100) * config.willpowerFunBoost * 100;

    return Math.max(0, Math.min(100, target));
  }

  /**
   * Computed: Breakdown of willpower for tooltip display.
   *
   * @returns StatBreakdown showing Fun boost
   */
  get willpowerBreakdown(): StatBreakdown {
    // Guard: config must be available
    if (!this.root?.balanceConfig) {
      return { total: 80, contributions: [] };
    }

    const config = this.root.balanceConfig.actionResourcesConfig;
    const fun = this.needs.fun;
    const funBoost = (fun / 100) * config.willpowerFunBoost * 100;

    return {
      total: Math.round(this.actionResources.willpower),
      contributions: [
        { source: 'Base', value: 80 },
        { source: 'Fun boost', value: Math.round(funBoost * 10) / 10 },
      ],
    };
  }

  /**
   * Action: Apply derived stats update for one simulation tick.
   * Updates mood toward target, decays purpose toward equilibrium,
   * and updates nutrition from food quality.
   *
   * Called by applyTickUpdate().
   *
   * @param speedMultiplier - Simulation speed (1 = normal, higher = faster changes)
   */
  applyDerivedStatsUpdate(speedMultiplier: number): void {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return;

    const config = this.root.balanceConfig.derivedStatsConfig;

    // Update Mood: smooth toward computed target
    if (this.moodSmoother) {
      this.derivedStats.mood = this.moodSmoother.update(
        this.computedMoodTarget
      );
    }

    // Update Purpose: decay toward personality-based equilibrium
    if (this.purposeSmoother) {
      const target = this.purposeEquilibrium;
      const decayRate = config.purposeDecayRate * speedMultiplier;
      const currentTarget = this.purposeSmoother.getValue();

      // Move current target toward equilibrium by decay rate
      const newTarget = currentTarget - (currentTarget - target) * decayRate;
      this.purposeSmoother.setValue(newTarget);
      this.derivedStats.purpose = this.purposeSmoother.getValue();
    }

    // Update Nutrition: smooth toward food quality target
    if (this.nutritionSmoother) {
      // Convert food quality (0-3) to nutrition scale (0-100)
      // recentFoodQuality 0 -> 0%, recentFoodQuality 3 -> 100%
      const targetNutrition = (this.recentFoodQuality / 3) * 100;
      this.derivedStats.nutrition =
        this.nutritionSmoother.update(targetNutrition);
    }
  }

  /**
   * Action: Apply action resources update for one simulation tick.
   * Updates all 4 action resources based on computed targets and personality.
   *
   * Called by applyTickUpdate() after applyDerivedStatsUpdate().
   *
   * @param speedMultiplier - Simulation speed (1 = normal, higher = faster changes)
   */
  applyActionResourcesUpdate(speedMultiplier: number): void {
    // Guard: config must be available
    if (!this.root?.balanceConfig) return;

    const config = this.root.balanceConfig.actionResourcesConfig;

    // Update Overskudd: equilibrium pull with willpower-modified smoothing
    // Higher willpower -> faster recovery toward target
    if (this.overskuddSmoother) {
      const willpower = this.actionResources.willpower;
      const effectiveAlpha =
        config.overskuddAlpha * (0.5 + (willpower / 100) * 0.5);
      // Create temporary smoother with effective alpha for this tick
      const tempSmoother = new SmoothedValue(
        this.actionResources.overskudd,
        effectiveAlpha
      );
      this.actionResources.overskudd = tempSmoother.update(
        this.overskuddTarget
      );
    }

    // Update socialBattery: drain/charge based on Extraversion + currentSocialContext
    if (this.socialBatterySmoother) {
      const extraversion = this.personality.extraversion;
      const current = this.actionResources.socialBattery;

      // Sync smoother to actual value (in case modified externally by ActivityStore)
      this.socialBatterySmoother.setValue(current);

      // Compute drain/charge rate per tick
      let rate = 0;
      if (extraversion < 40) {
        // Introvert
        rate =
          this.currentSocialContext === 0
            ? config.introvertChargeRate
            : -config.introvertDrainRate;
      } else if (extraversion > 60) {
        // Extrovert
        rate =
          this.currentSocialContext === 0
            ? -config.extrovertDrainRate
            : config.extrovertChargeRate;
      } else {
        // Ambivert
        rate = -config.ambivertDrainRate;
      }

      // Apply rate via smoother (move toward target)
      const newValue = current + rate * speedMultiplier;
      this.actionResources.socialBattery = Math.max(
        0,
        Math.min(100, this.socialBatterySmoother.update(newValue))
      );

      // If socialBattery is depleted, drain willpower
      if (this.actionResources.socialBattery <= 0) {
        this.actionResources.willpower = Math.max(
          0,
          this.actionResources.willpower -
            config.zeroSocialBatteryWillpowerCost * speedMultiplier
        );
      }
    }

    // Update Focus: passive regen toward target
    if (this.focusSmoother) {
      const current = this.actionResources.focus;
      const target = this.focusTarget;
      const regenAmount = config.focusRegenRate * speedMultiplier;

      // Move toward target
      const newValue =
        current < target ? Math.min(target, current + regenAmount) : current;
      this.actionResources.focus = this.focusSmoother.update(newValue);
    }

    // Update Willpower: passive regen toward target
    if (this.willpowerSmoother) {
      const current = this.actionResources.willpower;
      const target = this.willpowerTarget;
      const regenAmount = config.willpowerRegenRate * speedMultiplier;

      // Move toward target
      const newValue =
        current < target ? Math.min(target, current + regenAmount) : current;
      this.actionResources.willpower = this.willpowerSmoother.update(newValue);
    }
  }

  /**
   * Action: Spend focus for concentration activities (Phase 10).
   *
   * @param amount - Amount of focus to spend
   */
  spendFocus(amount: number): void {
    this.actionResources.focus = Math.max(
      0,
      this.actionResources.focus - amount
    );
  }

  /**
   * Action: Spend willpower for difficult tasks (Phase 10).
   *
   * @param amount - Amount of willpower to spend
   */
  spendWillpower(amount: number): void {
    this.actionResources.willpower = Math.max(
      0,
      this.actionResources.willpower - amount
    );
  }

  // ============================================================================
  // Talent System Integration
  // ============================================================================

  /**
   * Computed: Effective capacities including talent flat bonuses.
   * Returns a new Capacities object with talent modifiers applied.
   */
  get effectiveCapacities(): Capacities {
    // Start with base capacities
    const effective: Capacities = { ...this.capacities };

    // Apply talent capacity bonuses
    if (this.root?.talentStore) {
      const talents = this.root.talentStore.selectedTalentsArray;
      for (const talent of talents) {
        for (const effect of talent.effects) {
          if (effect.target === 'capacity' && effect.type === 'flat') {
            const key = effect.targetKey as CapacityKey;
            if (key in effective) {
              effective[key] = (effective[key] ?? 0) + effect.value;
            }
          }
        }
      }
    }

    return effective;
  }

  /**
   * Computed: Breakdown of capacity modifiers by talent.
   * Returns map of capacityKey -> array of { source, value } for UI display.
   */
  get capacityModifierBreakdown(): Map<
    CapacityKey,
    Array<{ source: string; value: number }>
  > {
    const breakdown = new Map<
      CapacityKey,
      Array<{ source: string; value: number }>
    >();

    if (this.root?.talentStore) {
      const talents = this.root.talentStore.selectedTalentsArray;
      for (const talent of talents) {
        for (const effect of talent.effects) {
          if (effect.target === 'capacity' && effect.type === 'flat') {
            const key = effect.targetKey as CapacityKey;
            const existing = breakdown.get(key);
            if (existing) {
              existing.push({ source: talent.name, value: effect.value });
            } else {
              breakdown.set(key, [
                { source: talent.name, value: effect.value },
              ]);
            }
          }
        }
      }
    }

    return breakdown;
  }

  /**
   * Action: Apply time-based resource updates for one simulation tick.
   * Called by SimulationStore.tick() each tick.
   *
   * Runs v1.1 needs system: needs decay -> derived stats -> action resources
   *
   * @param speedMultiplier - Simulation speed (1 = normal, higher = faster drain/recovery)
   */
  applyTickUpdate(speedMultiplier: number): void {
    // v1.1: Apply needs decay (asymptotic to prevent death spirals)
    this.applyNeedsDecay(speedMultiplier);
    // v1.1: Apply derived stats update (mood, purpose, nutrition)
    this.applyDerivedStatsUpdate(speedMultiplier);
    // v1.1: Apply action resources update (overskudd, socialBattery, focus, willpower)
    this.applyActionResourcesUpdate(speedMultiplier);
  }

  // Computed boundary state flags for game logic

  /** True when energy is critically low (<= 10) */
  get isExhausted(): boolean {
    return this.needs.energy <= 10;
  }

  /** True when social battery is critically low (<= 10) */
  get isSociallyDrained(): boolean {
    return this.actionResources.socialBattery <= 10;
  }
}
