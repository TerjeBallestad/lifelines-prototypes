/**
 * Mathematical curve utilities for the derived wellbeing system.
 *
 * These functions implement the sigmoid curves and soft bounds described in
 * the GMTK "Why The Sims is a Design Masterpiece" video, adapted for the
 * Lifelines needs-to-mood derivation system.
 */

/**
 * Converts a need value (0-100) to a mood contribution using a sigmoid curve.
 *
 * The sigmoid provides non-linear mapping where:
 * - Low needs (0-30) contribute heavily negative to mood
 * - Mid needs (40-60) are near-neutral
 * - High needs (70-100) contribute positive but with diminishing returns
 *
 * Formula: f(x) = x^lambda / (x^lambda + sigma^lambda)
 * where sigma = 0.5 (inflection point), lambda = steepness
 *
 * The output is then mapped from [0,1] to a contribution range centered at 0:
 * contribution = (sigmoid - 0.5) * 100 * weight
 *
 * @param value - Need value (0-100)
 * @param weight - Importance weight for this need (default 1.0)
 * @param steepness - Lambda parameter controlling curve steepness (default 2.0)
 * @returns Mood contribution (negative for low needs, positive for high needs)
 *
 * @example
 * needToMoodCurve(20)  // Returns ~-35 (low need = negative contribution)
 * needToMoodCurve(50)  // Returns 0 (neutral)
 * needToMoodCurve(80)  // Returns ~28 (high need = positive contribution)
 * needToMoodCurve(80, 1.5)  // Returns ~42 (weighted 1.5x)
 */
export function needToMoodCurve(
  value: number,
  weight = 1.0,
  steepness = 2.0
): number {
  // Normalize value from 0-100 to 0-1
  const x = Math.max(0, Math.min(100, value)) / 100;

  // Sigmoid inflection point (0.5 = centered)
  const sigma = 0.5;

  // Sigmoid formula: x^lambda / (x^lambda + sigma^lambda)
  const xPow = Math.pow(x, steepness);
  const sigmaPow = Math.pow(sigma, steepness);
  const sigmoid = xPow / (xPow + sigmaPow);

  // Map from [0,1] to contribution centered at 0
  // At x=0.5, sigmoid=0.5, contribution=0
  // At x=0, sigmoid=0, contribution=-50*weight
  // At x=1, sigmoid=1, contribution=+50*weight
  const contribution = (sigmoid - 0.5) * 100 * weight;

  return contribution;
}

/**
 * Applies soft bounds that asymptotically approach but never reach min/max.
 *
 * Unlike hard clamping, this creates a "rubber band" effect where values
 * can slightly exceed bounds but are pulled back toward the allowed range.
 * This prevents the jarring feel of hitting a hard cap.
 *
 * @param value - The value to clamp
 * @param min - The soft minimum bound
 * @param max - The soft maximum bound
 * @param strength - How strongly values are pulled back (0-1, default 0.9)
 * @returns The clamped value (may slightly exceed bounds)
 *
 * @example
 * asymptoticClamp(5, 10, 90)   // Returns ~10.5 (slightly below min)
 * asymptoticClamp(50, 10, 90)  // Returns 50 (unchanged)
 * asymptoticClamp(95, 10, 90)  // Returns ~90.5 (slightly above max)
 */
export function asymptoticClamp(
  value: number,
  min: number,
  max: number,
  strength = 0.9
): number {
  if (value < min) {
    // Value is below minimum - pull it back toward min
    // The further below, the less it can exceed
    return min - (min - value) * (1 - strength);
  }

  if (value > max) {
    // Value is above maximum - pull it back toward max
    return max + (value - max) * (1 - strength);
  }

  // Within bounds - return unchanged
  return value;
}
