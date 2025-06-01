import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { TournamentStandingsResponse } from '@/api/tournaments/types';
import {
  fetchTournamentStandings,
  recalculateTournamentStats
} from '@/api/tournaments/api';
import { toast } from 'sonner';

export const useTournamentStandings = (
  tournamentId: string,
  groupId?: string
) => {
  const callApi = useApi();
  const [standings, setStandings] =
    useState<TournamentStandingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tournament standings
  const loadStandings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchTournamentStandings(
        callApi,
        tournamentId,
        groupId
      );
      setStandings(data);
    } catch (err) {
      console.error('Error fetching tournament standings:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load standings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [callApi, tournamentId, groupId]);

  // Recalculate tournament statistics
  const recalculateStats = useCallback(async () => {
    try {
      setIsRecalculating(true);
      setError(null);

      await recalculateTournamentStats(callApi, tournamentId);
      toast.success('Tournament statistics recalculated successfully');

      // Reload standings after recalculation
      await loadStandings();
    } catch (err) {
      console.error('Error recalculating tournament stats:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to recalculate statistics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRecalculating(false);
    }
  }, [callApi, tournamentId, loadStandings]);

  return {
    standings,
    isLoading,
    isRecalculating,
    error,
    loadStandings,
    recalculateStats
  };
};
