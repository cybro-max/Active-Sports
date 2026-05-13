/**
 * JSON-LD structured data generators for schema.org rich results.
 * Usage: call the appropriate function and render the result in a <script> tag.
 *
 * Example:
 *   const ld = generateSportsEventLD(fixture);
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
 */

// ─── SportsEvent (match / tournament) ────────────────────────────────────────
export function generateSportsEventLD(params: {
  name: string;
  startDate: string;
  endDate?: string;
  location?: string;
  homeTeam?: { name: string; logo?: string; url?: string };
  awayTeam?: { name: string; logo?: string; url?: string };
  url?: string;
  description?: string;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventMovedOnline';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: params.name,
    startDate: params.startDate,
    ...(params.endDate && { endDate: params.endDate }),
    ...(params.location && {
      location: { '@type': 'Place', name: params.location },
    }),
    ...(params.homeTeam && {
      homeTeam: {
        '@type': 'SportsTeam',
        name: params.homeTeam.name,
        ...(params.homeTeam.logo && { logo: params.homeTeam.logo }),
        ...(params.homeTeam.url && { url: params.homeTeam.url }),
      },
    }),
    ...(params.awayTeam && {
      awayTeam: {
        '@type': 'SportsTeam',
        name: params.awayTeam.name,
        ...(params.awayTeam.logo && { logo: params.awayTeam.logo }),
        ...(params.awayTeam.url && { url: params.awayTeam.url }),
      },
    }),
    sport: 'Soccer',
    ...(params.url && { url: params.url }),
    ...(params.description && { description: params.description }),
    ...(params.eventStatus && {
      eventStatus: `https://schema.org/${params.eventStatus}`,
    }),
  };
}

// ─── SportsTeam ───────────────────────────────────────────────────────────────
export function generateSportsTeamLD(params: {
  name: string;
  logo: string;
  url: string;
  country?: string;
  foundingDate?: string | number;
  memberOf?: { name: string; url?: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: params.name,
    logo: params.logo,
    url: params.url,
    sport: 'Soccer',
    ...(params.country && {
      location: { '@type': 'Country', name: params.country },
    }),
    ...(params.foundingDate && {
      foundingDate: String(params.foundingDate),
    }),
    ...(params.memberOf && {
      memberOf: {
        '@type': 'SportsOrganization',
        name: params.memberOf.name,
        ...(params.memberOf.url && { url: params.memberOf.url }),
      },
    }),
  };
}

// ─── Person (player) ──────────────────────────────────────────────────────────
export function generatePersonLD(params: {
  name: string;
  image?: string;
  url: string;
  nationality?: string;
  birthDate?: string;
  jobTitle?: string;
  affiliation?: { name: string; url?: string };
  height?: string;
  weight?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: params.name,
    url: params.url,
    ...(params.image && { image: params.image }),
    ...(params.nationality && { nationality: params.nationality }),
    ...(params.birthDate && { birthDate: params.birthDate }),
    jobTitle: params.jobTitle ?? 'Football Player',
    ...(params.affiliation && {
      affiliation: {
        '@type': 'SportsTeam',
        name: params.affiliation.name,
        ...(params.affiliation.url && { url: params.affiliation.url }),
      },
    }),
    ...(params.height && { height: params.height }),
    ...(params.weight && { weight: params.weight }),
  };
}

// ─── SportsOrganization (league) ─────────────────────────────────────────────
export function generateSportsOrgLD(params: {
  name: string;
  logo: string;
  url: string;
  country?: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: params.name,
    logo: params.logo,
    url: params.url,
    sport: 'Soccer',
    ...(params.country && {
      location: { '@type': 'Country', name: params.country },
    }),
    ...(params.description && { description: params.description }),
  };
}
// ─── BreadcrumbList ──────────────────────────────────────────────────────────
export function generateBreadcrumbLD(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  };
}
