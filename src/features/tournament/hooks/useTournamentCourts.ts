import { useState, useCallback, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import {
  TournamentCourt,
  AddCourtToTournamentParams,
  UpdateTournamentCourtParams
} from '@/api/tournaments/types';
import {
  fetchTournamentCourts,
  addCourtToTournament,
  updateTournamentCourt,
  removeCourtFromTournament
} from '@/api/tournaments/api';

export const useTournamentCourts = (
  tournamentId: string,
  isActive: boolean = false
) => {
  const callApi = useApi();
  const [tournamentCourts, setTournamentCourts] = useState<TournamentCourt[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [courtToRemove, setCourtToRemove] = useState<number | null>(null);
  const [noData, setNoData] = useState(false);

  // Load tournament courts - get courts specifically for this tournament
  const loadTournamentCourts = useCallback(async () => {
    if (!tournamentId) return;

    setLoading(true);
    setError(null);

    try {
      // This endpoint gets tournament courts: /tournaments/{id}/court
      const courts = await fetchTournamentCourts(callApi, tournamentId);

      if (courts && Array.isArray(courts)) {
        setTournamentCourts(courts);
        setNoData(courts.length === 0);
      } else {
        setTournamentCourts([]);
        setNoData(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load tournament courts'
      );
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [callApi, tournamentId]);

  // Add court to tournament
  const addCourt = useCallback(
    async (params: AddCourtToTournamentParams) => {
      setIsAdding(true);

      try {
        const addedCourt = await addCourtToTournament(
          callApi,
          tournamentId,
          params
        );

        if (addedCourt) {
          // After successful add, refresh the full court list
          await loadTournamentCourts();
          setNoData(false);
        }

        return addedCourt;
      } catch (err) {
        // Don't set error state to avoid showing the error UI
        // Let the parent component handle the error via toast
        throw err;
      } finally {
        setIsAdding(false);
      }
    },
    [callApi, tournamentId, loadTournamentCourts]
  );

  // Update tournament court
  const updateCourt = useCallback(
    async (courtId: number, params: UpdateTournamentCourtParams) => {
      setIsUpdating(true);

      try {
        const updatedCourt = await updateTournamentCourt(
          callApi,
          tournamentId,
          courtId,
          params
        );

        if (updatedCourt) {
          // After successful update, refresh the full court list
          await loadTournamentCourts();
        }

        return updatedCourt;
      } catch (err) {
        // Don't set error state to avoid showing the error UI
        // Let the parent component handle the error via toast
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [callApi, tournamentId, loadTournamentCourts]
  );

  // Remove court from tournament
  const removeCourt = useCallback(
    async (courtId: number) => {
      setIsRemoving(true);

      try {
        await removeCourtFromTournament(callApi, tournamentId, courtId);

        // After successful remove, refresh the courts
        await loadTournamentCourts();

        setCourtToRemove(null);
      } catch (err) {
        // Don't set error state to avoid showing the error UI
        // Let the parent component handle the error via toast
        throw err;
      } finally {
        setIsRemoving(false);
      }
    },
    [callApi, tournamentId, loadTournamentCourts]
  );

  // When component becomes active, load tournament courts
  useEffect(() => {
    let mounted = true;

    if (isActive && mounted) {
      loadTournamentCourts();
    }

    return () => {
      mounted = false;
    };
  }, [isActive, loadTournamentCourts]);

  return {
    tournamentCourts,
    loading,
    error,
    isAdding,
    isRemoving,
    isUpdating,
    courtToRemove,
    setCourtToRemove,
    loadTournamentCourts,
    addCourt,
    updateCourt,
    removeCourt,
    noData
  };
};
