/**
 * Weighted random sampling without replacement.
 * Uses cumulative weight algorithm for unbiased selection.
 */

/**
 * Sample N indices from weights array without replacement.
 * Higher weight = higher probability of selection.
 *
 * @param weights - Array of positive weights
 * @param sampleSize - Number of items to sample (N)
 * @returns Array of N unique indices into weights array
 * @throws Error if sampleSize > weights.length
 */
export function weightedSampleWithoutReplacement(
  weights: number[],
  sampleSize: number
): number[] {
  if (sampleSize > weights.length) {
    throw new Error(
      `Sample size (${sampleSize}) exceeds population (${weights.length})`
    );
  }

  const indices: number[] = [];
  const availableWeights = [...weights];
  const availableIndices = weights.map((_, i) => i);

  for (let i = 0; i < sampleSize; i++) {
    // Build cumulative weights
    const cumulative: number[] = [];
    let sum = 0;
    for (const w of availableWeights) {
      sum += w;
      cumulative.push(sum);
    }

    // Random selection using cumulative distribution
    const rand = Math.random() * sum;
    const selectedIdx = cumulative.findIndex((c) => c >= rand);

    // Record selection and remove from pool
    indices.push(availableIndices[selectedIdx]);
    availableWeights.splice(selectedIdx, 1);
    availableIndices.splice(selectedIdx, 1);
  }

  return indices;
}
