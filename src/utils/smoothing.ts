/**
 * Exponential smoothing utilities for the derived wellbeing system.
 *
 * Exponential Moving Average (EMA) creates natural-feeling lag in value changes,
 * preventing jarring jumps and making derived stats feel more organic. Different
 * alpha values create different responsiveness:
 * - alpha = 0.1: Moderate lag (mood)
 * - alpha = 0.05: Slow response (purpose)
 * - alpha = 0.01: Very slow response (nutrition)
 *
 * Formula: current = current + alpha * (target - current)
 */

/**
 * A smoothed value that uses exponential moving average for gradual transitions.
 *
 * Instead of jumping directly to a new value, SmoothedValue gradually approaches
 * the target over multiple updates. The alpha parameter controls how quickly
 * it responds: lower alpha = slower response, higher alpha = faster response.
 *
 * @example
 * const mood = new SmoothedValue(50, 0.1);
 * mood.update(80);  // Returns ~53 (moved 10% toward 80)
 * mood.update(80);  // Returns ~55.7 (continues moving)
 * mood.update(80);  // Returns ~58.1 (continues converging)
 */
export class SmoothedValue {
  private current: number;
  private alpha: number;

  /**
   * Creates a new smoothed value.
   *
   * @param initialValue - Starting value
   * @param alpha - Smoothing factor (0-1). Lower = smoother/slower. Default 0.1.
   */
  constructor(initialValue: number, alpha: number = 0.1) {
    this.current = initialValue;
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  /**
   * Updates the smoothed value toward a target.
   *
   * Uses the EMA formula: new = old + alpha * (target - old)
   *
   * @param target - The target value to move toward
   * @returns The new smoothed current value
   */
  update(target: number): number {
    this.current = this.current + this.alpha * (target - this.current);
    return this.current;
  }

  /**
   * Gets the current smoothed value without updating.
   *
   * @returns The current value
   */
  getValue(): number {
    return this.current;
  }

  /**
   * Sets the current value directly, bypassing smoothing.
   * Useful for initialization or hard resets.
   *
   * @param value - The new current value
   */
  setValue(value: number): void {
    this.current = value;
  }

  /**
   * Updates the smoothing alpha factor.
   * Useful for dynamic responsiveness (e.g., faster updates during rapid changes).
   *
   * @param alpha - New smoothing factor (0-1), clamped to valid range
   */
  setAlpha(alpha: number): void {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  /**
   * Gets the current alpha value.
   *
   * @returns The current smoothing factor
   */
  getAlpha(): number {
    return this.alpha;
  }
}
