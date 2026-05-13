import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ActiveSports — Live Scores, Fixtures & Stats',
    short_name: 'ActiveSports',
    description: 'Real-time football scores, live fixtures, standings, player stats and odds.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#1E40AF',
    icons: [
      { src: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
