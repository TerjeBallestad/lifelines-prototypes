# Architecture Patterns: React + MobX Game Prototype

**Domain:** Arcade life-sim with skill tree / character development (React prototype for Unreal port)
**Researched:** 2026-01-20
**Confidence:** HIGH (MobX official docs, Unreal official docs, verified community patterns)

---

## Executive Summary

This architecture prioritizes **portability to Unreal C++**. The core insight: MobX with OOP classes mirrors Unreal's UCLASS/UPROPERTY pattern almost directly. By organizing game logic into domain stores (not React components), the architecture creates a clean separation that transfers to Unreal's GameInstance/Subsystem/Actor hierarchy.

**Key architectural decisions:**
1. **Root Store pattern** - Single entry point for all game state, maps to Unreal's GameInstance
2. **Domain stores as classes** - Skill, Trait, Talent, Activity stores map to Unreal Subsystems
3. **Entity classes with observables** - Skill, Character classes map to UObjects
4. **Game loop outside React** - requestAnimationFrame-based loop maps to Tick functions
5. **DAG for skill dependencies** - Explicit graph structure, not ad-hoc conditionals

---

## Recommended Architecture

```
                    +------------------+
                    |   React UI       |
                    |  (Presentation)  |
                    +--------+---------+
                             |
                             | observer() - reads state
                             v
                    +------------------+
                    |   Root Store     |  <-- Single entry point
                    |   (GameState)    |      Maps to: UGameInstance
                    +--------+---------+
                             |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
+---------------+    +---------------+    +---------------+
| CharacterStore|    |  SkillStore   |    | ActivityStore |
| (Domain)      |    |  (Domain)     |    | (Domain)      |
+---------------+    +---------------+    +---------------+
Maps to:             Maps to:             Maps to:
UGameInstanceSubsystem  UGameInstanceSubsystem  UGameInstanceSubsystem
        |                    |                    |
        v                    v                    v
+---------------+    +---------------+    +---------------+
|   Character   |    |    Skill      |    |   Activity    |
|   (Entity)    |    |   (Entity)    |    |   (Entity)    |
+---------------+    +---------------+    +---------------+
Maps to:             Maps to:             Maps to:
UObject/AActor       UObject              UObject
```

---

## Component Boundaries

### Layer 1: React UI (Presentation Only)

**Responsibility:** Render state, capture user input, dispatch actions to stores.

**Does NOT contain:**
- Game logic
- State calculations
- Business rules
- Entity references (only IDs)

**Components:**
| Component | Renders | Dispatches To |
|-----------|---------|---------------|
| `SkillTreeView` | Skill nodes, connections, states | SkillStore.attemptUnlock() |
| `CharacterPanel` | Traits, current skills, XP | CharacterStore.assignActivity() |
| `ActivityList` | Available activities | ActivityStore.startActivity() |
| `TalentPicker` | Pick-1-of-3 modal | TalentStore.selectTalent() |
| `GameHUD` | Time, XP, notifications | GameLoopStore.tick() |

**Pattern:**
```typescript
// GOOD: UI component reads from store, dispatches actions
const SkillNode = observer(({ skillId }: { skillId: string }) => {
  const { skillStore } = useRootStore();
  const skill = skillStore.getSkill(skillId);

  return (
    <div
      className={`skill-node ${skill.state}`}
      onClick={() => skillStore.attemptUnlock(skillId)}
    >
      {skill.name} (Lv. {skill.level})
    </div>
  );
});

// BAD: Logic in component
const SkillNode = observer(({ skillId }) => {
  const skill = skillStore.getSkill(skillId);
  const canUnlock = skill.prerequisites.every(p =>
    skillStore.getSkill(p).level > 0  // Logic leak!
  );
  // ...
});
```

**Unreal mapping:** This layer becomes UMG Widgets. UI components that read from game state and call UFUNCTIONs.

---

### Layer 2: Root Store (Game State Container)

**Responsibility:** Single source of truth. Instantiates all domain stores. Provides cross-store access.

