import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { Couple, Player } from '../types';
import { toast } from 'sonner';
import { createCouple, updateCouple, deleteCouple } from '../api/tournamentApi';

// Utility function to generate a random couple name
const generateCoupleName = (player1: Player, player2: Player) => {
  return `${player1.nickname.split(' ')[0]} & ${player2.nickname.split(' ')[0]}`;
};

interface CreateCoupleData {
  first_player_id: number;
  second_player_id: number;
  name?: string;
}

interface EditCoupleData {
  couple_id: number;
  first_player_id: number;
  second_player_id: number;
  name?: string;
}

export const useCoupleManagement = (
  tournamentId: string,
  refreshCouples: () => Promise<void>
) => {
  const callApi = useApi();
  const [isCreatingCouple, setIsCreatingCouple] = useState(false);
  const [isEditingCouple, setIsEditingCouple] = useState(false);
  const [isDeletingCouple, setIsDeletingCouple] = useState(false);
  const [coupleToEdit, setCoupleToEdit] = useState<Couple | null>(null);
  const [coupleToDelete, setCoupleToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create a new couple
  const handleCreateCouple = useCallback(
    async (data: CreateCoupleData) => {
      try {
        setIsCreatingCouple(true);
        setError(null);

        await createCouple(callApi, tournamentId, {
          first_player_id: data.first_player_id,
          second_player_id: data.second_player_id,
          name: data.name || ''
        });

        toast.success('Couple created successfully');
        await refreshCouples();
      } catch (error) {
        console.error('Error creating couple:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to create couple'
        );
        toast.error(
          error instanceof Error ? error.message : 'Failed to create couple'
        );
        throw error;
      } finally {
        setIsCreatingCouple(false);
      }
    },
    [callApi, tournamentId, refreshCouples]
  );

  // Edit an existing couple
  const handleEditCouple = useCallback(
    async (data: EditCoupleData) => {
      try {
        setIsEditingCouple(true);
        setError(null);

        await updateCouple(callApi, tournamentId, data.couple_id, {
          tournament_id: parseInt(tournamentId),
          first_player_id: data.first_player_id,
          second_player_id: data.second_player_id,
          name: data.name || ''
        });

        toast.success('Couple updated successfully');
        await refreshCouples();
        setCoupleToEdit(null);
      } catch (error) {
        console.error('Error updating couple:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to update couple'
        );
        toast.error(
          error instanceof Error ? error.message : 'Failed to update couple'
        );
        throw error;
      } finally {
        setIsEditingCouple(false);
      }
    },
    [callApi, tournamentId, refreshCouples]
  );

  // Delete a couple
  const handleDeleteCouple = useCallback(
    async (coupleId: number) => {
      try {
        setIsDeletingCouple(true);
        setCoupleToDelete(coupleId);
        setError(null);

        await deleteCouple(callApi, tournamentId, coupleId);

        toast.success('Couple deleted successfully');
        await refreshCouples();
        return true;
      } catch (error) {
        console.error('Error deleting couple:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to delete couple'
        );
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete couple'
        );
        throw error;
      } finally {
        setIsDeletingCouple(false);
        setCoupleToDelete(null);
      }
    },
    [callApi, tournamentId, refreshCouples]
  );

  return {
    isCreatingCouple,
    isEditingCouple,
    isDeletingCouple,
    coupleToEdit,
    coupleToDelete,
    error,
    setCoupleToEdit,
    setCoupleToDelete,
    createCouple: handleCreateCouple,
    editCouple: handleEditCouple,
    deleteCouple: handleDeleteCouple,
    generateCoupleName
  };
};
