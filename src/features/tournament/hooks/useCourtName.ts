import { useTranslations } from 'next-intl';

/**
 * Court data sources that can be used for court name lookups
 */
interface CourtDataSource {
  id: number;
  court_name?: string;
  name?: string;
}

interface UseCourtNameOptions {
  /** Court data from stage match info */
  stageCourts?: CourtDataSource[];
  /** Court data from tournament match order info */
  tournamentCourts?: CourtDataSource[];
  /** Additional court data from other sources */
  additionalCourts?: CourtDataSource[];
}

/**
 * Custom hook for centralized court name lookups
 * Handles multiple data sources and provides consistent fallbacks
 */
export const useCourtName = (options: UseCourtNameOptions = {}) => {
  const t = useTranslations('Dashboard');

  const {
    stageCourts = [],
    tournamentCourts = [],
    additionalCourts = []
  } = options;

  /**
   * Get court name from court ID with intelligent fallback logic
   */
  const getCourtName = (courtId: number | null): string => {
    if (!courtId) {
      return t('noCourtAssigned', { defaultValue: 'No court assigned' });
    }

    // Try to find court in different data sources in order of priority
    const allCourtSources = [stageCourts, tournamentCourts, additionalCourts];

    for (const courtSource of allCourtSources) {
      const court = courtSource.find((c: CourtDataSource) => c.id === courtId);
      if (court) {
        // Handle different naming conventions across data sources
        const courtName = court.court_name || court.name;
        if (courtName) {
          return courtName;
        }
      }
    }

    // Fallback to generic court name with ID
    return `${t('court', { defaultValue: 'Court' })} ${courtId}`;
  };

  /**
   * Get detailed court information including name and additional metadata
   */
  const getCourtInfo = (courtId: number | null) => {
    if (!courtId) {
      return {
        id: null,
        name: t('noCourtAssigned', { defaultValue: 'No court assigned' }),
        found: false,
        source: null
      };
    }

    // Try to find court in different data sources
    const sources = [
      { data: stageCourts, name: 'stage' },
      { data: tournamentCourts, name: 'tournament' },
      { data: additionalCourts, name: 'additional' }
    ];

    for (const source of sources) {
      const court = source.data.find((c: CourtDataSource) => c.id === courtId);
      if (court) {
        const courtName = court.court_name || court.name;
        if (courtName) {
          return {
            id: courtId,
            name: courtName,
            found: true,
            source: source.name,
            rawData: court
          };
        }
      }
    }

    // Return fallback info
    return {
      id: courtId,
      name: `${t('court', { defaultValue: 'Court' })} ${courtId}`,
      found: false,
      source: null
    };
  };

  /**
   * Check if a court exists in any of the data sources
   */
  const courtExists = (courtId: number | null): boolean => {
    if (!courtId) return false;

    const allCourtSources = [stageCourts, tournamentCourts, additionalCourts];

    return allCourtSources.some((courtSource) =>
      courtSource.some((c: CourtDataSource) => c.id === courtId)
    );
  };

  /**
   * Get all available courts from all sources
   */
  const getAllCourts = () => {
    const allCourts = [
      ...stageCourts,
      ...tournamentCourts,
      ...additionalCourts
    ];

    // Remove duplicates based on ID
    const uniqueCourts = allCourts.filter(
      (court, index, self) =>
        index === self.findIndex((c: CourtDataSource) => c.id === court.id)
    );

    return uniqueCourts.map((court) => ({
      id: court.id,
      name:
        court.court_name ||
        court.name ||
        `${t('court', { defaultValue: 'Court' })} ${court.id}`,
      rawData: court
    }));
  };

  return {
    getCourtName,
    getCourtInfo,
    courtExists,
    getAllCourts
  };
};