**Implementation:**
```typescript
class RootStore {
  characterStore: CharacterStore;
  skillStore: SkillStore;
  traitStore: TraitStore;
  talentStore: TalentStore;
  activityStore: ActivityStore;
  gameLoopStore: GameLoopStore;

  constructor() {
    // All stores receive reference to root for cross-store communication
    this.skillStore = new SkillStore(this);
    this.traitStore = new TraitStore(this);
    this.talentStore = new TalentStore(this);
    this.characterStore = new CharacterStore(this);
    this.activityStore = new ActivityStore(this);
    this.gameLoopStore = new GameLoopStore(this);
  }

  // Serialization for save/load
  get snapshot(): GameSnapshot {
    return {
      character: this.characterStore.snapshot,
      skills: this.skillStore.snapshot,
      // ...
    };
  }

  hydrate(snapshot: GameSnapshot): void {
    this.characterStore.hydrate(snapshot.character);
    this.skillStore.hydrate(snapshot.skills);
    // ...
  }
}
```

**React integration:**
```typescript
const StoreContext = createContext<RootStore | null>(null);

export const useRootStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useRootStore must be used within StoreProvider');
  return store;
};

// In App.tsx
const rootStore = new RootStore();
<StoreContext.Provider value={rootStore}>
  <App />
</StoreContext.Provider>
```

**Unreal mapping:** `UGameInstance` subclass. Holds references to all Subsystems. Persists across level loads.

```cpp
UCLASS()
class ULifelinesGameInstance : public UGameInstance {
  UPROPERTY()
  UCharacterSubsystem* CharacterSubsystem;

  UPROPERTY()
  USkillSubsystem* SkillSubsystem;

  // ...
};
```

---

### Layer 3: Domain Stores (Business Logic)

Each domain store manages one category of game state and its associated logic.

#### SkillStore

**Responsibility:** Skill definitions, unlock states, dependency graph, XP thresholds.

```typescript
class SkillStore {
  @observable private skillsById = new Map<string, Skill>();
  @observable private skillGraph: SkillGraph;

  constructor(private root: RootStore) {
    makeAutoObservable(this);
    this.skillGraph = new SkillGraph();
    this.loadSkillDefinitions();
  }

  @computed get allSkills(): Skill[] {
    return Array.from(this.skillsById.values());
  }

  @computed get unlockedSkills(): Skill[] {
    return this.allSkills.filter(s => s.isUnlocked);
  }

  @computed get unlockableSkills(): Skill[] {
    return this.allSkills.filter(s => this.canUnlock(s.id));
  }

  getSkill(id: string): Skill | undefined {
    return this.skillsById.get(id);
  }

  @action attemptUnlock(skillId: string): boolean {
    const skill = this.getSkill(skillId);
    if (!skill || !this.canUnlock(skillId)) return false;

    const character = this.root.characterStore.currentCharacter;
    if (character.xp < skill.xpCost) return false;

    character.spendXp(skill.xpCost);
    skill.unlock();
    return true;
  }

  canUnlock(skillId: string): boolean {
    const skill = this.getSkill(skillId);
    if (!skill || skill.isUnlocked) return false;

    // Check all prerequisites are unlocked
    return this.skillGraph
      .getPrerequisites(skillId)
      .every(prereqId => this.getSkill(prereqId)?.isUnlocked);
  }

  @action addXpToSkill(skillId: string, amount: number): void {
    const skill = this.getSkill(skillId);
    if (skill) skill.addXp(amount);
  }
}
```

**Unreal mapping:** `UGameInstanceSubsystem` subclass.

```cpp
UCLASS()
class USkillSubsystem : public UGameInstanceSubsystem {
public:
  virtual void Initialize(FSubsystemCollectionBase& Collection) override;

  UFUNCTION(BlueprintCallable)
  USkill* GetSkill(const FString& SkillId);

  UFUNCTION(BlueprintCallable)
  bool AttemptUnlock(const FString& SkillId);

  UFUNCTION(BlueprintCallable)
  bool CanUnlock(const FString& SkillId);

private:
  UPROPERTY()
  TMap<FString, USkill*> SkillsById;

  UPROPERTY()
  USkillGraph* SkillGraph;
};
```

