import type { CharacterData, Personality } from '../entities/types';
import { defaultCapacities, defaultResources } from '../entities/types';

/**
 * Archetype configuration for preset characters.
 * Used for emergence testing - each archetype has extreme traits
 * to produce visibly different observable behaviors.
 */
export type ArchetypeConfig = {
  id: string;
  name: string;
  description: string;
  personality: Personality;
  expectedBehavior: string; // What we expect to observe
};

/**
 * 6 preset archetypes with contrasting Big Five traits.
 * Values: 10 = extremely low, 90 = extremely high
 */
export const ARCHETYPES: Array<ArchetypeConfig> = [
  {
    id: 'hermit',
    name: 'The Hermit',
    description: 'Introverted, anxious',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 10, // Extremely introverted
      agreeableness: 50,
      neuroticism: 90, // Extremely anxious
    },
    expectedBehavior:
      'Social battery drains quickly, stress builds easily, avoids social activities',
  },
  {
    id: 'social-butterfly',
    name: 'The Social Butterfly',
    description: 'Extraverted, resilient',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 90, // Extremely extraverted
      agreeableness: 50,
      neuroticism: 10, // Extremely calm
    },
    expectedBehavior:
      'Thrives on social interaction, low stress, mood stays positive',
  },
  {
    id: 'perfectionist',
    name: 'The Perfectionist',
    description: 'Highly conscientious, anxious',
    personality: {
      openness: 50,
      conscientiousness: 90, // Extremely conscientious
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 70, // Moderately anxious
    },
    expectedBehavior:
      'Focus drains slowly, motivation stable, stressed by failure',
  },
  {
    id: 'free-spirit',
    name: 'The Free Spirit',
    description: 'Open, disorganized',
    personality: {
      openness: 90, // Extremely open
      conscientiousness: 10, // Extremely disorganized
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    expectedBehavior:
      'Focus drains quickly, motivation unstable, overskudd varies',
  },
  {
    id: 'competitor',
    name: 'The Competitor',
    description: 'Driven, disagreeable',
    personality: {
      openness: 50,
      conscientiousness: 90, // Extremely conscientious
      extraversion: 50,
      agreeableness: 10, // Extremely disagreeable
      neuroticism: 50,
    },
    expectedBehavior: 'Social battery drains, focus stable, motivation high',
  },
  {
    id: 'peacemaker',
    name: 'The Peacemaker',
    description: 'Agreeable, calm',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 90, // Extremely agreeable
      neuroticism: 10, // Extremely calm
    },
    expectedBehavior:
      'Social battery recovers quickly, mood stable, stress low',
  },
];

/**
 * Creates a character from a preset archetype.
 * @param archetypeId - ID of the archetype to use
 * @returns CharacterData ready to construct a Character
 */
export function createArchetypeCharacter(archetypeId: string): CharacterData {
  const archetype = ARCHETYPES.find((a) => a.id === archetypeId);
  if (!archetype) {
    throw new Error(`Unknown archetype: ${archetypeId}`);
  }

  return {
    id: crypto.randomUUID(),
    name: archetype.name,
    personality: archetype.personality,
    capacities: defaultCapacities(),
    resources: defaultResources(),
  };
}

/**
 * Creates a character with randomized personality traits.
 * @returns CharacterData with random Big Five values
 */
export function createRandomCharacter(): CharacterData {
  return {
    id: crypto.randomUUID(),
    name: 'Random Character',
    personality: {
      openness: Math.random() * 100,
      conscientiousness: Math.random() * 100,
      extraversion: Math.random() * 100,
      agreeableness: Math.random() * 100,
      neuroticism: Math.random() * 100,
    },
    capacities: defaultCapacities(),
    resources: defaultResources(),
  };
}
