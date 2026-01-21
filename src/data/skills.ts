import type { SkillData } from '../entities/types';

/**
 * Starter skills representing adult life skills across multiple domains.
 * Forms a meaningful dependency tree with:
 * - 8 skills total (meets INFR-03: 5-8 skills)
 * - 3 domains represented (social, organisational, physical)
 * - Max depth of 2 (eye-contact -> small-talk -> phone-call)
 * - Cross-domain dependency (go-to-store needs organisational + physical)
 * - Multiple root skills (eye-contact, make-list, go-outside)
 */
export const STARTER_SKILLS: SkillData[] = [
  // Social Domain (3 skills, chain)
  {
    id: 'eye-contact',
    name: 'Eye Contact',
    description: 'Maintain brief eye contact during conversation',
    domain: 'social',
    prerequisites: [],
  },
  {
    id: 'small-talk',
    name: 'Small Talk',
    description: 'Exchange pleasantries with acquaintances',
    domain: 'social',
    prerequisites: ['eye-contact'],
  },
  {
    id: 'phone-call',
    name: 'Phone Call',
    description: 'Make and receive phone calls',
    domain: 'social',
    prerequisites: ['small-talk'],
  },

  // Organisational Domain (2 skills, chain)
  {
    id: 'make-list',
    name: 'Make a List',
    description: 'Create simple to-do lists',
    domain: 'organisational',
    prerequisites: [],
  },
  {
    id: 'follow-routine',
    name: 'Follow Routine',
    description: 'Stick to a basic daily routine',
    domain: 'organisational',
    prerequisites: ['make-list'],
  },

  // Physical Domain (3 skills, branching DAG)
  {
    id: 'go-outside',
    name: 'Go Outside',
    description: 'Leave the house briefly',
    domain: 'physical',
    prerequisites: [],
  },
  {
    id: 'walk-neighborhood',
    name: 'Walk Neighborhood',
    description: 'Take short walks around the block',
    domain: 'physical',
    prerequisites: ['go-outside'],
  },
  {
    id: 'go-to-store',
    name: 'Go to Store',
    description: 'Visit a nearby store with a shopping list',
    domain: 'physical',
    prerequisites: ['go-outside', 'make-list'], // Cross-domain dependency!
  },
];
