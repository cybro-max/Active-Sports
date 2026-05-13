'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface TeamStatsProps {
  stats: {
    fixtures: {
      wins: { total: number };
      draws: { total: number };
      loses: { total: number };
    };
    goals: {
      for: { total: { total: number } };
      against: { total: { total: number } };
    };
  };
}

export default function TeamPerformanceChart({ stats }: TeamStatsProps) {
  const data = [
    { name: 'Wins', value: stats.fixtures.wins.total, color: 'var(--success)' },
    { name: 'Draws', value: stats.fixtures.draws.total, color: 'var(--warning)' },
    { name: 'Losses', value: stats.fixtures.loses.total, color: 'var(--danger)' },
  ];

  const goalData = [
    { name: 'Goals For', value: stats.goals.for.total.total, color: 'var(--success)' },
    { name: 'Goals Against', value: stats.goals.against.total.total, color: 'var(--danger)' },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Avg Goals For</div>
            <div className="text-xl font-bold text-[var(--success)]">
              {(stats.goals.for.total.total / (stats.fixtures.wins.total + stats.fixtures.draws.total + stats.fixtures.loses.total || 1)).toFixed(2)}
            </div>
         </div>
         <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Avg Goals Against</div>
            <div className="text-xl font-bold text-[var(--danger)]">
              {(stats.goals.against.total.total / (stats.fixtures.wins.total + stats.fixtures.draws.total + stats.fixtures.loses.total || 1)).toFixed(2)}
            </div>
         </div>
      </div>
    </div>
  );
}