#### CharacterStore

**Responsibility:** Character state, current traits, learned skills, XP pool, active activity.

```typescript
class CharacterStore {
  @observable currentCharacter: Character | null = null;

  constructor(private root: RootStore) {
    makeAutoObservable(this);
  }

  @action createCharacter(data: CharacterData): Character {
    this.currentCharacter = new Character(data, this.root);
    return this.currentCharacter;
  }

  @action assignActivity(activityId: string): void {
    const activity = this.root.activityStore.getActivity(activityId);
    if (activity && this.currentCharacter) {
      this.currentCharacter.startActivity(activity);
    }
  }
}
```

**Unreal mapping:** `UGameInstanceSubsystem` holding current player character reference.

#### ActivityStore

**Responsibility:** Activity definitions, XP generation rates, duration, requirements.

```typescript
class ActivityStore {
  @observable private activitiesById = new Map<string, Activity>();

  constructor(private root: RootStore) {
    makeAutoObservable(this);
    this.loadActivityDefinitions();
  }

  @computed get availableActivities(): Activity[] {
    const character = this.root.characterStore.currentCharacter;
    if (!character) return [];

    return Array.from(this.activitiesById.values())
      .filter(a => this.meetsRequirements(a, character));
  }

  meetsRequirements(activity: Activity, character: Character): boolean {
    return activity.requiredSkills.every(skillId =>
      this.root.skillStore.getSkill(skillId)?.isUnlocked
    );
  }

  @action startActivity(activityId: string): void {
    const activity = this.getActivity(activityId);
    if (!activity) return;

    this.root.gameLoopStore.registerActiveActivity(activity);
  }
}
```

#### TraitStore

**Responsibility:** Trait definitions, effects on character stats/behaviors.

```typescript
class TraitStore {
  @observable private traitsById = new Map<string, TraitDefinition>();

  constructor(private root: RootStore) {
    makeAutoObservable(this);
    this.loadTraitDefinitions();
  }

  getTrait(id: string): TraitDefinition | undefined {
    return this.traitsById.get(id);
  }

  // Calculate how a trait affects a specific stat
  getTraitModifier(traitId: string, stat: string): number {
    const trait = this.getTrait(traitId);
    return trait?.modifiers[stat] ?? 0;
  }
}
```

#### TalentStore

**Responsibility:** Talent pool, selection logic, milestone triggers.

```typescript
class TalentStore {
  @observable private talentsById = new Map<string, TalentDefinition>();
  @observable private selectedTalents: string[] = [];
  @observable currentOffering: TalentDefinition[] | null = null;

  constructor(private root: RootStore) {
    makeAutoObservable(this);
    this.loadTalentDefinitions();
  }

  @computed get availableTalentPool(): TalentDefinition[] {
    return Array.from(this.talentsById.values())
      .filter(t => !this.selectedTalents.includes(t.id));
  }

  @action triggerTalentSelection(): void {
    // Pick 3 random talents from pool
    const pool = this.availableTalentPool;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.currentOffering = shuffled.slice(0, 3);
  }

  @action selectTalent(talentId: string): void {
    if (!this.currentOffering?.some(t => t.id === talentId)) return;

    this.selectedTalents.push(talentId);
    this.currentOffering = null;

    // Apply talent effects
    const talent = this.getTalent(talentId);
    this.applyTalentEffects(talent);
  }
}
```

#### GameLoopStore

**Responsibility:** Time progression, tick updates, active activity processing.

