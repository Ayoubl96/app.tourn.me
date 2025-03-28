import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddPlayerSelector } from '@/features/tournament/components/AddPlayerSelector';
import { CreatePlayerForm } from '@/features/tournament/components/CreatePlayerForm';
import { ImportPlaytomicPlayer } from '@/features/tournament/components/ImportPlaytomicPlayer';
import { PlayerCard } from '@/features/tournament/components/PlayerCard';
import { useTournament } from '@/features/tournament/context/TournamentContext';
import { Player } from '@/features/tournament/api/types';

interface AddPlayerSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonText: string;
  buttonDisabled?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPlayers: Player[];
  handleAddPlayerToTournament: (playerId: number) => Promise<void>;
  handlePlayerCreated: (playerId: number) => Promise<void>;
  getPlayerCountProgress: () => number;
  isPlayerLimitReached: () => boolean;
  t: (key: string, params?: Record<string, any>) => string;
  addingPlayer: boolean;
  children?: React.ReactNode;
}

export function AddPlayerSidebar({
  open,
  onOpenChange,
  buttonText,
  buttonDisabled = false,
  searchQuery,
  setSearchQuery,
  filteredPlayers,
  handleAddPlayerToTournament,
  handlePlayerCreated,
  getPlayerCountProgress,
  isPlayerLimitReached,
  t,
  addingPlayer,
  children
}: AddPlayerSidebarProps) {
  const { tournament, tournamentPlayers, loadingAllPlayers, loadAllPlayers } =
    useTournament();
  const [playerAdditionMode, setPlayerAdditionMode] = useState<
    'selection' | 'existing' | 'create' | 'import'
  >('selection');

  // Reset player addition mode when sidebar is closed
  useEffect(() => {
    if (!open) {
      setPlayerAdditionMode('selection');
    }
  }, [open]);

  // Function to handle the player addition mode selection
  const handlePlayerAdditionModeSelect = (
    mode: 'existing' | 'create' | 'import'
  ) => {
    setPlayerAdditionMode(mode);

    // If selecting existing, make sure we fetch all players
    if (mode === 'existing') {
      loadAllPlayers();
    }
  };

  // Function to go back to selection screen
  const handleBackToSelection = () => {
    setPlayerAdditionMode('selection');
  };

  // Function to filter players
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Update the handlePlayerImported function to handle the success/failure status
  const handlePlayerImported = async (
    success: boolean,
    playerId?: number,
    errorMessage?: string
  ) => {
    if (success && playerId) {
      // Only try to add player to tournament if import was successful
      try {
        await handleAddPlayerToTournament(playerId);
        // Return to selection screen after player import and addition
        setPlayerAdditionMode('selection');
        loadAllPlayers(); // Refresh the player list in the background
      } catch (error) {
        // Error will be handled inside handleAddPlayerToTournament function
        console.error('Error adding imported player to tournament:', error);
        // Don't return to selection screen so they can retry adding
      }
    } else {
      // Import failed - don't attempt to add to tournament
      console.error('Player import failed:', errorMessage);
      // Stay on the import screen to allow them to retry
    }
  };

  // Function to render different player addition options
  const renderPlayerAdditionOptions = () => {
    // When sidebar is initially opened, show selection screen
    if (playerAdditionMode === 'selection') {
      return (
        <AddPlayerSelector
          onSelectOption={handlePlayerAdditionModeSelect}
          t={t}
        />
      );
    }

    // Show back button when in any specific mode
    const renderBackButton = () => (
      <Button
        variant='ghost'
        size='sm'
        onClick={handleBackToSelection}
        className='mb-4'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        {t('backToOptions')}
      </Button>
    );

    // Existing players mode
    if (playerAdditionMode === 'existing') {
      return (
        <div className='pt-4'>
          {renderBackButton()}
          <div className='mb-4 flex items-center space-x-2'>
            <Input
              placeholder={t('searchPlayers')}
              value={searchQuery}
              onChange={handleSearchChange}
              className='flex-1'
            />
            <Button
              variant='outline'
              size='icon'
              onClick={() => {
                setSearchQuery('');
                loadAllPlayers();
              }}
              title={t('refresh')}
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>

          {loadingAllPlayers ? (
            <div className='space-y-2 py-6'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : (
            <ScrollArea className='h-[calc(100vh-320px)]'>
              <div className='space-y-2 pr-4'>
                {filteredPlayers.length === 0 ? (
                  <p className='py-4 text-center text-muted-foreground'>
                    {t('noPlayersFound')}
                  </p>
                ) : (
                  filteredPlayers.map((player) => (
                    <div key={player.id} className='w-full'>
                      <PlayerCard
                        player={player}
                        t={t}
                        showAddButton={true}
                        onAdd={handleAddPlayerToTournament}
                        isAddDisabled={
                          addingPlayer ||
                          tournamentPlayers.some(
                            (tp) => tp.player_id === player.id
                          ) ||
                          isPlayerLimitReached()
                        }
                        isAdded={tournamentPlayers.some(
                          (tp) => tp.player_id === player.id
                        )}
                        isAddLoading={addingPlayer}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      );
    }

    // Create player mode
    if (playerAdditionMode === 'create') {
      return (
        <div className='pt-4'>
          {renderBackButton()}
          <h4 className='mb-4 text-sm font-medium'>{t('createNewPlayer')}</h4>
          <CreatePlayerForm
            onPlayerCreated={handlePlayerCreated}
            onCancel={handleBackToSelection}
            t={t}
          />
        </div>
      );
    }

    // Import from Playtomic mode
    if (playerAdditionMode === 'import') {
      return (
        <div className='pt-4'>
          {renderBackButton()}
          <h4 className='mb-4 text-sm font-medium'>
            {t('importFromPlaytomic')}
          </h4>
          <ImportPlaytomicPlayer
            onPlayerImported={handlePlayerImported}
            onCancel={handleBackToSelection}
            t={t}
            tournamentId={tournament?.id.toString() ?? ''}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {children ?? (
          <Button
            size='sm'
            className='gap-1'
            disabled={buttonDisabled || isPlayerLimitReached()}
          >
            {buttonText}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side='right' className='w-full overflow-y-auto sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{t('addPlayerToTournament')}</SheetTitle>
          {isPlayerLimitReached() && (
            <Alert variant='destructive' className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {t('playerLimitReached', {
                  number: tournament?.players_number
                })}
              </AlertDescription>
            </Alert>
          )}
          <div className='mt-2'>
            <div className='mb-1 flex justify-between text-sm'>
              <span>
                {t('players')}: {tournamentPlayers.length} /{' '}
                {tournament?.players_number}
              </span>
              <span>{Math.round(getPlayerCountProgress())}%</span>
            </div>
            <Progress value={getPlayerCountProgress()} className='h-2' />
          </div>
        </SheetHeader>

        {/* Player addition content based on selected mode */}
        {renderPlayerAdditionOptions()}
      </SheetContent>
    </Sheet>
  );
}
