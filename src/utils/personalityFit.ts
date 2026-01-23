import type { Personality } from '../entities/types';

/**
 * Result of personality alignment calculation for an activity.
 * Aligned activities have lower costs and higher gains.
 */
export interface ActivityAlignment {
  /** Cost multiplier (0.6-1.4 range, aligned = lower cost) */
  costMultiplier: number;
  /** Gain multiplier (0.6-1.4 range, aligned = higher gain) */
  gainMultiplier: number;
  /** Breakdown of trait contributions for debugging/tooltips */
  breakdown: Array<{ trait: string; contribution: number }>;
}

/**
 * Calculate personality alignment modifiers for an activity.
 *
 * Activities declare personality alignment via tags (e.g., 'social', 'creative').
 * This function matches those tags against Big Five personality traits to compute
 * cost and gain multipliers.
 *
 * **Tag-to-trait mappings:**
 * - 'social' → Extraversion (extroverts benefit)
 * - 'solo' → Extraversion inverse (introverts benefit)
 * - 'creative' → Openness (high openness benefits)
 * - 'routine' → Conscientiousness (high conscientiousness benefits)
 * - 'cooperative' → Agreeableness (high agreeableness benefits)
 * - 'stressful' → Neuroticism (high neuroticism penalized)
 * - 'concentration' → Conscientiousness (high conscientiousness benefits)
 *
 * **Modifier strength:** 25-40% (clamped to 0.6-1.4 range)
 * - Trait contribution: (trait - 50) / 100 * 0.3
 * - Example: Extraversion 80, 'social' tag → (80-50)/100*0.3 = 0.09
 * - costMultiplier = 1.0 - 0.09 = 0.91 (9% cheaper)
 * - gainMultiplier = 1.0 + 0.09 = 1.09 (9% more restoration)
 *
 * **Inverse tags:** 'solo' applies opposite direction from 'social'
 *
 * @param tags - Activity tags (undefined if no alignment)
 * @param personality - Character's Big Five personality traits
 * @returns ActivityAlignment with cost/gain multipliers and breakdown
 */
export function calculatePersonalityAlignment(
  tags: string[] | undefined,
  personality: Personality
): ActivityAlignment {
  // Default: no alignment (neutral multipliers)
  if (!tags || tags.length === 0) {
    return {
      costMultiplier: 1.0,
      gainMultiplier: 1.0,
      breakdown: [],
    };
  }

  const breakdown: Array<{ trait: string; contribution: number }> = [];
  let totalContribution = 0;

  // Strength factor for trait contributions (0.3 = 30% max modifier)
  const STRENGTH = 0.3;

  // Helper: Calculate trait contribution
  // (trait - 50) / 100 * strength
  // Trait 50 = 0, Trait 80 = +0.09, Trait 20 = -0.09
  const traitContribution = (traitValue: number): number => {
    return ((traitValue - 50) / 100) * STRENGTH;
  };

  // Process each tag
  for (const tag of tags) {
    switch (tag) {
      case 'social': {
        // Extroverts benefit from social activities
        const contrib = traitContribution(personality.extraversion);
        breakdown.push({ trait: 'Extraversion (social)', contribution: contrib });
        totalContribution += contrib;
        break;
      }

      case 'solo': {
        // Introverts benefit from solo activities (inverse of social)
        const contrib = -traitContribution(personality.extraversion);
        breakdown.push({ trait: 'Extraversion (solo)', contribution: contrib });
        totalContribution += contrib;
        break;
      }

      case 'creative': {
        // High openness benefits creative activities
        const contrib = traitContribution(personality.openness);
        breakdown.push({ trait: 'Openness (creative)', contribution: contrib });
        totalContribution += contrib;
        break;
      }

      case 'routine': {
        // High conscientiousness benefits routine activities
        const contrib = traitContribution(personality.conscientiousness);
        breakdown.push({
          trait: 'Conscientiousness (routine)',
          contribution: contrib,
        });
        totalContribution += contrib;
        break;
      }

      case 'cooperative': {
        // High agreeableness benefits cooperative activities
        const contrib = traitContribution(personality.agreeableness);
        breakdown.push({
          trait: 'Agreeableness (cooperative)',
          contribution: contrib,
        });
        totalContribution += contrib;
        break;
      }

      case 'stressful': {
        // High neuroticism penalized by stressful activities (inverse)
        const contrib = -traitContribution(personality.neuroticism);
        breakdown.push({ trait: 'Neuroticism (stressful)', contribution: contrib });
        totalContribution += contrib;
        break;
      }

      case 'concentration': {
        // High conscientiousness benefits concentration activities
        const contrib = traitContribution(personality.conscientiousness);
        breakdown.push({
          trait: 'Conscientiousness (concentration)',
          contribution: contrib,
        });
        totalContribution += contrib;
        break;
      }

      default:
        // Unrecognized tag: skip
        break;
    }
  }

  // Clamp total contribution to -0.4 to +0.4 (40% max modifier)
  const clampedContribution = Math.max(-0.4, Math.min(0.4, totalContribution));

  // Cost multiplier: lower is better (aligned = cheaper)
  // Contribution +0.09 -> cost 0.91 (9% cheaper)
  const costMultiplier = Math.max(0.6, Math.min(1.4, 1.0 - clampedContribution));

  // Gain multiplier: higher is better (aligned = more restoration)
  // Contribution +0.09 -> gain 1.09 (9% more restoration)
  const gainMultiplier = Math.max(0.6, Math.min(1.4, 1.0 + clampedContribution));

  return {
    costMultiplier,
    gainMultiplier,
    breakdown,
  };
}