```typescript
class GameLoopStore {
  @observable gameTime = 0;
  @observable isPaused = false;
  @observable private activeActivity: Activity | null = null;

  private animationFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor(private root: RootStore) {
    makeAutoObservable(this);
  }

  start(): void {
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick = (timestamp: number): void => {
    if (this.isPaused) return;

    const deltaTime = (timestamp - this.lastTimestamp) / 1000; // seconds
    this.lastTimestamp = timestamp;

    this.update(deltaTime);

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  @action private update(deltaTime: number): void {
    this.gameTime += deltaTime;

    if (this.activeActivity) {
      this.processActivity(deltaTime);
    }

    // Check for milestone triggers
    this.checkMilestones();
  }

  @action private processActivity(deltaTime: number): void {
    if (!this.activeActivity) return;

    const character = this.root.characterStore.currentCharacter;
    if (!character) return;

    // Generate XP based on activity and traits
    const baseXp = this.activeActivity.xpPerSecond * deltaTime;
    const modifiedXp = this.applyTraitModifiers(baseXp, this.activeActivity);

    // Add XP to relevant skills
    for (const skillId of this.activeActivity.targetSkills) {
      this.root.skillStore.addXpToSkill(skillId, modifiedXp);
    }

    // Drain resources based on traits
    this.applyResourceDrain(deltaTime);
  }

  @action registerActiveActivity(activity: Activity): void {
    this.activeActivity = activity;
  }
}
```

**Unreal mapping:** This becomes the main game Tick function, likely in AGameModeBase or a custom tick manager.

---

### Layer 4: Entity Classes (Data Objects)

Plain classes with observable properties. Each represents a game entity.

#### Skill Entity

```typescript
class Skill {
  @observable id: string;
  @observable name: string;
  @observable description: string;
  @observable level = 0;
  @observable maxLevel: number;
  @observable currentXp = 0;
  @observable xpToNextLevel: number;

  constructor(data: SkillData) {
    makeAutoObservable(this);
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.maxLevel = data.maxLevel;
    this.xpToNextLevel = data.xpToNextLevel;
  }

  @computed get isUnlocked(): boolean {
    return this.level > 0;
  }

  @computed get isMaxed(): boolean {
    return this.level >= this.maxLevel;
  }

  @computed get progress(): number {
    return this.currentXp / this.xpToNextLevel;
  }

  @computed get state(): 'locked' | 'unlockable' | 'unlocked' | 'maxed' {
    if (this.isMaxed) return 'maxed';
    if (this.isUnlocked) return 'unlocked';
    // unlockable is determined by SkillStore (needs dependency check)
    return 'locked';
  }

  @action unlock(): void {
    if (this.level === 0) this.level = 1;
  }

  @action addXp(amount: number): void {
    if (this.isMaxed) return;

    this.currentXp += amount;
    while (this.currentXp >= this.xpToNextLevel && !this.isMaxed) {
      this.currentXp -= this.xpToNextLevel;
      this.level++;
      // Could emit event for level-up notification
    }
  }
}
```

**Unreal mapping:**
```cpp
UCLASS()
class USkill : public UObject {
public:
  UPROPERTY(BlueprintReadOnly)
  FString Id;

  UPROPERTY(BlueprintReadOnly)
  FString Name;

  UPROPERTY(BlueprintReadWrite)
  int32 Level = 0;

  UPROPERTY(BlueprintReadWrite)
  float CurrentXp = 0;

  UPROPERTY(BlueprintReadOnly)
  int32 MaxLevel;

  UPROPERTY(BlueprintReadOnly)
  float XpToNextLevel;

  UFUNCTION(BlueprintCallable)
  bool IsUnlocked() const { return Level > 0; }

  UFUNCTION(BlueprintCallable)
  void Unlock();

  UFUNCTION(BlueprintCallable)
  void AddXp(float Amount);
};
```

#### Character Entity

```typescript
class Character {
  @observable id: string;
  @observable name: string;
  @observable traitIds: string[];
  @observable xp = 0;
  @observable socialEnergy = 100;
  @observable currentActivityId: string | null = null;

  constructor(data: CharacterData, private root: RootStore) {
    makeAutoObservable(this);
    this.id = data.id;
    this.name = data.name;
    this.traitIds = data.traitIds;
  }

  @computed get traits(): TraitDefinition[] {
    return this.traitIds
      .map(id => this.root.traitStore.getTrait(id))
      .filter((t): t is TraitDefinition => t !== undefined);
  }

  @computed get isIntrovert(): boolean {
    return this.traits.some(t => t.id === 'introvert');
  }

  @computed get socialEnergyPercent(): number {
    return this.socialEnergy / 100;
  }

  @action spendXp(amount: number): void {
    this.xp = Math.max(0, this.xp - amount);
  }

  @action gainXp(amount: number): void {
    this.xp += amount;
  }

  @action drainSocialEnergy(amount: number): void {
    this.socialEnergy = Math.max(0, this.socialEnergy - amount);
  }

  @action startActivity(activity: Activity): void {
    this.currentActivityId = activity.id;
  }
}
```

