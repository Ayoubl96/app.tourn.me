import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { useApi } from '@/hooks/useApi';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  Player,
  PlaytomicPlayer
} from '../types';
import { TournamentService } from '../api/tournamentService';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface TournamentContextValue {
  // Core data
  tournament: Tournament | null;
  tournamentPlayers: TournamentPlayer[];
  couples: Couple[];
  allPlayers: Player[];

  // Loading states
  isLoading: boolean;
  loadingPlayers: boolean;
  loadingCouples: boolean;
  loadingAllPlayers: boolean;

  // Error states
  error: string | null;

  // Player management
  addingPlayer: boolean;
  isDeletingPlayer: boolean;
  playerToDelete: number | null;
  setPlayerToDelete: (id: number | null) => void;
  getPlayerCountProgress: () => number;
  isPlayerLimitReached: () => boolean;

  // Couple management
  isCreatingCouple: boolean;
  isEditingCouple: boolean;
  isDeletingCouple: boolean;
  coupleToEdit: Couple | null;
  coupleToDelete: number | null;
  setCoupleToEdit: (couple: Couple | null) => void;
  setCoupleToDelete: (id: number | null) => void;

  // API methods
  loadTournament: () => Promise<void>;
  loadTournamentPlayers: () => Promise<void>;
  loadTournamentCouples: () => Promise<void>;
  loadAllPlayers: () => Promise<void>;
  addPlayerToTournament: (playerId: number) => Promise<void>;
  removePlayerFromTournament: (playerId: number) => Promise<void>;
  createCouple: (data: {
    first_player_id: number;
    second_player_id: number;
    name: string;
  }) => Promise<void>;
  editCouple: (data: {
    couple_id: number;
    first_player_id: number;
    second_player_id: number;
    name: string;
  }) => Promise<void>;
  deleteCouple: (coupleId: number) => Promise<boolean>;

  // Helper functions
  generateCoupleName: (player1: Player, player2: Player) => string;

  // Playtomic integration
  searchPlaytomicPlayers: (term: string) => Promise<void>;
  importPlayerFromPlaytomic: (player: PlaytomicPlayer) => Promise<void>;
  playtomicPlayers: PlaytomicPlayer[];
  isSearching: boolean;
  isImporting: boolean;
}

// Create the context with a default value
export const TournamentContext = createContext<
  TournamentContextValue | undefined
>(undefined);

// Props for the provider component
interface TournamentProviderProps {
  children: ReactNode;
  tournamentId: string;
  isActive?: boolean;
}

