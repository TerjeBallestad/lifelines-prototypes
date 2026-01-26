import type { ActivityData } from '../entities/types';

/**
 * Starter activities representing daily life tasks across domains.
 * Designed to:
 * - Cover all 3 active skill domains (social, organisational, physical)
 * - Mix duration modes (fixed, threshold, variable)
 * - Balance drain vs restore activities
 * - Provide meaningful progression with skills
 */
export const STARTER_ACTIVITIES: Array<ActivityData> = [
  // === SOCIAL DOMAIN ===
  {
    id: 'chat-with-neighbor',
    name: 'Chat with Neighbor',
    description: 'Have a brief conversation in the hallway',
    domain: 'social',
    durationMode: { type: 'fixed', ticks: 20 },
    capacityProfile: {
      emotionalRegulation: 40, // Basic emotional control needed
    },
    baseXPRate: 1.5,
    startRequirements: { minOverskudd: 15 },
    baseDifficulty: 2,
    skillRequirements: [
      { skillId: 'small-talk', weight: 1.0, maxReduction: 0.8 },
      { skillId: 'eye-contact', weight: 0.5, maxReduction: 0.4 },
    ],
    tags: ['social'],
    needEffects: {
      social: 2, // Small social need restoration
    },
  },
  {
    id: 'phone-call-practice',
    name: 'Practice Phone Call',
    description: 'Call a friend to practice conversation skills',
    domain: 'social',
    durationMode: { type: 'variable', baseTicks: 30 },
    capacityProfile: {
      attentionSpan: 50, // Need to stay focused on conversation
      emotionalRegulation: 55, // Phone anxiety requires regulation
      workingMemory: 45, // Remember conversation context
    },
    baseXPRate: 2.0,
    startRequirements: { minOverskudd: 25 },
    baseDifficulty: 4,
    skillRequirements: [
      { skillId: 'phone-call', weight: 1.0, maxReduction: 1.0 },
      { skillId: 'small-talk', weight: 0.5, maxReduction: 0.5 },
    ],
    tags: ['social', 'stressful', 'concentration'],
    needEffects: {
      social: 1.5, // Less than in-person
    },
  },

  // === ORGANISATIONAL DOMAIN ===
  {
    id: 'plan-tomorrow',
    name: 'Plan Tomorrow',
    description: 'Write out a simple plan for the next day',
    domain: 'organisational',
    durationMode: { type: 'fixed', ticks: 15 },
    capacityProfile: {
      convergentThinking: 45, // Need to prioritize and decide
      workingMemory: 40, // Hold tomorrow's tasks in mind
    },
    baseXPRate: 1.0,
    startRequirements: { minOverskudd: 10 },
    baseDifficulty: 2,
    skillRequirements: [
      { skillId: 'make-list', weight: 1.0, maxReduction: 0.8 },
      { skillId: 'follow-routine', weight: 0.3, maxReduction: 0.3 },
    ],
    tags: ['routine', 'concentration'],
    needEffects: {
      security: 1, // Planning creates sense of security
    },
  },
  {
    id: 'tidy-room',
    name: 'Tidy Room',
    description: 'Clean and organize the living space',
    domain: 'organisational',
    durationMode: { type: 'variable', baseTicks: 40 },
    capacityProfile: {
      attentionSpan: 50, // Sustained attention to finish
      processingSpeed: 45, // Efficient movement helps
      convergentThinking: 40, // Deciding where things go
    },
    baseXPRate: 1.5,
    startRequirements: { minOverskudd: 20, minEnergy: 30 },
    baseDifficulty: 3,
    skillRequirements: [
      { skillId: 'follow-routine', weight: 1.0, maxReduction: 0.8 },
      { skillId: 'make-list', weight: 0.4, maxReduction: 0.4 },
    ],
    tags: ['routine'],
    needEffects: {
      hygiene: 1, // Clean space
      security: 0.5, // Sense of control
    },
  },

  // === PHYSICAL DOMAIN ===
  {
    id: 'go-for-walk',
    name: 'Go for a Walk',
    description: 'Take a short walk around the block',
    domain: 'physical',
    durationMode: { type: 'fixed', ticks: 25 },
    capacityProfile: {
      emotionalRegulation: 35, // Handle being outside
    },
    baseXPRate: 1.5,
    startRequirements: { minOverskudd: 15 },
    baseDifficulty: 2,
    skillRequirements: [
      { skillId: 'go-outside', weight: 1.0, maxReduction: 0.8 },
      { skillId: 'walk-neighborhood', weight: 0.5, maxReduction: 0.5 },
    ],
    tags: ['solo'],
    needEffects: {
      fun: 1, // Enjoyable activity
    },
  },
  {
    id: 'visit-store',
    name: 'Visit the Store',
    description: 'Walk to nearby store and buy a few items',
    domain: 'physical',
    durationMode: { type: 'variable', baseTicks: 45 },
    capacityProfile: {
      workingMemory: 55, // Remember shopping list
      attentionSpan: 50, // Navigate store without distraction
      emotionalRegulation: 60, // Handle crowds and decisions
      processingSpeed: 45, // Process store stimuli
    },
    baseXPRate: 2.5,
    startRequirements: { minOverskudd: 25, minEnergy: 40 },
    baseDifficulty: 4,
    skillRequirements: [
      { skillId: 'go-to-store', weight: 1.0, maxReduction: 1.0 },
      { skillId: 'go-outside', weight: 0.3, maxReduction: 0.3 },
      { skillId: 'make-list', weight: 0.3, maxReduction: 0.3 },
    ],
    tags: ['social', 'stressful'],
    needEffects: {}, // No immediate need restoration
  },

  // === PHYSIOLOGICAL ACTIVITIES ===
  {
    id: 'eat-meal',
    name: 'Eat a Meal',
    description: 'Prepare and eat a simple meal',
    domain: 'physical',
    durationMode: { type: 'fixed', ticks: 20 },
    capacityProfile: {}, // Anyone can eat
    baseXPRate: 0.5,
    startRequirements: {}, // Can always eat
    baseDifficulty: 0, // Zero cost - survival activity
    skillRequirements: [],
    tags: ['solo', 'routine'],
    needEffects: {
      hunger: 5, // Primary hunger restoration
      energy: 1, // Small energy boost from food
    },
  },
  {
    id: 'eat-snack',
    name: 'Have a Snack',
    description: 'Grab a quick snack',
    domain: 'physical',
    durationMode: { type: 'fixed', ticks: 8 },
    capacityProfile: {},
    baseXPRate: 0.2,
    startRequirements: {},
    baseDifficulty: 0, // Zero cost - survival activity
    skillRequirements: [],
    tags: ['solo'],
    needEffects: {
      hunger: 2, // Small hunger restoration
    },
  },
  {
    id: 'use-bathroom',
    name: 'Use Bathroom',
    description: 'Take a bathroom break',
    domain: 'physical',
    durationMode: { type: 'fixed', ticks: 5 },
    capacityProfile: {},
    baseXPRate: 0,
    startRequirements: {},
    baseDifficulty: 0, // Zero cost - survival activity
    skillRequirements: [],
    tags: ['solo'],
    needEffects: {
      bladder: 8, // High bladder restoration
    },
  },
  {
    id: 'take-shower',
    name: 'Take a Shower',
    description: 'Clean up with a refreshing shower',
    domain: 'physical',
    durationMode: { type: 'fixed', ticks: 15 },
    capacityProfile: {},
    baseXPRate: 0.3,
    startRequirements: {},
    baseDifficulty: 1,
    skillRequirements: [],
    tags: ['solo', 'routine'],
    needEffects: {
      hygiene: 6, // Primary hygiene restoration
      energy: 0.5, // Slightly refreshing
    },
  },

  // === RESTORATIVE ACTIVITIES ===
  {
    id: 'rest',
    name: 'Rest',
    description: 'Lie down and relax for a while',
    domain: 'physical',
    durationMode: { type: 'needThreshold', need: 'energy', target: 80 },
    capacityProfile: {}, // No capacity requirements - anyone can rest
    baseXPRate: 0.5, // Low XP for resting
    startRequirements: {}, // Can always rest
    baseDifficulty: 0, // Zero cost - survival activity
    skillRequirements: [], // Anyone can rest
    tags: ['solo'],
    needEffects: {
      energy: 3, // Restores energy need
    },
  },
  {
    id: 'solo-hobby',
    name: 'Solo Hobby Time',
    description: 'Spend time on a personal hobby alone',
    domain: 'creative', // Creative domain (exists in types but no skills yet)
    durationMode: { type: 'fixed', ticks: 35 },
    capacityProfile: {
      divergentThinking: 45, // Creativity helps with hobbies
      attentionSpan: 40, // Stay engaged
    },
    baseXPRate: 1.0,
    startRequirements: { minOverskudd: 10 },
    baseDifficulty: 2,
    skillRequirements: [], // No skill requirements for hobbies
    tags: ['solo', 'creative'],
    needEffects: {
      fun: 2, // Entertainment satisfaction
    },
  },
];
