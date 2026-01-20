import { makeAutoObservable } from 'mobx';
import type {
  CharacterData,
  Personality,
  Capacities,
  Resources,
} from './types';

/**
 * Character entity - the core game object representing a patient.
 * Uses class-based pattern to mirror Unreal Actor structure.
 * All properties are observable, all methods are actions.
 */
export class Character {
  id: string;
  name: string;
  personality: Personality;
  capacities: Capacities;
  resources: Resources;

  constructor(data: CharacterData) {
    this.id = data.id;
    this.name = data.name;
    this.personality = data.personality;
    this.capacities = data.capacities;
    this.resources = data.resources;

    // Makes all properties observable and all methods actions
    makeAutoObservable(this);
  }

  // Computed: display name with fallback
  get displayName(): string {
    return this.name.trim() || 'Unnamed Character';
  }

  // Computed: basic validation
  get isValid(): boolean {
    return this.name.trim().length > 0;
  }

  // Action: update name
  setName(name: string): void {
    this.name = name;
  }

  // Action: update personality dimensions
  updatePersonality(updates: Partial<Personality>): void {
    Object.assign(this.personality, updates);
  }

  // Action: update capacities
  updateCapacities(updates: Partial<Capacities>): void {
    Object.assign(this.capacities, updates);
  }

  // Action: update resources
  updateResources(updates: Partial<Resources>): void {
    Object.assign(this.resources, updates);
  }
}
