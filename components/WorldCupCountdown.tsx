'use client';

import { useState, useEffect } from 'react';
import { getCountdown, WORLD_CUP_DATE } from '@/lib/utils';
import { Trophy } from 'lucide-react';

export default function WorldCupCountdown() {
  const [cd, setCd] = useState(() => getCountdown(WORLD_CUP_DATE));

  useEffect(() => {
    const timer = setInterval(() => setCd(getCountdown(WORLD_CUP_DATE)), 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: 'Days',    value: cd.days },
    { label: 'Hours',   value: cd.hours },
    { label: 'Minutes', value: cd.minutes },
    { label: 'Seconds', value: cd.seconds },
  ];

  if (cd.days <= 0 && cd.hours <= 0 && cd.minutes <= 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-16 h-16 mx-auto text-[var(--warning)] mb-4 drop-shadow-[0_0_15px_rgba(255,179,0,0.5)]" />
        <h2 className="text-4xl font-display font-black text-white">The World Cup is LIVE!</h2>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4 sm:gap-6 py-6">
      {units.map(u => (
        <div key={u.label} className="text-center w-24 sm:w-32 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
          <div
            className="text-4xl sm:text-6xl font-display font-black tabular-nums text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          >
            {String(u.value).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs mt-2 font-bold tracking-[0.2em] uppercase text-[var(--brand)]">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}