---

## Skill Tree as Directed Acyclic Graph (DAG)

The skill tree MUST be modeled as an explicit DAG, not ad-hoc conditionals. This is critical for:
1. Validating no circular dependencies
2. Computing unlock paths efficiently
3. Visualizing dependency chains
4. Porting cleanly to Unreal

### SkillGraph Implementation

```typescript
interface SkillNode {
  id: string;
  name: string;
  prerequisites: string[]; // IDs of required skills
}

class SkillGraph {
  private nodes = new Map<string, SkillNode>();
  private edges = new Map<string, string[]>(); // skillId -> prerequisite skillIds
  private reverseEdges = new Map<string, string[]>(); // skillId -> dependent skillIds

  addSkill(skill: SkillNode): void {
    this.nodes.set(skill.id, skill);
    this.edges.set(skill.id, skill.prerequisites);

    // Build reverse index for "what does this skill unlock?"
    for (const prereq of skill.prerequisites) {
      const dependents = this.reverseEdges.get(prereq) ?? [];
      dependents.push(skill.id);
      this.reverseEdges.set(prereq, dependents);
    }

    // Validate acyclic on add
    if (this.hasCycle()) {
      throw new Error(`Adding skill ${skill.id} creates a cycle`);
    }
  }

  getPrerequisites(skillId: string): string[] {
    return this.edges.get(skillId) ?? [];
  }

  getDependents(skillId: string): string[] {
    return this.reverseEdges.get(skillId) ?? [];
  }

  // Get all skills in valid unlock order
  topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      for (const prereq of this.getPrerequisites(id)) {
        visit(prereq);
      }
      result.push(id);
    };

    for (const id of this.nodes.keys()) {
      visit(id);
    }

    return result;
  }

  // Find root skills (no prerequisites)
  getRoots(): string[] {
    return Array.from(this.nodes.keys())
      .filter(id => this.getPrerequisites(id).length === 0);
  }

  // Get the full dependency chain for a skill
  getDependencyChain(skillId: string): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();

    const collect = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      for (const prereq of this.getPrerequisites(id)) {
        collect(prereq);
      }
      chain.push(id);
    };

    collect(skillId);
    return chain;
  }

  // Validate no cycles exist
  hasCycle(): boolean {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map<string, number>();

    for (const id of this.nodes.keys()) {
      color.set(id, WHITE);
    }

    const dfs = (id: string): boolean => {
      color.set(id, GRAY);

      for (const prereq of this.getPrerequisites(id)) {
        if (color.get(prereq) === GRAY) return true; // back edge = cycle
        if (color.get(prereq) === WHITE && dfs(prereq)) return true;
      }

      color.set(id, BLACK);
      return false;
    };

    for (const id of this.nodes.keys()) {
      if (color.get(id) === WHITE && dfs(id)) return true;
    }

    return false;
  }
}
```

### Example Skill Tree Definition (Data)

```typescript
// Data file: skills.json or skills.ts
const SKILL_DEFINITIONS: SkillNode[] = [
  // Root skills (no prerequisites)
  { id: 'breathe', name: 'Breathe', prerequisites: [] },
  { id: 'sit-up', name: 'Sit Up', prerequisites: [] },

  // Level 1 skills
  { id: 'stand', name: 'Stand Up', prerequisites: ['sit-up'] },
  { id: 'look-outside', name: 'Look Outside', prerequisites: ['breathe'] },

  // Level 2 skills
  { id: 'walk-to-door', name: 'Walk to Door', prerequisites: ['stand'] },
  { id: 'open-door', name: 'Open Door', prerequisites: ['walk-to-door', 'look-outside'] },

  // Level 3 skills
  { id: 'go-outside', name: 'Go Outside', prerequisites: ['open-door'] },

  // Level 4 skills
  { id: 'walk-to-store', name: 'Walk to Store', prerequisites: ['go-outside'] },
  { id: 'greet-neighbor', name: 'Greet Neighbor', prerequisites: ['go-outside'] },

  // Level 5 skills (multiple prerequisites)
  { id: 'buy-groceries', name: 'Buy Groceries', prerequisites: ['walk-to-store', 'greet-neighbor'] },
];
```

