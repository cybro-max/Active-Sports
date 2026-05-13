'use client';

import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

interface PlayerRadarProps {
  stats: {
    goals: { total: number | null; assists: number | null };
    shots: { total: number | null };
    passes: { key: number | null; accuracy: string | number | null };
    tackles: { total: number | null; interceptions: number | null };
    duels: { total: number | null; won: number | null };
    dribbles: { attempts: number | null; success: number | null };
    games: { rating: string | null };
  };
}

export default function PlayerRadarChart({ stats }: PlayerRadarProps) {
  // Normalize stats to 0-100 scale for the radar
  const accuracyNum = typeof stats.passes.accuracy === 'string' 
    ? parseInt(stats.passes.accuracy) 
    : stats.passes.accuracy || 70;

  const data = [
    {
      subject: 'Shooting',
      A: Math.min(100, ((stats.goals.total || 0) * 5) + ((stats.shots.total || 0) * 2)),
      fullMark: 100,
    },
    {
      subject: 'Passing',
      A: accuracyNum,
      fullMark: 100,
    },
    {
      subject: 'Dribbling',
      A: Math.min(100, (stats.dribbles.success || 0) * 10),
      fullMark: 100,
    },
    {
      subject: 'Defending',
      A: Math.min(100, ((stats.tackles.total || 0) * 4) + ((stats.tackles.interceptions || 0) * 4)),
      fullMark: 100,
    },
    {
      subject: 'Physical',
      A: Math.min(100, (stats.duels.won || 0) * 2),
      fullMark: 100,
    },
    {
      subject: 'Creativity',
      A: Math.min(100, (stats.passes.key || 0) * 8),
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Player"
            dataKey="A"
            stroke="var(--brand)"
            fill="var(--brand)"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
