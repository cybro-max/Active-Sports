import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Activity, Trophy, User, Heart } from 'lucide-react';
import type { Metadata } from 'next';
import { toSlug } from '@/lib/slug';

const TYPE_ICON: Record<string, React.ReactNode> = {
  team: <Activity className="w-5 h-5 text-[var(--brand)]" />,
  league: <Trophy className="w-5 h-5 text-[var(--warning)]" />,
  player: <User className="w-5 h-5 text-[var(--success)]" />,
};

const TYPE_HREF: Record<string, (id: number, name: string) => string> = {
  team: (id, name) => `/team/${toSlug(name)}`,
  league: (id, name) => `/league/${toSlug(name)}`,
  player: (id, name) => `/player/${toSlug(name)}`,
};

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  const byType = {
    team: favorites.filter((f: any) => f.type === 'team'),
    league: favorites.filter((f: any) => f.type === 'league'),
    player: favorites.filter((f: any) => f.type === 'player'),
  };

  const totalCount = favorites.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="fade-up mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
          My Favorites
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {totalCount === 0
            ? <>No favorites yet. Click the <Heart className="inline w-4 h-4 align-text-top" /> on any team, player, or league page to save it here.</>
            : `${totalCount} saved item${totalCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      {totalCount === 0 ? (
        /* Empty state */
        <div
          className="card p-12 text-center fade-up"
          style={{ border: '1px dashed var(--border)' }}
        >
          <Activity className="w-12 h-12 text-[var(--brand)] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No favorites yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Browse teams, players, and leagues, then click the heart icon to save them here.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary px-6 py-2 rounded-lg text-sm">
              Browse Matches
            </Link>
            <Link
              href="/leagues"
              className="px-6 py-2 rounded-lg text-sm transition-colors"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            >
              Browse Leagues
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {(['team', 'league', 'player'] as const).map((type) => {
            const items = byType[type];
            if (items.length === 0) return null;
            return (
              <section key={type} className="fade-up">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>{TYPE_ICON[type]}</span>
                  <span className="capitalize">{type}s</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full ml-1"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                  >
                    {items.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((fav) => (
                    <Link
                      key={fav.id}
                      href={TYPE_HREF[fav.type](fav.entityId, fav.name)}
                      className="card p-4 flex items-center gap-3 group"
                    >
                      {fav.logo ? (
                        <Image
                          src={fav.logo}
                          alt={fav.name}
                          width={40}
                          height={40}
                          className="shrink-0"
                          style={{
                            borderRadius: fav.type === 'player' ? '50%' : undefined,
                          }}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                          style={{ background: 'var(--bg-subtle)' }}
                        >
                          {TYPE_ICON[fav.type]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-[var(--brand)] transition-colors">
                          {fav.name}
                        </p>
                        <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {fav.type}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-80 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
