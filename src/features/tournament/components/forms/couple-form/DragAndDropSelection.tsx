import React from 'react';
import { Player } from '../../../types';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { DraggableItem, DropZone } from '@/components/dnd';

interface DragAndDropSelectionProps {
  availablePlayers: Player[];
  selectedPlayers: Player[];
  sensors: any;
  activePlayer: Player | null;
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => void;
  filteredAvailablePlayers?: Player[];
  renderPlayer: (player: Player) => React.ReactNode;
}

export function DragAndDropSelection({
  availablePlayers,
  selectedPlayers,
  sensors,
  activePlayer,
  handleDragStart,
  handleDragEnd,
  filteredAvailablePlayers,
  renderPlayer
}: DragAndDropSelectionProps) {
  // Use filtered available players if provided, otherwise use all available players
  const displayedAvailablePlayers =
    filteredAvailablePlayers ||
    availablePlayers.filter(
      (player) => !selectedPlayers.some((p) => p.id === player.id)
    );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='flex w-full flex-col gap-6'>
        {/* Available players */}
        <div className='w-full'>
          <h3 className='mb-2 text-lg font-medium'>Available Players</h3>
          <DropZone
            id='available-dropzone'
            className='flex min-h-[200px] flex-col rounded-lg border bg-background p-4'
            activeClassName='border-primary/50 bg-primary/5'
          >
            {displayedAvailablePlayers.length > 0 ? (
              <div className='flex w-full flex-col space-y-2'>
                {displayedAvailablePlayers.map((player) => (
                  <DraggableItem
                    id={`player-${player.id}`}
                    key={`player-${player.id}`}
                    className='block w-full rounded-md border bg-card p-3'
                  >
                    {renderPlayer(player)}
                  </DraggableItem>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                No players available. Please add players first.
              </div>
            )}
          </DropZone>
        </div>

        {/* Selected players */}
        <div className='w-full'>
          <h3 className='mb-2 text-lg font-medium'>Selected Players (Max 2)</h3>
          <DropZone
            id='selected-dropzone'
            className='flex min-h-[200px] flex-col rounded-lg border bg-background p-4'
            activeClassName='border-primary/50 bg-primary/5'
          >
            {selectedPlayers.length > 0 ? (
              <div className='flex w-full flex-col space-y-2'>
                {selectedPlayers.map((player) => (
                  <DraggableItem
                    id={`player-${player.id}`}
                    key={`player-${player.id}`}
                    className='block w-full rounded-md border bg-card p-3'
                  >
                    {renderPlayer(player)}
                  </DraggableItem>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                Drag players here to select them for this couple
              </div>
            )}
          </DropZone>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activePlayer ? (
          <div className='w-full max-w-md rounded-md border bg-card p-2 opacity-80'>
            {renderPlayer(activePlayer)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
