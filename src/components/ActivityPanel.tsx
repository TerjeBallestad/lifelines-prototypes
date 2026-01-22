import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useActivityStore } from '../stores/RootStore';
import { STARTER_ACTIVITIES } from '../data/activities';
import { ActivityCard } from './ActivityCard';
import { ActivityQueue } from './ActivityQueue';
import type { SkillDomain } from '../entities/types';
import clsx from 'clsx';

// Domains that have activities (filter out analytical which has no activities yet)
const ACTIVITY_DOMAINS: SkillDomain[] = [
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

  // Filter activities by domain
  const domainActivities = STARTER_ACTIVITIES.filter(
    (a) => a.domain === selectedDomain
  );

  // Get domains that have at least one activity
  const availableDomains = ACTIVITY_DOMAINS.filter((domain) =>
    STARTER_ACTIVITIES.some((a) => a.domain === domain)
  );

  const handleSelectActivity = (
    activityData: (typeof STARTER_ACTIVITIES)[0]
  ) => {
    activityStore.enqueue(activityData);
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2">
      {/* Left: Activity Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Activities</h2>

        {/* Domain Tabs */}
        <div role="tablist" className="tabs tabs-box">
          {availableDomains.map((domain) => (
            <button
              key={domain}
              role="tab"
              className={clsx('tab', {
                'tab-active': selectedDomain === domain,
              })}
              onClick={() => setSelectedDomain(domain)}
            >
              {DOMAIN_LABELS[domain]}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-2">
          {domainActivities.length > 0 ? (
            domainActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                variant="preview"
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
          Click an activity to add it to the queue. Activities execute in
          order when the simulation runs.
        </p>
      </div>

      {/* Right: Activity Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Activity Queue</h2>
        <ActivityQueue />
      </div>
    </div>
  );
});
