'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PredictionWidgetProps {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  existingPrediction?: { homeGoals: number; awayGoals: number } | null;
  isResolved?: boolean;
  matchStatus: string;
}

export default function PredictionWidget({
  fixtureId, homeTeam, awayTeam, existingPrediction, isResolved, matchStatus
}: PredictionWidgetProps) {
  const router = useRouter();
  const [homeGoals, setHomeGoals] = useState(existingPrediction?.homeGoals ?? 0);
  const [awayGoals, setAwayGoals] = useState(existingPrediction?.awayGoals ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const canPredict = ['NS', 'TBD'].includes(matchStatus) && !isResolved;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPredict) return;
    
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId, homeGoals, awayGoals })
      });
      if (res.ok) {
        setMessage('Prediction saved!');
        router.refresh();
      } else if (res.status === 401) {
        setMessage('Please sign in to predict.');
      } else {
        setMessage('Failed to save prediction.');
      }
    } catch {
      setMessage('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-5 mt-6 fade-up">
      <h3 className="font-bold mb-4">Your Prediction</h3>
      
      {!canPredict && existingPrediction ? (
        <div className="text-center p-5 rounded-xl border border-[var(--border)]" style={{ background: 'var(--bg-elevated)' }}>
          <p className="text-sm mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>You predicted:</p>
          <div className="flex justify-center items-center gap-4 text-3xl font-display font-bold text-white">
            <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{existingPrediction.homeGoals}</span>
            <span className="text-base font-normal opacity-50">—</span>
            <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{existingPrediction.awayGoals}</span>
          </div>
          {isResolved && (
            <p className="text-xs mt-4 font-bold text-[var(--brand)] uppercase tracking-wider">Match finished</p>
          )}
        </div>
      ) : canPredict ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center flex-1">
              <label className="text-xs mb-2 text-center font-semibold text-[var(--text-muted)] uppercase tracking-wider">{homeTeam}</label>
              <input
                type="number"
                min="0"
                max="20"
                value={homeGoals}
                onChange={(e) => setHomeGoals(parseInt(e.target.value) || 0)}
                className="w-16 h-14 text-center text-2xl font-display font-bold bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition-all text-white shadow-inner"
              />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>-</span>
            <div className="flex flex-col items-center flex-1">
              <label className="text-xs mb-2 text-center font-semibold text-[var(--text-muted)] uppercase tracking-wider">{awayTeam}</label>
              <input
                type="number"
                min="0"
                max="20"
                value={awayGoals}
                onChange={(e) => setAwayGoals(parseInt(e.target.value) || 0)}
                className="w-16 h-14 text-center text-2xl font-display font-bold bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition-all text-white shadow-inner"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full mt-2"
          >
            {isSubmitting ? 'Saving...' : existingPrediction ? 'Update Prediction' : 'Save Prediction'}
          </button>
          {message && (
            <p className={`text-xs text-center ${message.includes('saved') ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {message}
            </p>
          )}
        </form>
      ) : (
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Predictions are closed for this match.
        </p>
      )}
    </div>
  );
}
