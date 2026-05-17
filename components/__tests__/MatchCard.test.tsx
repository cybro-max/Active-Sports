import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchCard from '@/components/MatchCard';
import type { Fixture } from '@/lib/apifootball';

const mockFixture: Fixture = {
  fixture: {
    id: 1,
    date: '2024-01-01T15:00:00Z',
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    venue: { id: 1, name: 'Stadium', city: 'City' },
  },
  league: {
    id: 39,
    name: 'Premier League',
    logo: '/logo.png',
    round: 'Round 1',
    country: 'England',
  },
  teams: {
    home: { id: 1, name: 'Home Team', logo: '/home.png', winner: null },
    away: { id: 2, name: 'Away Team', logo: '/away.png', winner: null },
  },
  goals: { home: null, away: null },
  score: {
    halftime: { home: null, away: null },
    fulltime: { home: null, away: null },
  },
};

describe('MatchCard', () => {
  it('renders team names', () => {
    render(<MatchCard fixture={mockFixture} />);
    expect(screen.getByText('Home Team')).toBeInTheDocument();
    expect(screen.getByText('Away Team')).toBeInTheDocument();
  });

  it('renders league name', () => {
    render(<MatchCard fixture={mockFixture} />);
    expect(screen.getByText('Premier League')).toBeInTheDocument();
  });

  it('links to match page', () => {
    render(<MatchCard fixture={mockFixture} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/match/home-team-vs-away-team');
  });
});