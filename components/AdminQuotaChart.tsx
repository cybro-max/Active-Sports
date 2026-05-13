'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminQuotaChartProps {
  current: number;
  limit: number;
}

export default function AdminQuotaChart({ current, limit }: AdminQuotaChartProps) {
  const data = [
    { name: 'Used', value: current },
    { name: 'Remaining', value: Math.max(limit - current, 0) },
  ];

  const percentage = Math.min((current / limit) * 100, 100);
  const isDanger = percentage > 90;

  const COLORS = [isDanger ? '#ef4444' : '#3b82f6', 'rgba(255, 255, 255, 0.05)'];

  return (
    <div className="relative w-full h-[200px] flex items-end justify-center pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={100}
            outerRadius={130}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--text-body)' }}
            formatter={(value) => [Number(value).toLocaleString(), 'Quota Used']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-6 flex flex-col items-center">
        <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-inter), sans-serif', color: isDanger ? 'var(--danger)' : 'var(--text-body)' }}>
          {percentage.toFixed(1)}%
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Quota Used
        </span>
      </div>
    </div>
  );
}