**Unreal mapping:** Load skill definitions from DataTable. Implement graph in C++ with TMap<FString, TArray<FString>>.

---

## Data Flow

```
User Input (React)
       |
       v
Store Action (MobX @action)
       |
       v
State Mutation (MobX observable)
       |
       | autorun/reaction (automatic)
       v
Computed Values Update (MobX @computed)
       |
       | observer() (automatic)
       v
React Re-render (only affected components)
```

### Cross-Store Communication

Stores communicate via the Root Store reference:

```typescript
// In ActivityStore
@action completeActivity(activityId: string): void {
  const activity = this.getActivity(activityId);
  if (!activity) return;

  // Generate XP (cross-store call)
  for (const skillId of activity.targetSkills) {
    this.root.skillStore.addXpToSkill(skillId, activity.xpReward);
  }

  // Update character (cross-store call)
  this.root.characterStore.currentCharacter?.gainXp(activity.xpReward);

  // Check for milestones (cross-store call)
  this.root.talentStore.checkMilestone();
}
```

### Game Loop Data Flow

```
requestAnimationFrame
       |
       v
GameLoopStore.tick(deltaTime)
       |
       +---> Update game time
       |
       +---> Process active activity
       |           |
       |           +---> Calculate XP (with trait modifiers)
       |           +---> skillStore.addXpToSkill()
       |           +---> Drain resources (socialEnergy)
       |
       +---> Check milestones
                   |
                   +---> talentStore.triggerTalentSelection()
```

---

## Unreal Engine Mapping Guide

### Component Equivalence Table

| MobX/React | Unreal C++ | Notes |
|------------|------------|-------|
| RootStore | UGameInstance | Persists game state |
| Domain Store (SkillStore) | UGameInstanceSubsystem | Modular systems with managed lifecycle |
| Entity Class (Skill) | UObject | Base data objects |
| @observable property | UPROPERTY() | Reactive/tracked properties |
| @computed getter | UFUNCTION() BlueprintPure | Derived values |
| @action method | UFUNCTION() | State mutations |
| observer() component | UMG Widget | UI binding |
| React Context | GetSubsystem<T>() | Dependency injection |
| requestAnimationFrame | Tick() / FTimerManager | Game loop |
| Map<string, T> | TMap<FString, T*> | Hash maps |
| Array<T> | TArray<T> | Dynamic arrays |

### Subsystem Structure in Unreal

```cpp
// LifelinesGameInstance.h
UCLASS()
class ULifelinesGameInstance : public UGameInstance {
public:
  // Subsystems are automatically created and managed
  // Access via GetSubsystem<USkillSubsystem>()
};

// SkillSubsystem.h
UCLASS()
class USkillSubsystem : public UGameInstanceSubsystem {
public:
  virtual void Initialize(FSubsystemCollectionBase& Collection) override;
  virtual void Deinitialize() override;

  UFUNCTION(BlueprintCallable)
  USkill* GetSkill(const FString& SkillId);

  UFUNCTION(BlueprintCallable)
  bool CanUnlock(const FString& SkillId);

  UFUNCTION(BlueprintCallable)
  bool AttemptUnlock(const FString& SkillId);

private:
  UPROPERTY()
  TMap<FString, USkill*> SkillsById;

  UPROPERTY()
  USkillGraph* Graph;
};

// Accessing subsystem
USkillSubsystem* SkillSub = GetGameInstance()->GetSubsystem<USkillSubsystem>();
SkillSub->AttemptUnlock(TEXT("go-outside"));
```

### What Transfers vs What Changes

