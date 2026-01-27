import { Fragment, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useActivityStore, useCharacterStore } from '../stores/RootStore';
import { STARTER_ACTIVITIES } from '../data/activities';
import { Activity } from '../entities/Activity';
import { ActivityCard } from './ActivityCard';
import { ActivityQueue } from './ActivityQueue';
import type { SkillDomain } from '../entities/types';

// Domains that have activities (filter out analytical which has no activities yet)
const ACTIVITY_DOMAINS: Array<SkillDomain> = [
  'social',
  'organisational',
  'physical',
  'creative',
];

const DOMAIN_LABELS: Record<SkillDomain, string> = {
  social: 'Social',
  organisational: 'Organisation',
  physical: 'Physical',
  creative: 'Creative',
  analytical: 'Analytical',
};

export const ActivityPanel = observer(function ActivityPanel() {
  const [selectedDomain, setSelectedDomain] = useState<SkillDomain>('physical');
  const activityStore = useActivityStore();
  const characterStore = useCharacterStore();
  const character = characterStore.character;

  // Create Activity instances from ActivityData for personalized difficulty display
  const activities = useMemo(
    () => STARTER_ACTIVITIES.map((data) => new Activity(data)),
    []
  );

  // Get domains that have at least one activity
  const availableDomains = ACTIVITY_DOMAINS.filter((domain) =>
    activities.some((a) => a.domain === domain)
  );

  const handleSelectActivity = (activity: Activity) => {
    // Find the original ActivityData by id for enqueueing
    const activityData = STARTER_ACTIVITIES.find((a) => a.id === activity.id);
    if (activityData) {
      activityStore.enqueue(activityData);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2">
      {/* Left: Activity Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Activities</h2>

        {/* Domain Tabs with interleaved content */}
        <div role="tablist" className="tabs tabs-box">
          {availableDomains.map((domain) => {
            const isActive = selectedDomain === domain;
            const domainActivities = activities.filter(
              (a) => a.domain === domain
            );

            return (
              <Fragment key={domain}>
                <button
                  role="tab"
                  className={`tab ${isActive ? 'tab-active' : ''}`}
                  onClick={() => setSelectedDomain(domain)}
                >
                  {DOMAIN_LABELS[domain]}
                </button>
                <div className="tab-content bg-base-100 border-base-300 h-170 overflow-y-auto p-4">
                  {/* Activity List */}
                  <div className="space-y-2">
                    {domainActivities.length > 0 ? (
                      domainActivities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          variant="preview"
                          character={character ?? undefined}
                          onSelect={() => handleSelectActivity(activity)}
                        />
                      ))
                    ) : (
                      <div className="text-base-content/50 p-4 text-sm italic">
                        No activities in this domain
                      </div>
                    )}
                  </div>

                  {/* Help text */}
                  <p className="text-base-content/50 mt-3 text-xs">
                    Click an activity to add it to the queue. Activities execute
                    in order when the simulation runs.
                  </p>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Right: Activity Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Activity Queue</h2>
        <ActivityQueue />
      </div>
    </div>
  );
});
