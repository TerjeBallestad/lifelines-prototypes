import { observer } from 'mobx-react-lite';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
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

  const CustomTooltip = ({ payload }: TooltipContentProps<number, string>) => {
    if (payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-base-200 rounded p-2 text-sm shadow-lg">
          <p>
            {data.trait}: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--color-primary)" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fontSize: 10, fill: 'var(--color-base-content)' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.4}
          />
          <Tooltip content={CustomTooltip} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});
