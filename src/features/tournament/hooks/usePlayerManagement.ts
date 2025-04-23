import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { PlayerAdditionMode } from '../types';
import {
  createPlayer as apiCreatePlayer,
  importPlayerFromPlaytomic as apiImportPlayerFromPlaytomic,
  searchPlaytomicPlayers as apiSearchPlaytomicPlayers,
  PlaytomicPlayer
} from '@/api/players';
import { toast } from 'sonner';

export const usePlayerManagement = (
  onPlayerAdded: (playerId: number) => Promise<void>
) => {
  const callApi = useApi();
  const [playerAdditionMode, setPlayerAdditionMode] =
    useState<PlayerAdditionMode>('selection');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [playtomicPlayers, setPlaytomicPlayers] = useState<PlaytomicPlayer[]>(
    []
  );
  const [selectedPlayer, setSelectedPlayer] = useState<PlaytomicPlayer | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Create new player
  const handleCreatePlayer = useCallback(
    async (formData: { nickname: string; gender: string }) => {
      try {
        setIsCreating(true);
        setError(null);

        const newPlayer = await apiCreatePlayer(callApi, {
          nickname: formData.nickname,
          gender: parseInt(formData.gender)
        });

        toast.success('Player created');
        await onPlayerAdded(newPlayer.id);

        // Reset the form state
        setPlayerAdditionMode('selection');
        return newPlayer.id;
      } catch (error) {
        console.error('Error creating player:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to create player'
        );
        toast.error(
          error instanceof Error ? error.message : 'Failed to create player'
        );
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [callApi, onPlayerAdded]
  );

  // Search for Playtomic players
  const handleSearchPlaytomicPlayers = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) return;

      try {
        setIsSearching(true);
        setError(null);

        const data = await apiSearchPlaytomicPlayers(callApi, searchTerm);
        setPlaytomicPlayers(data);
      } catch (error) {
        console.error('Error searching Playtomic players:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to search Playtomic players'
        );
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to search Playtomic players'
        );
      } finally {
        setIsSearching(false);
      }
    },
    [callApi]
  );

  // Import player from Playtomic
  const handleImportPlayer = useCallback(
    async (player: PlaytomicPlayer): Promise<void> => {
      if (!player) return;

      try {
        setIsImporting(true);
        setError(null);

        // Convert gender string to integer (1 for male, 2 for female)
        const genderInt = player.gender.toUpperCase() === 'MALE' ? 1 : 2;

        const importedPlayer = await apiImportPlayerFromPlaytomic(callApi, {
          user_id: player.user_id,
          gender: genderInt
        });
        toast.success('Player imported');

        await onPlayerAdded(importedPlayer.id);
        setPlayerAdditionMode('selection');
      } catch (error) {
        console.error('Error importing player:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to import player'
        );
        toast.error(
          error instanceof Error ? error.message : 'Failed to import player'
        );
        throw error;
      } finally {
        setIsImporting(false);
      }
    },
    [callApi, onPlayerAdded]
  );

  // Reset state when changing modes
  const handleSelectMode = useCallback((mode: PlayerAdditionMode) => {
    setPlayerAdditionMode(mode);
    setError(null);
    setSearchQuery('');
    setSearchTerm('');
    setSelectedPlayer(null);
  }, []);

  return {
    playerAdditionMode,
    searchQuery,
    isCreating,
    searchTerm,
    isSearching,
    isImporting,
    playtomicPlayers,
    selectedPlayer,
    error,
    setPlayerAdditionMode,
    setSearchQuery,
    setSearchTerm,
    setSelectedPlayer,
    handleCreatePlayer,
    handleSearchPlaytomicPlayers,
    handleImportPlayer,
    handleSelectMode
  };
};
