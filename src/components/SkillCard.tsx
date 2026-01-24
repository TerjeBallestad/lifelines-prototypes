import { observer } from 'mobx-react-lite';
import type { SkillState } from '../entities/types';
import { useSkillStore } from '../stores/RootStore';

type SkillCardProps = {
  skillId: string;
};

// State-based styling
const stateStyles: Record<SkillState, string> = {
  locked: 'opacity-50 ',
  unlockable: 'ring-2 ring-primary',
  unlocked: '',
  mastered: 'ring-2 ring-accent bg-accent/10',
};

// State icons (using emoji for simplicity)
const stateIcons: Record<SkillState, string> = {
  locked: '🔒',
  unlockable: '🔓',
  unlocked: '',
  mastered: '⭐',
};

export const SkillCard = observer(function SkillCard({
  skillId,
}: SkillCardProps) {
  const skillStore = useSkillStore();
  const skill = skillStore.getSkill(skillId);

  if (!skill) return null;

  const state = skillStore.getSkillState(skillId);
  const canAfford = skillStore.canAffordUnlock(skillId);
  const prerequisites = skillStore.getPrerequisiteProgress(skillId);
  const isUnlockable = skillStore.isUnlockable(skillId);

  // Can show unlock button if not mastered
  const showUnlockButton =
    state === 'locked' ||
    state === 'unlockable' ||
    (state === 'unlocked' && skill.level < 5);

  // Button is disabled if locked and not unlockable, or can't afford
  const buttonDisabled = !canAfford || (state === 'locked' && !isUnlockable);

  const handleUnlock = () => {
    skillStore.unlockSkillLevel(skillId);
  };

  return (
    <div className={`card bg-base-100 ${stateStyles[state]}`}>
      <div className="card-body p-4">
        {/* Header: name + level badge + state icon */}
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">
            {skill.name}
            <span className="badge badge-sm badge-primary ml-2">
              Lv.{skill.level}
            </span>
          </h3>
          {stateIcons[state] && (
            <span className="text-lg" aria-label={state}>
              {stateIcons[state]}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-base-content/70 text-sm">{skill.description}</p>

        {/* Prerequisites section for locked skills */}
        {state === 'locked' && prerequisites.length > 0 && (
          <div className="mt-2">
            <p className="text-base-content/80 mb-1 text-xs font-semibold">
              Prerequisites:
            </p>
            <ul className="space-y-0.5 text-xs">
              {prerequisites.map((prereq) => (
                <li
                  key={prereq.skillId}
                  className={prereq.met ? 'text-success' : 'text-warning'}
                >
                  {prereq.name}:{' '}
                  {prereq.met ? (
                    <span>✓</span>
                  ) : (
                    <span>
                      Lv.{prereq.current}/{prereq.required}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unlock button */}
        {showUnlockButton && (
          <div className="card-actions mt-2 justify-end">
            <button
              className="btn btn-sm btn-primary"
              disabled={buttonDisabled}
              onClick={handleUnlock}
            >
              Unlock Lv.{skill.level + 1}
              <span className="badge badge-sm ml-1">
                {skill.nextLevelCost} XP
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
