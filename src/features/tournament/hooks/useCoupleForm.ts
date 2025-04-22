import { useState, useEffect } from 'react';
import { Player, Couple } from '../types';

/**
 * Custom hook for managing couple form state
 *
 * @param availablePlayers - List of available players
 * @param editingCouple - Couple being edited, if any
 * @param resetForm - Whether to reset the form after submission
 * @param maxCouples - Maximum number of couples allowed
 * @param currentCouplesCount - Current number of couples
 */
export function useCoupleForm(
  availablePlayers: Player[],
  editingCouple: Couple | null = null,
  resetForm: boolean = false,
  maxCouples: number = 0,
  currentCouplesCount: number = 0
) {
  // Form state
  const [name, setName] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showSelectMethod, setShowSelectMethod] = useState<boolean>(true);
  const [filteredAvailablePlayers, setFilteredAvailablePlayers] = useState<
    Player[]
  >([]);

  // Check if the max number of couples has been reached
  const isCouplesLimitReached =
    maxCouples > 0 && currentCouplesCount >= maxCouples && !editingCouple;

  // Initialize form with editing couple data if available
  useEffect(() => {
    if (editingCouple) {
      setName(editingCouple.name || '');

      // Find the players from the couple
      const playersInCouple = availablePlayers.filter((player) =>
        [
          editingCouple.first_player_id,
          editingCouple.second_player_id
        ].includes(player.id)
      );

      setSelectedPlayers(playersInCouple);
    }
  }, [editingCouple, availablePlayers]);

  // Reset form state
  const resetFormState = () => {
    setName('');
    setSelectedPlayers([]);
  };

  // Filter available players excluding those already selected
  useEffect(() => {
    const filtered = availablePlayers.filter(
      (player) => !selectedPlayers.some((p) => p.id === player.id)
    );
    setFilteredAvailablePlayers(filtered);
  }, [availablePlayers, selectedPlayers]);

  // Handle player selection
  const handleSelectPlayer = (player: Player) => {
    if (
      selectedPlayers.length < 2 &&
      !selectedPlayers.some((p) => p.id === player.id)
    ) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  // Handle player removal
  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId));
  };

  return {
    name,
    setName,
    selectedPlayers,
    setSelectedPlayers,
    showSelectMethod,
    setShowSelectMethod,
    isCouplesLimitReached,
    resetFormState,
    filteredAvailablePlayers,
    handleRemovePlayer,
    handleSelectPlayer
  };
}
