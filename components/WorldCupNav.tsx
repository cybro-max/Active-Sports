import Link from 'next/link';
import { Calendar, LayoutGrid, BarChart3, Users, MapPin, History } from 'lucide-react';

export default function WorldCupNav() {
  const links = [
    { label: 'Schedule', href: '/world-cup/schedule', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Standings', href: '/world-cup/standings', icon: <LayoutGrid className="w-4 h-4" /> },
    { label: 'Stats', href: '/world-cup/stats', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Teams', href: '/world-cup/team', icon: <Users className="w-4 h-4" /> },
    { label: 'Venues', href: '/world-cup/venues', icon: <MapPin className="w-4 h-4" /> },
    { label: 'History', href: '/world-cup/history', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <nav className="flex flex-wrap justify-center gap-4 mb-12 fade-up fade-up-delay-1 no-prose">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="card px-6 py-4 flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all border border-[var(--border)] group min-w-[140px] justify-center no-underline"
          style={{ background: 'var(--bg-surface)' }}
        >
          <span className="text-[var(--brand)] group-hover:scale-110 transition-transform">{link.icon}</span>
          <span className="font-bold text-sm text-white">{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
