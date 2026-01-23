import { makeAutoObservable } from 'mobx';
import type {
  CharacterData,
  Personality,
  Capacities,
  Resources,
  ResourceKey,
  CapacityKey,
  Needs,
  NeedKey,
  DerivedStats,
  FoodQuality,
  StatBreakdown,
} from './types';
import { defaultNeeds, defaultDerivedStats } from './types';
import { needToMoodCurve, asymptoticClamp } from '../utils/curves';
import { SmoothedValue } from '../utils/smoothing';
import {
  personalityToModifier,
  applyModifiers,
  clampResource,
  type ResourceModifier,
} from '../utils/modifiers';
import { applyAsymptoticDecay } from '../utils/needsDecay';
import { type RootStore } from '../stores/RootStore';

/** Helper to capitalize first letter of a string */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Base drain rates per tick (resources that naturally decrease)
const BASE_DRAIN_RATES: Partial<Record<ResourceKey, number>> = {
  energy: 0.5, // per tick
  socialBattery: 0.3,
  focus: 0.4,
  nutrition: 0.2,
  overskudd: 0.3,
};

// Base recovery rates per tick (resources that naturally recover)
const BASE_RECOVERY_RATES: Partial<Record<ResourceKey, number>> = {
  stress: 0.2, // stress recovers (goes down) naturally
  mood: 0.1,
  motivation: 0.1,
  security: 0.05,
};

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
  resources: Resources;
  needs?: Needs; // v1.1 Primary Needs (optional, initialized via initializeNeeds)
  derivedStats?: DerivedStats; // v1.1 Derived Wellbeing (optional, initialized via initializeDerivedStats)

  // Transient smoothers (not serialized, recreated on initialization)
  private moodSmoother?: SmoothedValue;
  private purposeSmoother?: SmoothedValue;
  private nutritionSmoother?: SmoothedValue;

  /** Running average of food quality (0-3 scale), affects nutrition target */
  private recentFoodQuality: number = 1.0;

  private root?: RootStore;

  constructor(data: CharacterData, root?: RootStore) {
    this.id = data.id;
    this.name = data.name;
    this.personality = data.personality;
    this.capacities = data.capacities;
    this.resources = data.resources;
    this.root = root;

    // Makes all properties observable and all methods actions
    makeAutoObservable(this);
  }

  /**
   * Set root store reference (called by CharacterStore after construction)
   */
  setRootStore(root: RootStore): void {
    this.root = root;
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

  // Action: update resources
  updateResources(updates: Partial<Resources>): void {
    Object.assign(this.resources, updates);
  }

  // ============================================================================
  // v1.1 Primary Needs System
  // ============================================================================

  /**
   * Action: Initialize the v1.1 primary needs system.
   * Called when enabling v1.1 mode or creating a new character with needs.
   */
  initializeNeeds(): void {
    this.needs = defaultNeeds();
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
    const needKeys: NeedKey[] = [
      'hunger',
      'energy',
      'hygiene',
      'bladder',
      'fun',
    ];
    for (const key of needKeys) {
      if (!modifiers.has(key)) {
        modifiers.set(key, 1.0);
      }
    }

    return modifiers;
  }

  /**
   * Action: Apply asymptotic decay to all primary needs.
   * Called by SimulationStore.tick() when v1.1 mode is enabled.
   *
   * Uses asymptotic decay formula to prevent death spirals:
   * decay slows as needs approach the floor value (5).
   *
   * @param speedMultiplier - Simulation speed (1 = normal, higher = faster decay)
   */
  applyNeedsDecay(speedMultiplier: number): void {
    // Guard: needs must be initialized and config must be available
    if (!this.needs || !this.root?.balanceConfig) return;

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
    // Guard: needs and config must be available
    if (!this.needs || !this.root?.balanceConfig) return 50;

    const config = this.root.balanceConfig.derivedStatsConfig;
    const weights = config.needWeights;
    const steepness = 2.5; // Slightly steeper curve than default for more dramatic response

    let totalContribution = 0;
    let totalWeight = 0;

    // Calculate weighted mood contribution from each need
    const needKeys: NeedKey[] = [
      'hunger',
      'energy',
      'hygiene',
      'bladder',
      'social',
      'fun',
      'security',
    ];

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
    // Guard: if no needs, return neutral breakdown
    if (!this.needs || !this.root?.balanceConfig) {
      return { total: 50, contributions: [] };
    }

    const config = this.root.balanceConfig.derivedStatsConfig;
    const weights = config.needWeights;
    const steepness = 2.5;
    const contributions: Array<{ source: string; value: number }> = [];

    // Calculate each need's contribution
    const needKeys: NeedKey[] = [
      'hunger',
      'energy',
      'hygiene',
      'bladder',
      'social',
      'fun',
      'security',
    ];

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
      total: Math.round(this.derivedStats?.mood ?? 50),
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
    // Guard: derivedStats and config must be available
    if (!this.derivedStats || !this.root?.balanceConfig) return 0;

    const config = this.root.balanceConfig.derivedStatsConfig;
    // nutritionMoodPenalty is negative (e.g., -20)
    // At nutrition 100: penalty * 0 = 0
    // At nutrition 0: penalty * 1 = -20
    return config.nutritionMoodPenalty * (1 - this.derivedStats.nutrition / 100);
  }

  // ============================================================================
  // v1.0 Resource Modifiers (existing system)
  // ============================================================================

  /**
   * Computed: Active modifiers based on current personality traits.
   * Each Big Five trait affects specific resources:
   * - Extraversion: Low = +drain socialBattery, High = +recovery mood
   * - Neuroticism: High = +drain stress, -recovery stress
   * - Conscientiousness: High = +recovery focus, Low = +drain motivation
   * - Openness: High = +recovery overskudd
   * - Agreeableness: High = +recovery socialBattery
   */
  get activeModifiers(): ResourceModifier[] {
    const modifiers: ResourceModifier[] = [];
    const {
      extraversion,
      neuroticism,
      conscientiousness,
      openness,
      agreeableness,
    } = this.personality;

    // Get personality modifier strength from balance config (default 1.0)
    const strength = this.root?.balanceConfig?.personalityModifierStrength ?? 1.0;

    // Helper to apply strength multiplier to personality modifiers
    const scaledModifier = (traitValue: number) =>
      personalityToModifier(traitValue) * strength;

    // Extraversion effects
    if (extraversion < 50) {
      // Introverts drain socialBattery faster in social situations
      modifiers.push({
        resourceKey: 'socialBattery',
        source: 'low extraversion',
        drainModifier: scaledModifier(100 - extraversion), // Invert: low E = high drain
        recoveryModifier: 0,
      });
    }
    if (extraversion > 50) {
      // Extraverts recover mood faster
      modifiers.push({
        resourceKey: 'mood',
        source: 'high extraversion',
        drainModifier: 0,
        recoveryModifier: scaledModifier(extraversion),
      });
    }

    // Neuroticism effects
    if (neuroticism > 50) {
      // High N = stress builds faster and is harder to reduce
      modifiers.push({
        resourceKey: 'stress',
        source: 'high neuroticism',
        drainModifier: scaledModifier(neuroticism), // For stress, "drain" means it increases
        recoveryModifier: -scaledModifier(neuroticism), // Negative = slower recovery
      });
    }

    // Conscientiousness effects
    if (conscientiousness > 50) {
      // High C = better focus recovery
      modifiers.push({
        resourceKey: 'focus',
        source: 'high conscientiousness',
        drainModifier: 0,
        recoveryModifier: scaledModifier(conscientiousness),
      });
    }
    if (conscientiousness < 50) {
      // Low C = motivation drains faster
      modifiers.push({
        resourceKey: 'motivation',
        source: 'low conscientiousness',
        drainModifier: scaledModifier(100 - conscientiousness), // Invert: low C = high drain
        recoveryModifier: 0,
      });
    }

    // Openness effects
    if (openness > 50) {
      // High O = mental flexibility aids overskudd recovery
      modifiers.push({
        resourceKey: 'overskudd',
        source: 'high openness',
        drainModifier: 0,
        recoveryModifier: scaledModifier(openness),
      });
    }

    // Agreeableness effects
    if (agreeableness > 50) {
      // High A = social situations less draining
      modifiers.push({
        resourceKey: 'socialBattery',
        source: 'high agreeableness',
        drainModifier: 0,
        recoveryModifier: scaledModifier(agreeableness),
      });
    }

    // Add talent modifiers for resources
    if (this.root?.talentStore) {
      const talents = this.root.talentStore.selectedTalentsArray;
      for (const talent of talents) {
        for (const effect of talent.effects) {
          // Only apply resource modifiers here (percentage type for drain/recovery)
          if (effect.target === 'resource' && effect.type === 'percentage') {
            modifiers.push({
              resourceKey: effect.targetKey as ResourceKey,
              source: talent.name,
              drainModifier: effect.value, // positive = faster drain, negative = slower
              recoveryModifier: 0,
            });
          }
        }
      }
    }

    return modifiers;
  }

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
    { source: string; value: number }[]
  > {
    const breakdown = new Map<
      CapacityKey,
      { source: string; value: number }[]
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
              breakdown.set(key, [{ source: talent.name, value: effect.value }]);
            }
          }
        }
      }
    }

    return breakdown;
  }

  /**
   * Computed: Breakdown of resource modifiers by talent.
   * Returns map of resourceKey -> array of { source, value, type } for UI display.
   */
  get resourceModifierBreakdown(): Map<
    ResourceKey,
    { source: string; value: number; type: 'drain' | 'recovery' }[]
  > {
    const breakdown = new Map<
      ResourceKey,
      { source: string; value: number; type: 'drain' | 'recovery' }[]
    >();

    if (this.root?.talentStore) {
      const talents = this.root.talentStore.selectedTalentsArray;
      for (const talent of talents) {
        for (const effect of talent.effects) {
          if (effect.target === 'resource' && effect.type === 'percentage') {
            const key = effect.targetKey as ResourceKey;
            const entry = {
              source: talent.name,
              value: effect.value,
              type: (effect.value > 0 ? 'drain' : 'recovery') as 'drain' | 'recovery',
            };
            const existing = breakdown.get(key);
            if (existing) {
              existing.push(entry);
            } else {
              breakdown.set(key, [entry]);
            }
          }
        }
      }
    }

    return breakdown;
  }

  /**
   * Computes effective drain rate for a resource after applying modifiers.
   */
  effectiveDrainRate(key: ResourceKey): number {
    const base = BASE_DRAIN_RATES[key] ?? 0;
    const mods = this.activeModifiers
      .filter((m) => m.resourceKey === key)
      .map((m) => m.drainModifier);
    return applyModifiers(base, mods);
  }

  /**
   * Computes effective recovery rate for a resource after applying modifiers.
   */
  effectiveRecoveryRate(key: ResourceKey): number {
    const base = BASE_RECOVERY_RATES[key] ?? 0;
    const mods = this.activeModifiers
      .filter((m) => m.resourceKey === key)
      .map((m) => m.recoveryModifier);
    return applyModifiers(base, mods);
  }

  /**
   * Action: Apply time-based resource updates for one simulation tick.
   * Called by SimulationStore.tick() each tick.
   *
   * Branches based on needsSystemEnabled toggle:
   * - v1.1 (enabled): Apply needs decay via applyNeedsDecay()
   * - v1.0 (disabled): Apply resource drain/recovery via existing logic
   *
   * @param speedMultiplier - Simulation speed (1 = normal, higher = faster drain/recovery)
   */
  applyTickUpdate(speedMultiplier: number): void {
    const needsEnabled = this.root?.needsSystemEnabled ?? false;

    if (needsEnabled && this.needs) {
      // v1.1: Apply needs decay (asymptotic to prevent death spirals)
      this.applyNeedsDecay(speedMultiplier);
    } else {
      // v1.0: Apply resource drain/recovery

      // Apply drain to draining resources
      for (const key of Object.keys(BASE_DRAIN_RATES) as ResourceKey[]) {
        const effectiveRate = this.effectiveDrainRate(key);
        const drain = effectiveRate * speedMultiplier;
        this.resources[key] = clampResource(this.resources[key] - drain);
      }

      // Apply recovery to recovering resources
      for (const key of Object.keys(BASE_RECOVERY_RATES) as ResourceKey[]) {
        const effectiveRate = this.effectiveRecoveryRate(key);
        const recovery = effectiveRate * speedMultiplier;

        // Stress is inverse: recovery means it goes DOWN (good)
        if (key === 'stress') {
          this.resources[key] = clampResource(this.resources[key] - recovery);
        } else {
          this.resources[key] = clampResource(this.resources[key] + recovery);
        }
      }
    }
  }

  // Computed boundary state flags for game logic

  /** True when energy is critically low (<= 10) */
  get isExhausted(): boolean {
    return this.resources.energy <= 10;
  }

  /** True when stress is critically high (>= 90) */
  get isOverstressed(): boolean {
    return this.resources.stress >= 90;
  }

  /** True when social battery is critically low (<= 10) */
  get isSociallyDrained(): boolean {
    return this.resources.socialBattery <= 10;
  }
}
