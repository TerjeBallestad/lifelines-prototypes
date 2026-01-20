import { observer } from 'mobx-react-lite';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { Personality } from '../entities/types';

interface PersonalityRadarProps {
  personality: Personality;
}

export const PersonalityRadar = observer(function PersonalityRadar({
  personality,
}: PersonalityRadarProps) {
  // Full labels per CONTEXT.md decision
  const data = [
    { trait: 'Openness', value: personality.openness },
    { trait: 'Conscientiousness', value: personality.conscientiousness },
    { trait: 'Extraversion', value: personality.extraversion },
    { trait: 'Agreeableness', value: personality.agreeableness },
    { trait: 'Neuroticism', value: personality.neuroticism },
  ];

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="oklch(var(--bc) / 0.2)" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fontSize: 10, fill: 'oklch(var(--bc) / 0.7)' }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="oklch(var(--p))"
            fill="oklch(var(--p))"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});
