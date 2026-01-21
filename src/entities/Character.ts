import { makeAutoObservable } from 'mobx';
import type {
  CharacterData,
  Personality,
  Capacities,
  Resources,
  ResourceKey,
} from './types';
import {
  personalityToModifier,
  applyModifiers,
  clampResource,
  type ResourceModifier,
} from '../utils/modifiers';

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

  constructor(data: CharacterData) {
    this.id = data.id;
    this.name = data.name;
    this.personality = data.personality;
    this.capacities = data.capacities;
    this.resources = data.resources;

    // Makes all properties observable and all methods actions
    makeAutoObservable(this);
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

    // Extraversion effects
    if (extraversion < 50) {
      // Introverts drain socialBattery faster in social situations
      modifiers.push({
        resourceKey: 'socialBattery',
        source: 'low extraversion',
        drainModifier: personalityToModifier(100 - extraversion), // Invert: low E = high drain
        recoveryModifier: 0,
      });
    }
    if (extraversion > 50) {
      // Extraverts recover mood faster
      modifiers.push({
        resourceKey: 'mood',
        source: 'high extraversion',
        drainModifier: 0,
        recoveryModifier: personalityToModifier(extraversion),
      });
    }

    // Neuroticism effects
    if (neuroticism > 50) {
      // High N = stress builds faster and is harder to reduce
      modifiers.push({
        resourceKey: 'stress',
        source: 'high neuroticism',
        drainModifier: personalityToModifier(neuroticism), // For stress, "drain" means it increases
        recoveryModifier: -personalityToModifier(neuroticism), // Negative = slower recovery
      });
    }

    // Conscientiousness effects
    if (conscientiousness > 50) {
      // High C = better focus recovery
      modifiers.push({
        resourceKey: 'focus',
        source: 'high conscientiousness',
        drainModifier: 0,
        recoveryModifier: personalityToModifier(conscientiousness),
      });
    }
    if (conscientiousness < 50) {
      // Low C = motivation drains faster
      modifiers.push({
        resourceKey: 'motivation',
        source: 'low conscientiousness',
        drainModifier: personalityToModifier(100 - conscientiousness), // Invert: low C = high drain
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
        recoveryModifier: personalityToModifier(openness),
      });
    }

    // Agreeableness effects
    if (agreeableness > 50) {
      // High A = social situations less draining
      modifiers.push({
        resourceKey: 'socialBattery',
        source: 'high agreeableness',
        drainModifier: 0,
        recoveryModifier: personalityToModifier(agreeableness),
      });
    }

    return modifiers;
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
   * @param speedMultiplier - Simulation speed (1 = normal, higher = faster drain/recovery)
   */
  applyTickUpdate(speedMultiplier: number): void {
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
