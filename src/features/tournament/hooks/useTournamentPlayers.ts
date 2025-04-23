import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import {
  Player,
  TournamentPlayer,
  Couple,
  fetchTournamentPlayers,
  fetchTournamentCouples,
  fetchPlayers,
  addPlayerToTournament as apiAddPlayerToTournament,
  removePlayerFromTournament as apiRemovePlayerFromTournament
} from '@/api';
import { toast } from 'sonner';

export const useTournamentPlayers = (
  tournamentId: string,
  isActive: boolean = true,
  playerLimit: number = 0
) => {
  const callApi = useApi();
  const [tournamentPlayers, setTournamentPlayers] = useState<
    TournamentPlayer[]
  >([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingCouples, setLoadingCouples] = useState(false);
  const [loadingAllPlayers, setLoadingAllPlayers] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  // Function to fetch tournament players
  const loadTournamentPlayers = useCallback(async () => {
    try {
      setLoadingPlayers(true);
      const data = await fetchTournamentPlayers(callApi, tournamentId);
      setTournamentPlayers(data);
    } catch (error) {
      console.error('Error fetching tournament players:', error);
      toast.error('Failed to load players');
    } finally {
      setLoadingPlayers(false);
    }
  }, [callApi, tournamentId]);

  // Function to fetch tournament couples
  const loadTournamentCouples = useCallback(async () => {
    try {
      setLoadingCouples(true);
      const data = await fetchTournamentCouples(callApi, tournamentId);
      setCouples(data);
    } catch (error) {
      console.error('Error fetching tournament couples:', error);
      toast.error('Failed to load couples');
    } finally {
      setLoadingCouples(false);
    }
  }, [callApi, tournamentId]);

  // Function to fetch all players
  const loadAllPlayers = useCallback(async () => {
    try {
      setLoadingAllPlayers(true);
      const data = await fetchPlayers(callApi);
      setAllPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    } finally {
      setLoadingAllPlayers(false);
    }
  }, [callApi]);

  // Add player to tournament
  const handleAddPlayerToTournament = useCallback(
    async (playerId: number) => {
      try {
        // Check if player limit is reached
        if (playerLimit > 0 && tournamentPlayers.length >= playerLimit) {
          toast.error(`Player limit reached (${playerLimit})`);
          return;
        }

        setAddingPlayer(true);
        await apiAddPlayerToTournament(callApi, tournamentId, playerId);
        toast.success('Player added');
        await loadTournamentPlayers(); // Refresh the list
      } catch (error) {
        console.error('Error adding player to tournament:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to add player'
        );
      } finally {
        setAddingPlayer(false);
      }
    },
    [
      callApi,
      tournamentId,
      tournamentPlayers.length,
      playerLimit,
      loadTournamentPlayers
    ]
  );

  // Remove player from tournament
  const handleRemovePlayerFromTournament = useCallback(
    async (playerId: number) => {
      try {
        setIsDeletingPlayer(true);
        setPlayerToDelete(playerId);

        await apiRemovePlayerFromTournament(callApi, tournamentId, playerId);
        toast.success('Player removed');

        // Refresh both players and couples lists
        await loadTournamentPlayers();
        await loadTournamentCouples();
      } catch (error) {
        console.error('Error removing player from tournament:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to remove player'
        );
      } finally {
        setIsDeletingPlayer(false);
        setPlayerToDelete(null);
      }
    },
    [callApi, tournamentId, loadTournamentPlayers, loadTournamentCouples]
  );

  // Calculate player count percentage
  const getPlayerCountProgress = useCallback(() => {
    if (playerLimit <= 0) return 0;
    return (tournamentPlayers.length / playerLimit) * 100;
  }, [tournamentPlayers.length, playerLimit]);

  // Check if player limit is reached
  const isPlayerLimitReached = useCallback((): boolean => {
    return playerLimit > 0 && tournamentPlayers.length >= playerLimit;
  }, [tournamentPlayers.length, playerLimit]);

  // Initial data loading
  useEffect(() => {
    if (isActive && tournamentId) {
      loadTournamentPlayers();
      loadTournamentCouples();
    }
  }, [isActive, tournamentId, loadTournamentPlayers, loadTournamentCouples]);

  return {
    tournamentPlayers,
    couples,
    allPlayers,
    loadingPlayers,
    loadingCouples,
    loadingAllPlayers,
    addingPlayer,
    isDeletingPlayer,
    playerToDelete,
    setPlayerToDelete,
    loadTournamentPlayers,
    loadTournamentCouples,
    loadAllPlayers,
    addPlayerToTournament: handleAddPlayerToTournament,
    removePlayerFromTournament: handleRemovePlayerFromTournament,
    getPlayerCountProgress,
    isPlayerLimitReached
  };
};
