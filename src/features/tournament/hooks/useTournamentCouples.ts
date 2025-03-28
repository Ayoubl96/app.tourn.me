import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  fetchTournamentCouples,
  createCouple,
  updateCouple,
  deleteCouple
} from '@/features/tournament/api/tournamentApi';
import { Couple, TournamentPlayer } from '@/features/tournament/api/types';

export function useTournamentCouples(
  tournamentId: string,
  tournamentPlayers: TournamentPlayer[],
  t: (key: string, params?: Record<string, any>) => string,
  onCoupleChange?: () => void
) {
  const callApi = useApi();
  const [couples, setCouples] = useState<Couple[]>([]);
  const [loadingCouples, setLoadingCouples] = useState(false);
  const [editingCouple, setEditingCouple] = useState<Couple | undefined>(
    undefined
  );
  const [isDeletingCouple, setIsDeletingCouple] = useState(false);

  // Load tournament couples
  const loadTournamentCouples = async () => {
    try {
      setLoadingCouples(true);
      const data = await fetchTournamentCouples(callApi, tournamentId);
      setCouples(data);
    } catch (error) {
      console.error('Error fetching tournament couples:', error);
      toast.error(t('failedLoadCouples'));
    } finally {
      setLoadingCouples(false);
    }
  };

  // Create a new couple
  const handleCreateCouple = async (
    player1Id: number,
    player2Id: number,
    name?: string
  ) => {
    try {
      await createCouple(
        callApi,
        tournamentId,
        player1Id,
        player2Id,
        name || ''
      );
      toast.success(t('coupleCreated'));
      await loadTournamentCouples();
      onCoupleChange?.();
    } catch (error) {
      console.error('Error creating couple:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedCreateCouple')
      );
      throw error;
    }
  };

  // Update an existing couple
  const handleUpdateCouple = async (
    coupleId: number,
    player1Id: number,
    player2Id: number,
    name?: string
  ) => {
    try {
      await updateCouple(
        callApi,
        tournamentId,
        coupleId,
        player1Id,
        player2Id,
        name || ''
      );
      toast.success(t('coupleUpdated'));
      await loadTournamentCouples();
      onCoupleChange?.();
    } catch (error) {
      console.error('Error updating couple:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedUpdateCouple')
      );
      throw error;
    }
  };

  // Delete a couple
  const handleDeleteCouple = async (coupleId: number) => {
    try {
      setIsDeletingCouple(true);
      await deleteCouple(callApi, tournamentId, coupleId);
      toast.success(t('coupleDeleted'));
      await loadTournamentCouples();
      onCoupleChange?.();
    } catch (error) {
      console.error('Error deleting couple:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedToDeleteCouple')
      );
    } finally {
      setIsDeletingCouple(false);
    }
  };

  // Calculate maximum possible couples (players / 2)
  const getMaxPossibleCouples = (): number => {
    if (tournamentPlayers.length === 0) return 0;
    return Math.floor(tournamentPlayers.length / 2);
  };

  // Calculate couple count percentage
  const getCoupleCountProgress = () => {
    const maxCouples = getMaxPossibleCouples();
    if (maxCouples === 0) return 0;
    return (couples.length / maxCouples) * 100;
  };

  // Check if couple limit is reached
  const isCoupleLimitReached = (): boolean => {
    return (
      couples.length >= getMaxPossibleCouples() && tournamentPlayers.length >= 2
    );
  };

  return {
    couples,
    loadingCouples,
    editingCouple,
    setEditingCouple,
    isDeletingCouple,
    loadTournamentCouples,
    handleCreateCouple,
    handleUpdateCouple,
    handleDeleteCouple,
    getMaxPossibleCouples,
    getCoupleCountProgress,
    isCoupleLimitReached
  };
}
