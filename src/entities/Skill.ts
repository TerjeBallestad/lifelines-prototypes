import { makeAutoObservable } from 'mobx';
import type { SkillData, SkillDomain } from './types';

/**
 * Skill entity - represents a learnable skill in the game.
 * Uses class-based pattern to mirror Character structure.
 * All properties are observable, all methods are actions.
 */
export class Skill {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly domain: SkillDomain;
  readonly prerequisites: Array<string>;
  level: number; // 0-5

  constructor(data: SkillData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.domain = data.domain;
    this.prerequisites = data.prerequisites;
    this.level = 0;

    // Makes all properties observable and all methods actions
    makeAutoObservable(this);
  }

  /**
   * Computed: XP cost to reach next level.
   * Escalating cost curve: 50, 75, 100, 125, 150 for levels 1-5.
   * Returns Infinity if already at max level (5).
   */
  get nextLevelCost(): number {
    if (this.level >= 5) {
      return Infinity;
    }
    const nextLevel = this.level + 1;
    return 50 + (nextLevel - 1) * 25;
  }

  /**
   * Action: Increment level by 1 (max 5).
   */
  levelUp(): void {
    if (this.level < 5) {
      this.level++;
    }
  }

  /**
   * Computed: Whether skill has reached max level (5).
   */
  get isMastered(): boolean {
    return this.level >= 5;
  }
}