// Provider component
export const TournamentProvider: React.FC<TournamentProviderProps> = ({
  children,
  tournamentId,
  isActive = true
}) => {
  const callApi = useApi();
  const service = new TournamentService(callApi);

  // Core data states
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournamentPlayers, setTournamentPlayers] = useState<
    TournamentPlayer[]
  >([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playtomicPlayers, setPlaytomicPlayers] = useState<PlaytomicPlayer[]>(
    []
  );

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingCouples, setLoadingCouples] = useState(false);
  const [loadingAllPlayers, setLoadingAllPlayers] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Player management states
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  // Couple management states
  const [isCreatingCouple, setIsCreatingCouple] = useState(false);
  const [isEditingCouple, setIsEditingCouple] = useState(false);
  const [isDeletingCouple, setIsDeletingCouple] = useState(false);
  const [coupleToEdit, setCoupleToEdit] = useState<Couple | null>(null);
  const [coupleToDelete, setCoupleToDelete] = useState<number | null>(null);

  // Load tournament data
  const loadTournament = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await service.fetchTournament(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error('Error fetching tournament details:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tournament players
  const loadTournamentPlayers = async () => {
    try {
      setLoadingPlayers(true);
      const data = await service.fetchTournamentPlayers(tournamentId);
      setTournamentPlayers(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load players';
      console.error('Error fetching tournament players:', err);
      toast.error(errorMessage);
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Load tournament couples
  const loadTournamentCouples = async () => {
    try {
      setLoadingCouples(true);
      const data = await service.fetchTournamentCouples(tournamentId);
      setCouples(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load couples';
      console.error('Error fetching tournament couples:', err);
      toast.error(errorMessage);
    } finally {
      setLoadingCouples(false);
    }
  };

  // Load all players
  const loadAllPlayers = async () => {
    try {
      setLoadingAllPlayers(true);
      const data = await service.fetchAllPlayers();
      setAllPlayers(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load players';
      console.error('Error fetching players:', err);
      toast.error(errorMessage);
    } finally {
      setLoadingAllPlayers(false);
    }
  };

  // Add player to tournament
  const addPlayerToTournament = async (playerId: number) => {
    try {
      // Check if player limit is reached
      if (
        tournament &&
        tournament.players_number > 0 &&
        tournamentPlayers.length >= tournament.players_number
      ) {
        toast.error(`Player limit reached (${tournament.players_number})`);
        return;
      }

      setAddingPlayer(true);
      await service.addPlayerToTournament(tournamentId, playerId);
      toast.success('Player added');
      await loadTournamentPlayers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add player';
      console.error('Error adding player to tournament:', err);
      toast.error(errorMessage);
    } finally {
      setAddingPlayer(false);
    }
  };

  // Remove player from tournament
  const removePlayerFromTournament = async (playerId: number) => {
    try {
      setIsDeletingPlayer(true);
      setPlayerToDelete(playerId);

      await service.removePlayerFromTournament(tournamentId, playerId);
      toast.success('Player removed');

      // Refresh both players and couples lists
      await loadTournamentPlayers();
      await loadTournamentCouples();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove player';
      console.error('Error removing player from tournament:', err);
      toast.error(errorMessage);
    } finally {
      setIsDeletingPlayer(false);
      setPlayerToDelete(null);
    }
  };

  // Generate couple name
  const generateCoupleName = (player1: Player, player2: Player) => {
    return `${player1.nickname.split(' ')[0]} & ${player2.nickname.split(' ')[0]}`;
  };

  // Create couple
  const createCouple = async (data: {
    first_player_id: number;
    second_player_id: number;
    name: string;
  }) => {
    try {
      setIsCreatingCouple(true);
      await service.createCouple(tournamentId, data);
      toast.success('Couple created successfully');
      await loadTournamentCouples();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create couple';
      console.error('Error creating couple:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsCreatingCouple(false);
    }
  };

  // Edit couple
  const editCouple = async (data: {
    couple_id: number;
    first_player_id: number;
    second_player_id: number;
    name: string;
  }) => {
    try {
      setIsEditingCouple(true);
      await service.updateCouple(tournamentId, data.couple_id, {
        tournament_id: parseInt(tournamentId),
        first_player_id: data.first_player_id,
        second_player_id: data.second_player_id,
        name: data.name
      });
      toast.success('Couple updated successfully');
      await loadTournamentCouples();
      setCoupleToEdit(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update couple';
      console.error('Error updating couple:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsEditingCouple(false);
    }
  };

  // Delete couple
  const deleteCouple = async (coupleId: number) => {
    try {
      setIsDeletingCouple(true);
      setCoupleToDelete(coupleId);
      await service.deleteCouple(tournamentId, coupleId);
      toast.success('Couple deleted successfully');
      await loadTournamentCouples();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete couple';
      console.error('Error deleting couple:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsDeletingCouple(false);
      setCoupleToDelete(null);
    }
  };

  // Search Playtomic players
  const searchPlaytomicPlayers = async (term: string) => {
    try {
      setIsSearching(true);
      const players = await service.searchPlaytomicPlayers(term);
      setPlaytomicPlayers(players);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to search Playtomic players';
      console.error('Error searching Playtomic players:', err);
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Import player from Playtomic
  const importPlayerFromPlaytomic = async (player: PlaytomicPlayer) => {
    try {
      setIsImporting(true);
      await service.importPlayerFromPlaytomic(
        player.id.toString(),
        player.gender
      );
      toast.success('Player imported successfully');
      await loadAllPlayers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to import player';
      console.error('Error importing player:', err);
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  // Calculate player count percentage
  const getPlayerCountProgress = () => {
    if (!tournament || tournament.players_number <= 0) return 0;
    return (tournamentPlayers.length / tournament.players_number) * 100;
  };

  // Check if player limit is reached
  const isPlayerLimitReached = () => {
    return Boolean(
      tournament &&
        tournament.players_number > 0 &&
        tournamentPlayers.length >= tournament.players_number
    );
  };

  // Initial data loading
  useEffect(() => {
    if (isActive && tournamentId) {
      loadTournament();
    }
  }, [tournamentId, isActive]);

  useEffect(() => {
    if (isActive && tournamentId) {
      loadTournamentPlayers();
      loadTournamentCouples();
    }
  }, [tournamentId, isActive]);

  // Create context value
  const contextValue: TournamentContextValue = {
    // Core data
    tournament,
    tournamentPlayers,
    couples,
    allPlayers,

    // Loading states
    isLoading,
    loadingPlayers,
    loadingCouples,
    loadingAllPlayers,

    // Error state
    error,

    // Player management
    addingPlayer,
    isDeletingPlayer,
    playerToDelete,
    setPlayerToDelete,
    getPlayerCountProgress,
    isPlayerLimitReached,

    // Couple management
    isCreatingCouple,
    isEditingCouple,
    isDeletingCouple,
    coupleToEdit,
    coupleToDelete,
    setCoupleToEdit,
    setCoupleToDelete,

    // API methods
    loadTournament,
    loadTournamentPlayers,
    loadTournamentCouples,
    loadAllPlayers,
    addPlayerToTournament,
    removePlayerFromTournament,
    createCouple,
    editCouple,
    deleteCouple,

    // Helper functions
    generateCoupleName,

    // Playtomic integration
    searchPlaytomicPlayers,
    importPlayerFromPlaytomic,
    playtomicPlayers,
    isSearching,
    isImporting
  };

  return (
    <TournamentContext.Provider value={contextValue}>
      {children}
    </TournamentContext.Provider>
  );
};

// Custom hook to use the tournament context
export const useTournamentContext = () => {
  const context = useContext(TournamentContext);
  const t = useTranslations('Errors');

  if (context === undefined) {
    throw new Error(t('tournamentContextError'));
  }
  return context;
};
