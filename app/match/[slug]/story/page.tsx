import { getFixtureById } from '@/lib/apifootball';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Download, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default async function MatchStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let fixtureId: number;
  if (/^\d+$/.test(slug)) {
    fixtureId = Number(slug);
  } else {
    // Try to parse fixture ID from slug (format: home-vs-away)
    const { getMatchSlugMap } = await import('@/lib/slug-maps');
    const matchMap = await getMatchSlugMap();
    const id = matchMap.get(slug);
    if (!id) notFound();
    fixtureId = id;
  }

  const fixtureData = await getFixtureById(fixtureId);
  const fixture = fixtureData?.[0];
  if (!fixture) return notFound();

  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const score = `${fixture.goals.home ?? 0} - ${fixture.goals.away ?? 0}`;
  const homeLogo = fixture.teams.home.logo;
  const awayLogo = fixture.teams.away.logo;
  const status = fixture.fixture.status.short === 'FT' ? 'FULL TIME' : fixture.fixture.status.short === 'NS' ? 'MATCH OF THE WEEK' : `LIVE · ${fixture.fixture.status.elapsed}'`;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 pb-20 pt-0">
      <Link href="/" className="absolute top-24 left-8 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-white transition-colors">
         <ChevronLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="mb-8 text-center fade-up">
        <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-2">
          Story <span className="text-[var(--brand)]">Generator</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm">Download or share directly to your socials.</p>
      </div>

      <div id="story-card" className="w-full max-w-[400px] aspect-[9/16] bg-black relative overflow-hidden rounded-3xl border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] fade-up flex flex-col">
         {/* Background */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--brand-dim)_0%,_transparent_70%)] opacity-30" />
         
         <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-[var(--brand)] text-black text-xs font-black uppercase tracking-widest mb-12 shadow-[0_0_20px_rgba(33,150,243,0.5)]">
               ActiveSports Live
            </div>

            <div className="space-y-8 w-full">
               <div className="flex flex-col items-center gap-4">
                  <Image src={homeLogo} alt={home} width={100} height={100} className="drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{home}</h2>
               </div>
               
               <div className="flex items-center justify-center gap-4 w-full">
                  <div className="h-px bg-white/20 flex-1" />
                  <span className="text-6xl font-display font-black text-[var(--brand)] tracking-tighter drop-shadow-[0_0_10px_rgba(33,150,243,0.5)]">{score}</span>
                  <div className="h-px bg-white/20 flex-1" />
               </div>

               <div className="flex flex-col items-center gap-4">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{away}</h2>
                  <Image src={awayLogo} alt={away} width={100} height={100} className="drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
               </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20 w-full">
               <p className="text-xs font-black text-white uppercase tracking-[0.3em]">{status}</p>
            </div>
         </div>
         
         <div className="p-6 bg-white text-center relative z-10">
            <p className="text-[10px] font-black text-black uppercase tracking-widest">
               Track matches at <span className="text-[var(--brand)]">activesports.live</span>
            </p>
         </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 fade-up">
         <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all flex items-center gap-2 border border-white/10">
            <Download className="w-4 h-4" /> Save Image
         </button>
         <button className="px-6 py-3 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white text-sm font-bold transition-all flex items-center gap-2 hover:opacity-90 hover:scale-105">
            <InstagramIcon className="w-4 h-4" /> Add to Story
         </button>
         <button className="px-6 py-3 rounded-xl bg-[#1DA1F2] text-white text-sm font-bold transition-all flex items-center gap-2 hover:opacity-90 hover:scale-105">
            <TwitterIcon className="w-4 h-4" /> Tweet
         </button>
      </div>
    </div>
  );
}
