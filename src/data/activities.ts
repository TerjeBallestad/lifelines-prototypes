import type { ActivityData } from '../entities/types';

/**
 * Starter activities representing daily life tasks across domains.
 * Designed to:
 * - Cover all 3 active skill domains (social, organisational, physical)
 * - Mix duration modes (fixed, threshold, variable)
 * - Balance drain vs restore activities
 * - Provide meaningful progression with skills
 */
export const STARTER_ACTIVITIES: ActivityData[] = [
  // === SOCIAL DOMAIN ===
  {
    id: 'chat-with-neighbor',
    name: 'Chat with Neighbor',
    description: 'Have a brief conversation in the hallway',
    domain: 'social',
    durationMode: { type: 'fixed', ticks: 20 },
    resourceEffects: {
      socialBattery: -2, // Drains social battery
      energy: -0.5, // Slight energy cost
      mood: 0.5, // Small mood boost
    },
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
  },
  {
    id: 'phone-call-practice',
    name: 'Practice Phone Call',
    description: 'Call a friend to practice conversation skills',
    domain: 'social',
    durationMode: { type: 'variable', baseTicks: 30 },
    resourceEffects: {
      socialBattery: -3,
      stress: 2, // Stress increases (phones are hard!)
      focus: -1,
    },
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
  },

  // === ORGANISATIONAL DOMAIN ===
  {
    id: 'plan-tomorrow',
    name: 'Plan Tomorrow',
    description: 'Write out a simple plan for the next day',
    domain: 'organisational',
    durationMode: { type: 'fixed', ticks: 15 },
    resourceEffects: {
      focus: -1,
      motivation: 1, // Planning increases motivation
      stress: -0.5, // Reduces stress (things feel under control)
    },
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
  },
  {
    id: 'tidy-room',
    name: 'Tidy Room',
    description: 'Clean and organize the living space',
    domain: 'organisational',
    durationMode: { type: 'variable', baseTicks: 40 },
    resourceEffects: {
      energy: -1.5,
      focus: -0.5,
      mood: 0.3, // Clean space improves mood
      overskudd: -1,
    },
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
  },

  // === PHYSICAL DOMAIN ===
  {
    id: 'go-for-walk',
    name: 'Go for a Walk',
    description: 'Take a short walk around the block',
    domain: 'physical',
    durationMode: { type: 'fixed', ticks: 25 },
    resourceEffects: {
      energy: -1,
      stress: -1, // Walking reduces stress
      mood: 0.8, // Fresh air improves mood
      nutrition: -0.3,
    },
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
  },
  {
    id: 'visit-store',
    name: 'Visit the Store',
    description: 'Walk to nearby store and buy a few items',
    domain: 'physical',
    durationMode: { type: 'variable', baseTicks: 45 },
    resourceEffects: {
      energy: -2,
      socialBattery: -1.5, // Store involves people
      stress: 1, // Stores can be overwhelming
      nutrition: 2, // Get food!
    },
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
  },

  // === RESTORATIVE ACTIVITIES ===
  {
    id: 'rest',
    name: 'Rest',
    description: 'Lie down and relax for a while',
    domain: 'physical',
    durationMode: { type: 'threshold', resource: 'energy', target: 80 },
    resourceEffects: {
      energy: 3, // RESTORE energy
      stress: -1, // Reduces stress
      focus: 0.5, // Slight focus recovery
    },
    capacityProfile: {}, // No capacity requirements - anyone can rest
    baseXPRate: 0.5, // Low XP for resting
    startRequirements: {}, // Can always rest
    baseDifficulty: 1,
    skillRequirements: [], // Anyone can rest
  },
  {
    id: 'solo-hobby',
    name: 'Solo Hobby Time',
    description: 'Spend time on a personal hobby alone',
    domain: 'creative', // Creative domain (exists in types but no skills yet)
    durationMode: { type: 'fixed', ticks: 35 },
    resourceEffects: {
      socialBattery: 2, // RESTORE social battery (recharge alone)
      energy: -0.5,
      mood: 1,
      motivation: 0.5,
    },
    capacityProfile: {
      divergentThinking: 45, // Creativity helps with hobbies
      attentionSpan: 40, // Stay engaged
    },
    baseXPRate: 1.0,
    startRequirements: { minOverskudd: 10 },
    baseDifficulty: 2,
    skillRequirements: [], // No skill requirements for hobbies
  },
];
