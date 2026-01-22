import type { TalentData } from '../entities/types';

/**
 * Talent pool for roguelike selection.
 * MVP scope: Only resource and capacity effects.
 * Distribution: ~5 common, ~3 rare, ~2 epic
 * ~30% have tradeoffs (upside AND downside)
 */
export const TALENTS: TalentData[] = [
  // === COMMON (70% spawn rate) ===
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Stress builds 15% slower',
    rarity: 'common',
    domain: 'physical',
    effects: [
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'stress',
        value: -0.15,
        description: 'Stress builds 15% slower',
      },
    ],
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Social battery drains 15% slower',
    rarity: 'common',
    domain: 'social',
    effects: [
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'socialBattery',
        value: -0.15,
        description: 'Social battery drains 15% slower',
      },
    ],
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Energy drains 10% slower, but focus drains 10% faster',
    rarity: 'common',
    domain: null,
    effects: [
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'energy',
        value: -0.1,
        description: 'Energy drains 10% slower',
      },
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'focus',
        value: 0.1,
        description: 'Focus drains 10% faster',
      },
    ],
  },
  {
    id: 'optimist',
    name: 'Optimist',
    description: 'Mood recovers 20% faster',
    rarity: 'common',
    domain: null,
    effects: [
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'mood',
        value: 0.2,
        description: 'Mood recovers 20% faster',
      },
    ],
  },
  {
    id: 'steady_hands',
    name: 'Steady Hands',
    description: 'Overskudd drains 10% slower',
    rarity: 'common',
    domain: 'physical',
    effects: [
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'overskudd',
        value: -0.1,
        description: 'Overskudd drains 10% slower',
      },
    ],
  },

  // === RARE (25% spawn rate) ===
  {
    id: 'hyperfocus',
    name: 'Hyperfocus',
    description:
      '+15 convergent thinking, but social battery drains 20% faster',
    rarity: 'rare',
    domain: 'analytical',
    effects: [
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'convergentThinking',
        value: 15,
        description: 'Convergent Thinking +15',
      },
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'socialBattery',
        value: 0.2,
        description: 'Social battery drains 20% faster',
      },
    ],
  },
  {
    id: 'creative_mind',
    name: 'Creative Mind',
    description: '+15 divergent thinking',
    rarity: 'rare',
    domain: 'creative',
    effects: [
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'divergentThinking',
        value: 15,
        description: 'Divergent Thinking +15',
      },
    ],
  },
  {
    id: 'organized',
    name: 'Organized',
    description: '+20 working memory, but energy drains 10% faster',
    rarity: 'rare',
    domain: 'organisational',
    effects: [
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'workingMemory',
        value: 20,
        description: 'Working Memory +20',
      },
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'energy',
        value: 0.1,
        description: 'Energy drains 10% faster',
      },
    ],
  },

  // === EPIC (5% spawn rate) - intentionally powerful ===
  {
    id: 'second_wind',
    name: 'Second Wind',
    description: '+10 attention span and +10 emotional regulation',
    rarity: 'epic',
    domain: 'physical',
    effects: [
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'attentionSpan',
        value: 10,
        description: 'Attention Span +10',
      },
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'emotionalRegulation',
        value: 10,
        description: 'Emotional Regulation +10',
      },
    ],
  },
  {
    id: 'flow_state',
    name: 'Flow State',
    description:
      'All capacities +10, overskudd drains 20% faster (chaotic power)',
    rarity: 'epic',
    domain: null,
    effects: [
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'divergentThinking',
        value: 10,
        description: 'Divergent Thinking +10',
      },
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'convergentThinking',
        value: 10,
        description: 'Convergent Thinking +10',
      },
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'workingMemory',
        value: 10,
        description: 'Working Memory +10',
      },
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'attentionSpan',
        value: 10,
        description: 'Attention Span +10',
      },
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'processingSpeed',
        value: 10,
        description: 'Processing Speed +10',
      },
      {
        type: 'flat',
        target: 'capacity',
        targetKey: 'emotionalRegulation',
        value: 10,
        description: 'Emotional Regulation +10',
      },
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'overskudd',
        value: 0.2,
        description: 'Overskudd drains 20% faster',
      },
    ],
  },
];
