import { useState } from 'react';
import { Player } from '../types';
import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';

/**
 * Custom hook for handling drag and drop functionality for player selection
 *
 * @param availablePlayers - List of available players
 * @param selectedPlayers - Currently selected players
 * @param setSelectedPlayers - Setter function for selected players
 */
export function useDragAndDrop(
  availablePlayers: Player[],
  selectedPlayers: Player[],
  setSelectedPlayers: React.Dispatch<React.SetStateAction<Player[]>>
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  // Set up sensors for drag and drop with longer press delay for mobile
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5 // 5px movement before drag starts - reduced for better responsiveness
    }
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100, // 100ms wait before drag starts - reduced for better responsiveness
      tolerance: 8 // 8px movement allowed during delay - increased for better tolerance
    }
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;

    setActiveId(id);

    // Find the player being dragged
    const playerId = Number(id.replace('player-', ''));
    const player = [...availablePlayers, ...selectedPlayers].find(
      (p) => p.id === playerId
    );

    if (player) {
      setActivePlayer(player);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If we don't have an active or over element, return
    if (!active || !over) {
      setActiveId(null);
      setActivePlayer(null);
      return;
    }

    // Extract the player ID from the draggable item
    const playerId = Number((active.id as string).replace('player-', ''));
    const player = [...availablePlayers, ...selectedPlayers].find(
      (p) => p.id === playerId
    );

    if (!player) {
      setActiveId(null);
      setActivePlayer(null);
      return;
    }

    // Handle dropping into selected players zone
    if (over.id === 'selected-dropzone') {
      // Check if player is already selected
      const isAlreadySelected = selectedPlayers.some((p) => p.id === player.id);

      if (!isAlreadySelected) {
        // Only add if we haven't reached the max of 2 players
        if (selectedPlayers.length < 2) {
          setSelectedPlayers([...selectedPlayers, player]);
        }
      }
    }

    // Handle dropping into available players zone
    if (over.id === 'available-dropzone') {
      // Only remove if the player is currently selected
      const isSelected = selectedPlayers.some((p) => p.id === player.id);

      if (isSelected) {
        setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
      }
    }

    // Reset active id and player
    setActiveId(null);
    setActivePlayer(null);
  };

  return {
    sensors,
    activeId,
    activePlayer,
    handleDragStart,
    handleDragEnd
  };
}
