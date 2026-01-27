/**
 * Modifier calculation utilities for personality-to-resource effects.
 *
 * Modifiers affect how resources drain and recover based on personality traits.
 * Per CONTEXT.md: subtle effects (10-20%), additive stacking.
 */

/**
 * Represents a modifier that affects resource drain/recovery rates.
 * Note: ResourceKey type removed in Phase 10.1 - this is legacy v1.0 code.
 */
export type ResourceModifier = {
  /** Which resource this modifier affects */
  resourceKey: string;
  /** Human-readable source description, e.g., "low extraversion" */
  source: string;
  /** Drain rate modifier: -0.2 to +0.2 (negative = slower drain, positive = faster) */
  drainModifier: number;
  /** Recovery rate modifier: -0.2 to +0.2 (negative = slower recovery, positive = faster) */
  recoveryModifier: number;
};

/**
 * Converts a personality trait value (0-100) to a modifier strength (-0.20 to +0.20).
 *
 * Uses linear scaling per RESEARCH.md:
 * - 0 = -0.20 (20% reduction)
 * - 50 = 0 (no effect)
 * - 100 = +0.20 (20% increase)
 *
 * @param traitValue - Personality trait value on 0-100 scale (50 = average)
 * @returns Modifier value between -0.20 and +0.20
 */
export function personalityToModifier(traitValue: number): number {
  return ((traitValue - 50) / 50) * 0.2;
}

/**
 * Combines multiple modifiers using additive stacking.
 * Per CONTEXT.md decision: +10% from E, +5% from N = +15% total.
 *
 * @param modifiers - Array of modifier values (e.g., [0.10, 0.05])
 * @returns Combined modifier value (e.g., 0.15)
 */
export function combineModifiers(modifiers: Array<number>): number {
  return modifiers.reduce((sum, mod) => sum + mod, 0);
}

/**
 * Applies combined modifiers to a base rate.
 * Effective rate = baseRate * (1 + combinedModifier)
 *
 * @param baseRate - The base drain/recovery rate
 * @param modifiers - Array of modifier values to apply
 * @returns Effective rate after modifiers
 *
 * @example
 * // Base drain of 1 unit/tick with +20% modifier
 * applyModifiers(1, [0.20]) // Returns 1.2
 *
 * @example
 * // Base drain of 1 with -10% and +5% modifiers
 * applyModifiers(1, [-0.10, 0.05]) // Returns 0.95
 */
export function applyModifiers(
  baseRate: number,
  modifiers: Array<number>
): number {
  const combined = combineModifiers(modifiers);
  return baseRate * (1 + combined);
}

/**
 * Clamps a resource value to valid bounds.
 * Prevents negative values and overflow beyond maximum.
 *
 * @param value - The resource value to clamp
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (default: 100)
 * @returns Clamped value within [min, max]
 */
export function clampResource(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}
