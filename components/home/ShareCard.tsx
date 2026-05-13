'use client';

import { Share2, Download } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { useSession } from 'next-auth/react';
import { Fixture } from '@/lib/apifootball';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

interface ShareCardProps {
  fixture?: Fixture;
  // Fallbacks for the static examples shown in the preview grid
  fallbackHome?: string;
  fallbackAway?: string;
  fallbackScore?: string;
  fallbackHomeLogo?: string;
  fallbackAwayLogo?: string;
  fallbackStatus?: string;
}

export default function ShareCard({ 
  fixture,
  fallbackHome,
  fallbackAway,
  fallbackScore,
  fallbackHomeLogo,
  fallbackAwayLogo,
  fallbackStatus
}: ShareCardProps) {
  const { openAuthModal } = useAuthModal();
  const { data: session } = useSession();

  const router = useRouter();

  const handleRestrictedAction = (callback?: () => void) => {
    if (!session) {
      openAuthModal();
    } else if (callback) {
      callback();
    }
  };

  const home = fixture ? fixture.teams.home.name : (fallbackHome || 'Arsenal');
  const away = fixture ? fixture.teams.away.name : (fallbackAway || 'Man City');
  const score = fixture ? `${fixture.goals.home ?? 0} - ${fixture.goals.away ?? 0}` : (fallbackScore || '0 - 0');
  const homeLogo = fixture ? fixture.teams.home.logo : (fallbackHomeLogo || 'https://media.api-sports.io/football/teams/42.png');
  const awayLogo = fixture ? fixture.teams.away.logo : (fallbackAwayLogo || 'https://media.api-sports.io/football/teams/50.png');
  const status = fixture ? (fixture.fixture.status.short === 'FT' ? 'FULL TIME' : fixture.fixture.status.short === 'NS' ? 'MATCH OF THE WEEK' : `LIVE · ${fixture.fixture.status.elapsed}'`) : (fallbackStatus || 'LIVE');

  return (
    <div className="card group relative overflow-hidden p-0 border border-[var(--border)] bg-black max-w-sm mx-auto shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--brand-dim)_0%,_transparent_70%)]" />
        <div className="grid grid-cols-8 h-full">
           {[...Array(32)].map((_, i) => (
             <div key={i} className="border-r border-b border-white/5" />
           ))}
        </div>
      </div>

      <div className="p-8 relative z-10 text-center">
        <div className="inline-block px-3 py-1 rounded bg-[var(--brand)] text-black text-[9px] font-black uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(33,150,243,0.4)]">
           ActiveSports Live
        </div>

        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="text-center w-24">
             <Image src={homeLogo} alt={home} width={64} height={64} className="mx-auto mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
             <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{home}</p>
          </div>
          <div className="text-4xl font-black text-white tracking-tighter whitespace-nowrap">{score}</div>
          <div className="text-center w-24">
             <Image src={awayLogo} alt={away} width={64} height={64} className="mx-auto mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
             <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{away}</p>
          </div>
        </div>

        <div className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-[0.2em] mb-8">
           {status}
        </div>

        <div className="pt-8 border-t border-white/10 flex items-center justify-between">
           <div className="text-[10px] font-black text-white flex items-center gap-1">
              <span className="text-[var(--brand)]">ACTIVESPORTS</span>.LIVE
           </div>
           <div className="flex gap-3">
              <button onClick={() => handleRestrictedAction()}><InstagramIcon className="w-4 h-4 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer" /></button>
              <button onClick={() => handleRestrictedAction()}><TwitterIcon className="w-4 h-4 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer" /></button>
              <button onClick={() => handleRestrictedAction()}><Download className="w-4 h-4 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer" /></button>
           </div>
        </div>
      </div>

      <button 
        onClick={() => handleRestrictedAction(() => {
          if (fixture) {
            router.push(`/match/${fixture.fixture.id}/story`);
          } else {
            router.push(`/`); // Fallback
          }
        })} 
        className="w-full py-4 bg-white/5 border-t border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 relative z-10"
      >
         <Share2 className="w-3 h-3" /> Generate Story Card
      </button>
    </div>
  );
}
