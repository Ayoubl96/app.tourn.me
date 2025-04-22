import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Tournament } from '../types';
import { fetchTournament } from '../api/tournamentApi';
import { toast } from 'sonner';

export const useTournament = (tournamentId: string) => {
  const callApi = useApi();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTournament = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchTournament(callApi, tournamentId);
        setTournament(data);
      } catch (err) {
        console.error('Error fetching tournament details:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
        toast.error(
          err instanceof Error ? err.message : 'Failed to load tournament'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (tournamentId) {
      loadTournament();
    }
  }, [callApi, tournamentId]);

  return {
    tournament,
    isLoading,
    error
  };
};