**Transfers directly:**
- Class structure and relationships
- Property/method organization
- Data flow patterns
- DAG implementation
- Store communication via root

**Changes:**
- Reactivity model (MobX automatic -> Unreal delegates/events)
- Game loop (requestAnimationFrame -> Tick/Timer)
- UI binding (observer -> Widget bindings)
- Memory management (JS GC -> Unreal GC with UPROPERTY)

---

## Suggested Build Order

Based on dependencies between components:

### Phase 1: Foundation (Week 1)

**Order matters - build bottom-up:**

1. **Entity Classes** (no dependencies)
   - Skill class with observable properties
   - Character class with observable properties
   - TraitDefinition (static data)

2. **SkillGraph** (depends on Skill)
   - DAG implementation
   - Topological sort
   - Cycle detection

3. **Domain Stores** (depends on entities)
   - SkillStore (depends on Skill, SkillGraph)
   - TraitStore (depends on TraitDefinition)
   - CharacterStore (depends on Character)

4. **RootStore** (depends on all domain stores)
   - Instantiates stores
   - Provides React context

### Phase 2: Core Loop (Week 2)

5. **Activity System**
   - Activity entity
   - ActivityStore
   - XP generation logic

6. **GameLoopStore**
   - requestAnimationFrame setup
   - Tick processing
   - Activity processing

7. **Cross-store Integration**
   - Activity -> Skill XP flow
   - Trait modifiers on activities
   - Milestone detection

### Phase 3: UI Layer (Week 2-3)

8. **Skill Tree Visualization**
   - SkillTreeView component
   - Node rendering with states
   - Connection lines (SVG/CSS)

9. **Character Panel**
   - Trait display
   - XP display
   - Activity assignment

10. **Talent Picker**
    - Modal component
    - Pick-1-of-3 UI

11. **Game HUD**
    - Time display
    - Notifications

### Phase 4: Polish (Week 3-4)

12. **Feedback/Juice**
    - Level-up animations
    - XP gain indicators
    - State transition effects

13. **Save/Load**
    - Snapshot serialization
    - localStorage persistence
    - Hydration from save

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Logic in React Components

**Bad:**
```typescript
const SkillNode = observer(({ skill }) => {
  const canUnlock = skill.prerequisites.every(p =>
    rootStore.skillStore.getSkill(p).isUnlocked
  );
  // Logic in component!
});
```

**Good:**
```typescript
// In SkillStore
@computed canUnlock(skillId: string): boolean {
  return this.skillGraph.getPrerequisites(skillId)
    .every(id => this.getSkill(id)?.isUnlocked);
}

// In component
const SkillNode = observer(({ skillId }) => {
  const canUnlock = skillStore.canUnlock(skillId);
});
```

**Why:** Logic in components doesn't port to Unreal. Keep UI dumb.

### Anti-Pattern 2: Scattered State

**Bad:**
```typescript
// State in multiple places
const [selectedSkill, setSelectedSkill] = useState(null); // Component state
const skillStore = useSkillStore(); // Store state
// Hard to track where state lives
```

**Good:**
```typescript
// All game state in stores
class UIStore {
  @observable selectedSkillId: string | null = null;
}
// Clear ownership
```

**Why:** Scattered state makes porting impossible. One source of truth.

### Anti-Pattern 3: Ad-hoc Dependency Checks

**Bad:**
```typescript
if (hasSkillA && hasSkillB && (hasSkillC || hasSkillD)) {
  canUnlockE = true;
}
```

**Good:**
```typescript
// Define in data
{ id: 'E', prerequisites: ['A', 'B', 'C'] } // or 'D' handled separately

// Check via graph
canUnlock = graph.getPrerequisites('E').every(isUnlocked);
```

**Why:** Ad-hoc conditionals are unmaintainable and don't scale.

### Anti-Pattern 4: Computed Values That Modify State

**Bad:**
```typescript
@computed get level(): number {
  if (this.xp > 100) {
    this.xp -= 100; // MUTATION in computed!
    return this.level + 1;
  }
  return this._level;
}
```

