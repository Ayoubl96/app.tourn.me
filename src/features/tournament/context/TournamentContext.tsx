import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { useParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  fetchTournament,
  fetchTournamentPlayers,
  fetchTournamentCouples,
  fetchAllPlayers,
  fetchTournamentStages
} from '@/features/tournament/api/tournamentApi';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  Player,
  TournamentStage
} from '@/features/tournament/api/types';

interface TournamentContextType {
  tournamentId: string;
  tournament: Tournament | null;
  isLoading: boolean;
  error: string | null;
  refreshTournament: () => Promise<void>;
  // Add tournament players
  tournamentPlayers: TournamentPlayer[];
  loadingTournamentPlayers: boolean;
  refreshTournamentPlayers: () => Promise<void>;
  // Add all players
  allPlayers: Player[];
  loadingAllPlayers: boolean;
  loadAllPlayers: () => Promise<void>;
  // Add tournament couples
  couples: Couple[];
  loadingCouples: boolean;
  refreshCouples: () => Promise<void>;
  // Add tournament stages
  stages: TournamentStage[];
  loadingStages: boolean;
  refreshStages: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType>({
  tournamentId: '',
  tournament: null,
  isLoading: false,
  error: null,
  refreshTournament: async () => {},
  // Tournament players default values
  tournamentPlayers: [],
  loadingTournamentPlayers: false,
  refreshTournamentPlayers: async () => {},
  // All players default values
  allPlayers: [],
  loadingAllPlayers: false,
  loadAllPlayers: async () => {},
  // Couples default values
  couples: [],
  loadingCouples: false,
  refreshCouples: async () => {},
  // Stages default values
  stages: [],
  loadingStages: false,
  refreshStages: async () => {}
});

export const useTournament = () => useContext(TournamentContext);

interface TournamentProviderProps {
  children: ReactNode;
}

export function TournamentProvider({ children }: TournamentProviderProps) {
  const params = useParams();
  const tournamentId = params.id as string;
  const callApi = useApi();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add states for tournament players
  const [tournamentPlayers, setTournamentPlayers] = useState<
    TournamentPlayer[]
  >([]);
  const [loadingTournamentPlayers, setLoadingTournamentPlayers] =
    useState(false);

  // Add states for all players
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingAllPlayers, setLoadingAllPlayers] = useState(false);

  // Add states for couples
  const [couples, setCouples] = useState<Couple[]>([]);
  const [loadingCouples, setLoadingCouples] = useState(false);

  // Add states for stages
  const [stages, setStages] = useState<TournamentStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  const loadTournament = async () => {
    if (!tournamentId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTournament(callApi, tournamentId);
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      setError('Failed to load tournament');
      toast.error('Failed to load tournament');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tournament when component mounts or tournamentId changes
  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const refreshTournament = async () => {
    await loadTournament();
  };

  // Load tournament players
  const loadTournamentPlayers = async () => {
    if (!tournamentId) return;

    try {
      setLoadingTournamentPlayers(true);
      const data = await fetchTournamentPlayers(callApi, tournamentId);
      setTournamentPlayers(data);
    } catch (error) {
      console.error('Error fetching tournament players:', error);
      toast.error('Failed to load tournament players');
    } finally {
      setLoadingTournamentPlayers(false);
    }
  };

  // Load all players
  const loadAllPlayers = async () => {
    try {
      setLoadingAllPlayers(true);
      const data = await fetchAllPlayers(callApi);
      setAllPlayers(data);
    } catch (error) {
      console.error('Error fetching all players:', error);
      toast.error('Failed to load players');
    } finally {
      setLoadingAllPlayers(false);
    }
  };

  // Load couples
  const loadCouples = async () => {
    if (!tournamentId) return;

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
  };

  // Load stages
  const loadStages = async () => {
    if (!tournamentId) return;

    try {
      setLoadingStages(true);
      const data = await fetchTournamentStages(callApi, tournamentId);
      setStages(data);
    } catch (error) {
      console.error('Error fetching tournament stages:', error);
      toast.error('Failed to load stages');
    } finally {
      setLoadingStages(false);
    }
  };

  // Load initial data when tournament ID changes
  useEffect(() => {
    if (tournamentId) {
      loadTournamentPlayers();
      loadCouples();
      loadStages();
    }
  }, [tournamentId]);

  const value = {
    tournamentId,
    tournament,
    isLoading,
    error,
    refreshTournament,
    // Tournament players
    tournamentPlayers,
    loadingTournamentPlayers,
    refreshTournamentPlayers: loadTournamentPlayers,
    // All players
    allPlayers,
    loadingAllPlayers,
    loadAllPlayers,
    // Couples
    couples,
    loadingCouples,
    refreshCouples: loadCouples,
    // Stages
    stages,
    loadingStages,
    refreshStages: loadStages
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}
