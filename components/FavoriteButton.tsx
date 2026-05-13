'use client';

import { useState, useTransition } from 'react';
import { useSession, signIn } from 'next-auth/react';

type EntityType = 'team' | 'league' | 'player';

interface FavoriteButtonProps {
  type: EntityType;
  entityId: number;
  name: string;
  logo?: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({
  type,
  entityId,
  name,
  logo,
  initialFavorited = false,
  size = 'md',
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (!session) {
      signIn();
      return;
    }

    // Optimistic update
    const prev = favorited;
    setFavorited(!prev);

    startTransition(async () => {
      try {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, entityId, name, logo }),
        });
        if (!res.ok) {
          // Rollback on failure
          setFavorited(prev);
        } else {
          const data = await res.json();
          setFavorited(data.favorited);
        }
      } catch {
        // Rollback on network error
        setFavorited(prev);
      }
    });
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const btnSize = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      id={`favorite-btn-${type}-${entityId}`}
      onClick={toggle}
      disabled={isPending}
      className={`${btnSize} rounded-lg transition-all flex items-center justify-center`}
      style={{
        background: favorited ? 'rgba(0, 230, 118, 0.15)' : 'var(--bg-elevated)',
        border: favorited ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid var(--border)',
        color: favorited ? 'var(--brand)' : 'var(--text-muted)',
        boxShadow: favorited ? '0 0 12px rgba(0, 230, 118, 0.2)' : 'none',
        opacity: isPending ? 0.7 : 1,
        transform: isPending ? 'scale(0.95)' : 'scale(1)',
      }}
      aria-label={favorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`${iconSize} transition-all`}
        fill={favorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