**Good:**
```typescript
@computed get level(): number {
  return Math.floor(this.totalXp / this.xpPerLevel);
}

@action addXp(amount: number): void {
  this.totalXp += amount;
  // Level is computed automatically
}
```

**Why:** Computed values must be pure. Side effects belong in actions.

---

## File Structure Recommendation

```
src/
├── stores/
│   ├── RootStore.ts          # Container for all stores
│   ├── SkillStore.ts         # Skill management
│   ├── CharacterStore.ts     # Character state
│   ├── TraitStore.ts         # Trait definitions
│   ├── TalentStore.ts        # Talent selection
│   ├── ActivityStore.ts      # Activity management
│   ├── GameLoopStore.ts      # Game tick logic
│   └── index.ts              # Context provider, useRootStore hook
│
├── entities/
│   ├── Skill.ts              # Skill entity class
│   ├── Character.ts          # Character entity class
│   ├── Activity.ts           # Activity entity class
│   └── types.ts              # Shared types/interfaces
│
├── graph/
│   └── SkillGraph.ts         # DAG implementation
│
├── data/
│   ├── skills.ts             # Skill definitions
│   ├── traits.ts             # Trait definitions
│   ├── talents.ts            # Talent definitions
│   └── activities.ts         # Activity definitions
│
├── components/
│   ├── SkillTree/
│   │   ├── SkillTreeView.tsx
│   │   ├── SkillNode.tsx
│   │   └── SkillConnection.tsx
│   ├── Character/
│   │   ├── CharacterPanel.tsx
│   │   └── TraitDisplay.tsx
│   ├── Activity/
│   │   └── ActivityList.tsx
│   ├── Talent/
│   │   └── TalentPicker.tsx
│   └── HUD/
│       └── GameHUD.tsx
│
└── App.tsx
```

**Why this structure:**
- `stores/` and `entities/` are pure TypeScript, no React - port directly to C++
- `graph/` is algorithmic, ports to any language
- `data/` becomes Unreal DataTables
- `components/` is React-specific, becomes UMG in Unreal

---

## Sources

### HIGH Confidence (Official Documentation)

- [MobX: Defining Data Stores](https://mobx.js.org/defining-data-stores.html) - Root store pattern, store organization
- [MobX: Creating Observable State](https://mobx.js.org/observable-state.html) - Observable, computed, action patterns
- [MobX: Actions](https://mobx.js.org/actions.html) - State modification best practices
- [Unreal Engine: Programming Subsystems](https://dev.epicgames.com/documentation/en-us/unreal-engine/programming-subsystems-in-unreal-engine) - GameInstanceSubsystem pattern
- [Unreal Engine: Components](https://dev.epicgames.com/documentation/en-us/unreal-engine/components-in-unreal-engine) - Actor-Component architecture
- [Wikipedia: Directed Acyclic Graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) - DAG theory and properties

### MEDIUM Confidence (Verified Community Sources)

- [MobX Root Store Pattern with React Hooks](https://dev.to/ivandotv/mobx-root-store-pattern-with-react-hooks-318d) - React Context integration
- [Unreal Style Singletons with Subsystems](https://unreal-garden.com/tutorials/subsystem-singleton/) - Subsystem lifecycle
- [A Pattern for Actor Components in UE5](https://minifloppy.it/posts/2024/declaring-actor-components-pattern-ue5/) - Component declaration patterns
- [Using requestAnimationFrame with React Hooks](https://css-tricks.com/using-requestanimationframe-with-react-hooks/) - Game loop in React
- [React Game Loop using requestAnimationFrame](https://gist.github.com/whoisryosuke/bb2c90131b3e7fd56709743061fbf597) - Frame-based updates

### Supporting Sources

- [GeeksforGeeks: Introduction to DAG](https://www.geeksforgeeks.org/dsa/introduction-to-directed-acyclic-graph/) - Graph algorithms
- [MobX GitHub: Store Communication Discussion](https://github.com/mobxjs/mobx/issues/1935) - Multi-store patterns
- [React Architecture Patterns 2025](https://www.geeksforgeeks.org/reactjs/react-architecture-pattern-and-best-practices/) - General React architecture
