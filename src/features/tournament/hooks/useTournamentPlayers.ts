import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  fetchTournamentPlayers,
  fetchAllPlayers,
  addPlayerToTournament,
  removePlayerFromTournament
} from '@/features/tournament/api/tournamentApi';
import {
  TournamentPlayer,
  Player,
  Tournament
} from '@/features/tournament/api/types';

export function useTournamentPlayers(
  tournamentId: string,
  tournament: Tournament | null,
  t: (key: string, params?: Record<string, any>) => string
) {
  const callApi = useApi();
  const [tournamentPlayers, setTournamentPlayers] = useState<
    TournamentPlayer[]
  >([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingAllPlayers, setLoadingAllPlayers] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [deletingPlayer, setDeletingPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load tournament players
  const loadTournamentPlayers = async () => {
    try {
      setLoadingPlayers(true);
      const data = await fetchTournamentPlayers(callApi, tournamentId);
      setTournamentPlayers(data);
    } catch (error) {
      console.error('Error fetching tournament players:', error);
      toast.error(t('failedLoadPlayers'));
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Load all players
  const loadAllPlayers = async () => {
    try {
      setLoadingAllPlayers(true);
      const data = await fetchAllPlayers(callApi);
      setAllPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error(t('failedLoadPlayers'));
    } finally {
      setLoadingAllPlayers(false);
    }
  };

  // Add player to tournament
  const handleAddPlayerToTournament = async (playerId: number) => {
    try {
      // Check if tournament player limit is reached
      if (tournament && tournamentPlayers.length >= tournament.players_number) {
        toast.error(
          t('playerLimitReached', {
            number: tournament.players_number
          })
        );
        return;
      }

      setAddingPlayer(true);
      await addPlayerToTournament(callApi, tournamentId, playerId);
      toast.success(t('playerAdded'));
      loadTournamentPlayers(); // Refresh the list
    } catch (error) {
      console.error('Error adding player to tournament:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedAddPlayer')
      );
    } finally {
      setAddingPlayer(false);
    }
  };

  // Remove player from tournament
  const handleRemovePlayerFromTournament = async (playerId: number) => {
    try {
      setDeletingPlayer(true);
      await removePlayerFromTournament(callApi, tournamentId, playerId);
      toast.success(t('playerRemoved'));
      loadTournamentPlayers(); // Refresh the list
    } catch (error) {
      console.error('Error removing player from tournament:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedToRemovePlayer')
      );
    } finally {
      setDeletingPlayer(false);
    }
  };

  // Handle player creation and automatic addition to tournament
  const handlePlayerCreated = async (playerId: number) => {
    await handleAddPlayerToTournament(playerId);
    loadAllPlayers(); // Refresh the player list in the background
  };

  // Filter players by search query
  const filteredPlayers =
    searchQuery.trim() === ''
      ? allPlayers
      : allPlayers.filter(
          (player) =>
            player.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (player.name &&
              player.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (player.surname &&
              player.surname
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (player.email &&
              player.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );

  // Calculate player count percentage
  const getPlayerCountProgress = () => {
    if (!tournament || tournament.players_number === 0) return 0;
    return (tournamentPlayers.length / tournament.players_number) * 100;
  };

  // Check if player limit is reached
  const isPlayerLimitReached = (): boolean => {
    return Boolean(
      tournament && tournamentPlayers.length >= tournament.players_number
    );
  };

  return {
    tournamentPlayers,
    allPlayers,
    filteredPlayers,
    loadingPlayers,
    loadingAllPlayers,
    addingPlayer,
    deletingPlayer,
    searchQuery,
    setSearchQuery,
    loadTournamentPlayers,
    loadAllPlayers,
    handleAddPlayerToTournament,
    handleRemovePlayerFromTournament,
    handlePlayerCreated,
    getPlayerCountProgress,
    isPlayerLimitReached
  };
}
