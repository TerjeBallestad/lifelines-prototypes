/**
 * Asymptotic decay utility for the Primary Needs system.
 * Prevents death spirals by slowing decay as needs approach critical levels.
 */

/**
 * Asymptotic decay: decay slows as value approaches floor.
 *
 * Formula: newValue = currentValue - (baseRate * (currentValue - floor) / 100 * speedMultiplier)
 *
 * This prevents instant bottoming-out while still allowing critical states.
 * As the value approaches the floor, the decay amount decreases proportionally,
 * creating a natural "resistance" to reaching zero.
 *
 * @param currentValue - Current need value (0-100)
 * @param baseDecayRate - Base decay rate from NeedsConfig
 * @param speedMultiplier - Simulation speed multiplier
 * @param floor - Minimum value (default 5, never quite reaches 0)
 * @returns New need value after decay
 */
export function applyAsymptoticDecay(
  currentValue: number,
  baseDecayRate: number,
  speedMultiplier: number,
  floor = 5
): number {
  const distance = currentValue - floor;
  if (distance <= 0) return floor;

  const decayAmount = baseDecayRate * (distance / 100) * speedMultiplier;
  return Math.max(floor, currentValue - decayAmount);
}
