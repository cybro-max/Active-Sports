'use client';

import { useState } from 'react';
import { Trophy, Target, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import Image from 'next/image';
import { submitPrediction } from '@/app/actions/predictions';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { Fixture } from '@/lib/apifootball';

interface PredictionClientProps {
  isLoggedIn: boolean;
  featuredMatch?: Fixture;
}

export default function PredictionClient({ isLoggedIn, featuredMatch }: PredictionClientProps) {
  const { openAuthModal } = useAuthModal();
  const [prediction, setPrediction] = useState({ home: '', away: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Fallback to Arsenal vs Man City if no live/upcoming match is provided
  const match = featuredMatch ? {
    fixtureId: featuredMatch.fixture.id,
    home: featuredMatch.teams.home.name,
    away: featuredMatch.teams.away.name,
    homeLogo: featuredMatch.teams.home.logo,
    awayLogo: featuredMatch.teams.away.logo,
    time: featuredMatch.fixture.status.short === 'NS' ? new Date(featuredMatch.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'LIVE'
  } : {
    fixtureId: 999999, // Dummy ID
    home: 'Arsenal',
    away: 'Man City',
    homeLogo: 'https://media.api-sports.io/football/teams/42.png',
    awayLogo: 'https://media.api-sports.io/football/teams/50.png',
    time: '20:00'
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    if (!prediction.home || !prediction.away) {
      setErrorMsg('Please enter a valid score.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('fixtureId', match.fixtureId.toString());
    formData.append('homeGoals', prediction.home);
    formData.append('awayGoals', prediction.away);

    const result = await submitPrediction(formData);

    if (result.success) {
      setStatus('success');
    } else {
      setErrorMsg(result.error || 'Something went wrong.');
      setStatus('error');
    }
  };

  const handleRestrictedAction = () => {
    if (!isLoggedIn) {
      openAuthModal();
    }
  };

  return (
    <div className="card overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] p-0 max-w-2xl mx-auto fade-up shadow-[var(--shadow-lg)]">
      <div className="bg-[var(--brand)] p-3 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
         <p className="text-[11px] font-black text-black uppercase tracking-widest flex items-center justify-center gap-2 relative z-10">
           <Trophy className="w-4 h-4" /> Tonight's Featured Battle
         </p>
      </div>

      <div className="p-8 sm:p-12 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--brand)] opacity-[0.03] blur-[50px] pointer-events-none" />

        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-12 relative z-10">
          <div className="text-center group">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4 group-hover:scale-105 transition-transform shadow-lg">
               <Image src={match.homeLogo} alt={match.home} width={80} height={80} className="mx-auto drop-shadow-xl" />
            </div>
            <p className="text-lg font-black text-white uppercase tracking-tight">{match.home}</p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="px-4 py-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] mb-2 shadow-inner">
               <div className="text-2xl font-black text-[var(--text-muted)] italic leading-none">VS</div>
            </div>
            <p className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-widest bg-[var(--brand-dim)] px-3 py-1 rounded-full">{match.time}</p>
          </div>

          <div className="text-center group">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4 group-hover:scale-105 transition-transform shadow-lg">
               <Image src={match.awayLogo} alt={match.away} width={80} height={80} className="mx-auto drop-shadow-xl" />
            </div>
            <p className="text-lg font-black text-white uppercase tracking-tight">{match.away}</p>
          </div>
        </div>

        {status !== 'success' ? (
          <div className="max-w-md mx-auto relative z-10">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Predict the Final Score</h3>
            <div className="flex items-center justify-center gap-6 mb-8">
              <input 
                type="number" 
                placeholder="0"
                min="0"
                max="99"
                className="w-24 h-28 text-5xl font-display font-black text-center rounded-[20px] bg-[var(--bg-base)] border-2 border-[var(--border-strong)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-dim)] outline-none text-white transition-all shadow-inner"
                value={prediction.home}
                onChange={(e) => setPrediction({...prediction, home: e.target.value})}
              />
              <span className="text-4xl font-black text-[var(--text-muted)] opacity-50">:</span>
              <input 
                type="number" 
                placeholder="0"
                min="0"
                max="99"
                className="w-24 h-28 text-5xl font-display font-black text-center rounded-[20px] bg-[var(--bg-base)] border-2 border-[var(--border-strong)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-dim)] outline-none text-white transition-all shadow-inner"
                value={prediction.away}
                onChange={(e) => setPrediction({...prediction, away: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <button onClick={handleRestrictedAction} className="p-4 rounded-xl border-2 border-[var(--border)] bg-white/5 text-xs font-bold text-[var(--text-muted)] hover:text-white hover:border-[var(--text-muted)] transition-all uppercase tracking-widest">
                  First Scorer?
               </button>
               <button onClick={handleRestrictedAction} className="p-4 rounded-xl border-2 border-[var(--border)] bg-white/5 text-xs font-bold text-[var(--text-muted)] hover:text-white hover:border-[var(--text-muted)] transition-all uppercase tracking-widest">
                  Red Cards?
               </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm font-bold animate-pulse">
                {errorMsg}
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="w-full py-5 bg-[var(--brand)] text-black font-black rounded-2xl text-[13px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(33,150,243,0.5)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {status === 'loading' ? 'Saving...' : 'Submit Prediction & Enter Leaderboard'}
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto py-6 fade-up relative z-10">
             <div className="w-20 h-20 rounded-full bg-[var(--brand-dim)] text-[var(--brand)] flex items-center justify-center mx-auto mb-6 border border-[var(--brand)] shadow-[0_0_30px_rgba(33,150,243,0.3)]">
                <Target className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-display font-black text-white mb-3 uppercase tracking-tighter">Prediction Locked!</h3>
             <p className="text-[var(--text-muted)] text-base mb-8">
               You predicted <strong className="text-white">{match.home} {prediction.home} - {prediction.away} {match.away}</strong>.<br/> 
               You're currently in the top 12% of predictors.
             </p>
             
             <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] mb-8 text-left shadow-lg">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                   <span>Global Consensus</span>
                   <span className="text-[var(--brand)]">65% Match</span>
                </div>
                <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                   <div className="h-full bg-[var(--brand)] shadow-[0_0_10px_rgba(33,150,243,0.8)]" style={{ width: '65%' }} />
                </div>
             </div>

             <button onClick={handleRestrictedAction} className="w-full py-4 bg-[var(--bg-elevated)] border-2 border-[var(--border)] text-white font-black rounded-2xl text-[12px] uppercase tracking-widest hover:bg-[var(--brand)] hover:text-black hover:border-[var(--brand)] transition-all flex items-center justify-center gap-3">
                <Zap className="w-5 h-5 text-[var(--warning)]" /> Invite Friends to Battle
             </button>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] p-6 bg-[var(--bg-base)] flex flex-wrap items-center justify-center gap-8 md:gap-12 relative z-10">
         <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <TrendingUp className="w-5 h-5 text-[var(--accent)]" /> 12,402 Entered
         </div>
         <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <Trophy className="w-5 h-5 text-[var(--warning)]" /> 500 PRO Points
         </div>
         <button className="flex items-center gap-2 text-[11px] font-bold text-[var(--brand)] uppercase tracking-widest hover:text-white transition-colors">
            View Full Leaderboard <ChevronRight className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}
