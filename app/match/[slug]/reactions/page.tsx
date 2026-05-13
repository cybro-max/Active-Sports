import { getFixtureById } from '@/lib/apifootball';
import { getReactions } from '@/app/actions/reactions';
import { notFound } from 'next/navigation';
import ReactionHubClient from '@/components/reactions/ReactionHubClient';
import { auth } from '@/auth';

export default async function ReactionHubPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const [fixtureData, reactionsData, session] = await Promise.all([
    getFixtureById(fixtureId),
    getReactions(fixtureId),
    auth()
  ]);

  const fixture = fixtureData?.[0];
  if (!fixture) return notFound();

  const initialReactions = reactionsData.success && reactionsData.data ? reactionsData.data : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center fade-up">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mb-4">
          Reaction <span className="text-[var(--accent)]">Hub</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
          Live fan sentiment and debate for {fixture.teams.home.name} vs {fixture.teams.away.name}.
        </p>
      </div>

      <ReactionHubClient 
        fixture={fixture} 
        initialReactions={initialReactions} 
        isLoggedIn={!!session?.user} 
      />
    </div>
  );
}
