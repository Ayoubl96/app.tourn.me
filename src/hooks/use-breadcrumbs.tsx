'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { locales } from '@/config/locales';
import { useApi } from '@/hooks/useApi';
import { fetchTournament } from '@/api/tournaments';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' }
  ],
  '/dashboard/tournament': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Tournament', link: '/dashboard/tournament' }
  ],
  '/dashboard/tournament/overview': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Tournament', link: '/dashboard/tournament' },
    { title: 'Overview', link: '/dashboard/tournament/overview' }
  ]
  // Add more custom mappings as needed
};

// Cache for tournament names to avoid repeated API calls
const tournamentNamesCache = new Map<string, string>();

export function useBreadcrumbs() {
  const pathname = usePathname();
  const callApi = useApi();
  const [tournamentName, setTournamentName] = useState<string | null>(null);

  // Extract tournament ID from path if this is a tournament detail page
  const tournamentId = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (
      segments.length >= 3 &&
      segments.includes('dashboard') &&
      segments.includes('tournament') &&
      !['overview', 'tournament'].includes(segments[segments.length - 1])
    ) {
      return segments[segments.length - 1];
    }
    return null;
  }, [pathname]);

  // Fetch tournament name if on a tournament detail page
  useEffect(() => {
    if (!tournamentId) return;

    // If we already have this tournament name in cache, use it
    if (tournamentNamesCache.has(tournamentId)) {
      setTournamentName(tournamentNamesCache.get(tournamentId) || null);
      return;
    }

    // Otherwise fetch the tournament data
    const fetchTournamentData = async () => {
      try {
        const tournament = await fetchTournament(callApi, tournamentId);

        // Store in cache for future use
        tournamentNamesCache.set(tournamentId, tournament.name);
        setTournamentName(tournament.name);
      } catch (error) {}
    };

    fetchTournamentData();
  }, [tournamentId, callApi]);

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, generate breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);

    // Skip the locale segment if it's a recognized locale
    const startIndex =
      segments.length > 0 && locales.includes(segments[0] as any) ? 1 : 0;

    // Map remaining segments to breadcrumb items
    return segments.slice(startIndex).map((segment, index) => {
      // We need to keep the original path including the locale for links to work
      const pathSegments = segments.slice(0, startIndex + index + 1);
      const path = `/${pathSegments.join('/')}`;

      // Special case for tournament detail page - use tournament name instead of ID
      if (
        tournamentId &&
        index === segments.length - 1 - startIndex &&
        tournamentName
      ) {
        return {
          title: tournamentName,
          link: path
        };
      }

      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname, tournamentId, tournamentName]);

  return breadcrumbs;
}
