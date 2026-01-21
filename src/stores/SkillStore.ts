import { makeAutoObservable, observable } from 'mobx';
import { Skill } from '../entities/Skill';
import type {
  SkillDomain,
  SkillData,
  SkillState,
  PrerequisiteStatus,
} from '../entities/types';
import { STARTER_SKILLS } from '../data/skills';
import type { RootStore } from './RootStore';

// All skill domains
export const DOMAINS: SkillDomain[] = [
  'social',
  'organisational',
  'analytical',
  'physical',
  'creative',
];

export class SkillStore {
  skills = observable.map<string, Skill>();
  domainXP = observable.map<SkillDomain, number>();

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);

    // Initialize all domains with 0 XP
    for (const domain of DOMAINS) {
      this.domainXP.set(domain, 0);
    }

    // Seed starter skills
    this.seedSkills(STARTER_SKILLS);

    // Starting XP for testing unlocks
    this.domainXP.set('social', 100);
    this.domainXP.set('organisational', 50);
    this.domainXP.set('physical', 100);
  }

  get skillsArray(): Skill[] {
    return Array.from(this.skills.values());
  }

  skillsByDomain(domain: SkillDomain): Skill[] {
    return this.skillsArray.filter((skill) => skill.domain === domain);
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  // Check if a skill can be unlocked (all prerequisites met)
  isUnlockable(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // Already unlocked
    if (skill.level > 0) return false;

    // All prerequisites must be at least level 1
    return skill.prerequisites.every(
      (prereqId) => (this.skills.get(prereqId)?.level ?? 0) >= 1
    );
  }

  // Get the current state of a skill
  getSkillState(skillId: string): SkillState {
    const skill = this.skills.get(skillId);
    if (!skill) return 'locked';

    if (skill.level >= 5) return 'mastered';
    if (skill.level >= 1) return 'unlocked';
    if (this.isUnlockable(skillId)) return 'unlockable';
    return 'locked';
  }

  // Get progress for each prerequisite
  getPrerequisiteProgress(skillId: string): PrerequisiteStatus[] {
    const skill = this.skills.get(skillId);
    if (!skill) return [];

    return skill.prerequisites.map((prereqId) => {
      const prereq = this.skills.get(prereqId);
      const current = prereq?.level ?? 0;
      return {
        skillId: prereqId,
        name: prereq?.name ?? 'Unknown',
        required: 1,
        current,
        met: current >= 1,
      };
    });
  }

  // Check if player can afford to unlock/level up a skill
  canAffordUnlock(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    const currentXP = this.domainXP.get(skill.domain) ?? 0;
    return currentXP >= skill.nextLevelCost;
  }

  // Seed the store with skill data and validate the dependency graph
  seedSkills(skillDataList: SkillData[]): void {
    for (const data of skillDataList) {
      const skill = new Skill(data);
      this.skills.set(data.id, skill);
    }
    this.validateDAG();
  }

  // Validate that the skill dependency graph is acyclic using Kahn's algorithm
  private validateDAG(): boolean {
    // Build in-degree map (count incoming edges / dependencies for each skill)
    const inDegree = new Map<string, number>();
    const skillIds = Array.from(this.skills.keys());

    // Initialize in-degree to 0 for all skills
    for (const id of skillIds) {
      inDegree.set(id, 0);
    }

    // Count dependencies (prerequisites are incoming edges)
    for (const skill of this.skills.values()) {
      for (const prereqId of skill.prerequisites) {
        if (this.skills.has(prereqId)) {
          // prereqId -> skill.id edge means skill has a dependency
          inDegree.set(skill.id, (inDegree.get(skill.id) ?? 0) + 1);
        }
      }
    }

    // Start with skills that have no prerequisites (in-degree 0)
    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    let visited = 0;
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === undefined) break;
      visited++;

      // Find skills that depend on current (current is a prereq for them)
      for (const skill of this.skills.values()) {
        if (skill.prerequisites.includes(current)) {
          const newDegree = (inDegree.get(skill.id) ?? 0) - 1;
          inDegree.set(skill.id, newDegree);
          if (newDegree === 0) {
            queue.push(skill.id);
          }
        }
      }
    }

    // If we didn't visit all skills, there's a cycle
    if (visited < skillIds.length) {
      console.warn(
        `[SkillStore] Circular dependency detected in skill graph! ` +
          `Visited ${visited}/${skillIds.length} skills.`
      );
      return false;
    }

    return true;
  }

  // Attempt to unlock or level up a skill
  unlockSkillLevel(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // Check prerequisites for unlocking (level 0 -> 1)
    if (skill.level === 0 && !this.isUnlockable(skillId)) {
      return false;
    }

    // Check if already mastered
    if (skill.level >= 5) {
      return false;
    }

    // Check affordability
    if (!this.canAffordUnlock(skillId)) {
      return false;
    }

    // Deduct XP and level up
    const currentXP = this.domainXP.get(skill.domain) ?? 0;
    this.domainXP.set(skill.domain, currentXP - skill.nextLevelCost);
    skill.levelUp();

    return true;
  }

  // Add domain XP (called by activities in Phase 4)
  addDomainXP(domain: SkillDomain, amount: number): void {
    const current = this.domainXP.get(domain) ?? 0;
    this.domainXP.set(domain, current + amount);
  }

  // Expose root store for cross-store access
  get rootStore(): RootStore {
    return this.root;
  }
}
