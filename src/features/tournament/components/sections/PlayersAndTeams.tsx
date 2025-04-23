import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TournamentPlayer, Couple, Player, Tournament } from '../../types';
import { PlayerCard } from '../PlayerCard';
import { CoupleCard } from '../CoupleCard';
import { PlayerAdditionSelector } from '../PlayerAdditionSelector';
import { CreatePlayerForm } from '../forms/CreatePlayerForm';
import { ImportPlaytomicPlayer } from '../forms/ImportPlaytomicPlayer';
import { PlaytomicPlayer } from '../../types';
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  UserPlus,
  Users
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from '@/components/ui/sheet';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

import { useCoupleManagement } from '../../hooks/useCoupleManagement';
import { CoupleForm } from '../forms/CoupleForm';

interface PlayersAndTeamsProps {
  tournament: Tournament;
  tournamentPlayers: TournamentPlayer[];
  couples: Couple[];
  allPlayers: Player[];
  loadingPlayers: boolean;
  loadingCouples: boolean;
  loadingAllPlayers: boolean;
  addingPlayer: boolean;
  isDeletingPlayer: boolean;
  playerToDelete: number | null;
  setPlayerToDelete: (id: number | null) => void;
  getPlayerCountProgress: () => number;
  isPlayerLimitReached: () => boolean;
  loadAllPlayers: () => Promise<void>;
  addPlayerToTournament: (playerId: number) => Promise<void>;
  removePlayerFromTournament: (playerId: number) => Promise<void>;
  loadTournamentCouples: () => Promise<void>;
  // Player management props
  playerAdditionMode: string;
  setPlayerAdditionMode: (mode: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSelectMode: (mode: any) => void;
  // Import Playtomic props
  playtomicPlayers: PlaytomicPlayer[];
  isSearching: boolean;
  isImporting: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPlayer: PlaytomicPlayer | null;
  setSelectedPlayer: (player: PlaytomicPlayer | null) => void;
  handleSearchPlaytomicPlayers: (term: string) => Promise<void>;
  handleImportPlayer: (
    player: PlaytomicPlayer
  ) => Promise<{ success: boolean; needsGender?: boolean; playerId?: number }>;
  handleImportPlayerWithGender: (
    player: PlaytomicPlayer,
    gender: number
  ) => Promise<boolean>;
  handleCreatePlayer: (data: {
    nickname: string;
    gender: string;
  }) => Promise<number>;
  error: string | null;
}

export const PlayersAndTeams: React.FC<PlayersAndTeamsProps> = ({
  tournament,
  tournamentPlayers,
  couples,
  allPlayers,
  loadingPlayers,
  loadingCouples,
  loadingAllPlayers,
  addingPlayer,
  isDeletingPlayer,
  playerToDelete,
  setPlayerToDelete,
  getPlayerCountProgress,
  isPlayerLimitReached,
  loadAllPlayers,
  addPlayerToTournament,
  removePlayerFromTournament,
  loadTournamentCouples,
  // Player management props
  playerAdditionMode,
  setPlayerAdditionMode,
  searchQuery,
  setSearchQuery,
  handleSelectMode,
  // Import Playtomic props
  playtomicPlayers,
  isSearching,
  isImporting,
  searchTerm,
  setSearchTerm,
  selectedPlayer,
  setSelectedPlayer,
  handleSearchPlaytomicPlayers,
  handleImportPlayer,
  handleImportPlayerWithGender,
  handleCreatePlayer,
  error
}) => {
  const t = useTranslations('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCoupleSidebarOpen, setIsCoupleSidebarOpen] = useState(false);
  const [showDeleteCoupleDialog, setShowDeleteCoupleDialog] = useState(false);

  // Use couple management hook
  const {
    isCreatingCouple,
    isEditingCouple,
    isDeletingCouple,
    coupleToEdit,
    coupleToDelete,
    setCoupleToEdit,
    setCoupleToDelete,
    createCouple,
    editCouple,
    deleteCouple,
    generateCoupleName
  } = useCoupleManagement(tournament.id.toString(), loadTournamentCouples);

  // Filter players based on search query
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

  // Handle opening sidebar to existing players mode
  const handleOpenSidebarToExistingPlayers = () => {
    setIsSidebarOpen(true);
    handleSelectMode('existing');
    if (allPlayers.length === 0) {
      loadAllPlayers();
    }
  };

  // Handle player deletion
  const handleDeletePlayer = (playerId: number) => {
    setPlayerToDelete(playerId);
    setShowDeleteDialog(true);
  };

  // Confirm and execute player deletion
  const confirmDeletePlayer = async () => {
    if (playerToDelete) {
      await removePlayerFromTournament(playerToDelete);
      setShowDeleteDialog(false);
    }
  };

  // Reset player addition mode when sidebar is closed
  const handleSidebarOpenChange = (open: boolean) => {
    setIsSidebarOpen(open);
    if (!open) {
      setPlayerAdditionMode('selection');
    } else if (open && playerAdditionMode === 'existing') {
      loadAllPlayers();
    }
  };

  // Render player addition options based on current mode
  const renderPlayerAdditionOptions = () => {
    // When sidebar is initially opened, show selection screen
    if (playerAdditionMode === 'selection') {
      return <PlayerAdditionSelector onSelectOption={handleSelectMode} />;
    }

    // Show back button when in any specific mode
    const renderBackButton = () => (
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleSelectMode('selection')}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    <div
                      key={player.id}
                      className='flex w-full items-center rounded-md border p-2'
                    >
                      <PlayerCard player={player} />
                      <Button
                        size='sm'
                        onClick={() => addPlayerToTournament(player.id)}
                        disabled={
                          addingPlayer ||
                          tournamentPlayers.some(
                            (tp) => tp.player_id === player.id
                          ) ||
                          isPlayerLimitReached()
                        }
                      >
                        {tournamentPlayers.some(
                          (tp) => tp.player_id === player.id
                        )
                          ? t('added')
                          : addingPlayer
                            ? t('adding')
                            : t('add')}
                      </Button>
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
            onPlayerCreated={async (formData) => {
              try {
                await handleCreatePlayer(formData);
              } catch (error) {
                // Error is already handled in the hook
                console.error('Error creating player:', error);
              }
            }}
            onCancel={() => handleSelectMode('selection')}
            isLoading={isImporting}
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
            onPlayerImported={async () => {}} // This is handled by the parent component
            onCancel={() => handleSelectMode('selection')}
            onSearch={handleSearchPlaytomicPlayers}
            onImport={handleImportPlayer}
            onImportWithGender={handleImportPlayerWithGender}
            playtomicPlayers={playtomicPlayers}
            isSearching={isSearching}
            isImporting={isImporting}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            error={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      );
    }

    return null;
  };

  // Function to create a new couple
  const handleCreateCouple = async (data: {
    first_player_id: number;
    second_player_id: number;
    name: string;
  }) => {
    try {
      await createCouple(data);
      // Don't close the sidebar, just reload the couples
      await loadTournamentCouples();
    } catch (error) {
      console.error('Error creating couple:', error);
    }
  };

  // Function to edit a couple
  const handleEditCouple = async (data: {
    couple_id?: number;
    first_player_id: number;
    second_player_id: number;
    name: string;
  }) => {
    if (!data.couple_id) return;

    try {
      await editCouple({
        couple_id: data.couple_id,
        first_player_id: data.first_player_id,
        second_player_id: data.second_player_id,
        name: data.name
      });
      setIsCoupleSidebarOpen(false);
    } catch (error) {
      console.error('Error updating couple:', error);
    }
  };

  // Function to delete a couple
  const handleDeleteCouple = (coupleId: number) => {
    setCoupleToDelete(coupleId);
    setShowDeleteCoupleDialog(true);
  };

  // Confirm couple deletion
  const confirmDeleteCouple = async () => {
    if (coupleToDelete) {
      await deleteCouple(coupleToDelete);
      setShowDeleteCoupleDialog(false);
    }
  };

  // Function to open the couple editing sidebar
  const openCoupleEditSidebar = (couple: Couple) => {
    setCoupleToEdit(couple);
    setIsCoupleSidebarOpen(true);
  };

  // Function to open the couple creation sidebar
  const openCoupleCreateSidebar = () => {
    setCoupleToEdit(null);
    setIsCoupleSidebarOpen(true);
  };

  // Close couple sidebar
  const handleCoupleSidebarClose = () => {
    setCoupleToEdit(null);
    setIsCoupleSidebarOpen(false);
  };

  // Extract available players (those not already in a couple)
  const getAvailablePlayers = (): Player[] => {
    // Get IDs of players already in couples
    const assignedPlayerIds = new Set<number>();
    couples.forEach((couple) => {
      assignedPlayerIds.add(couple.first_player_id);
      assignedPlayerIds.add(couple.second_player_id);
    });

    // If editing, don't exclude the players in the couple being edited
    if (coupleToEdit) {
      assignedPlayerIds.delete(coupleToEdit.first_player_id);
      assignedPlayerIds.delete(coupleToEdit.second_player_id);
    }

    // Return players from tournament who aren't already in couples
    return tournamentPlayers
      .filter((tp) => !assignedPlayerIds.has(tp.player_id))
      .map((tp) => tp.player);
  };

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Tournament Players Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div>
            <CardTitle>{t('players')}</CardTitle>
            <CardDescription className='mt-1.5 flex items-center'>
              <UserPlus className='mr-1 h-4 w-4' />
              {tournamentPlayers.length} / {tournament.players_number}{' '}
              {t('players').toLowerCase()}
            </CardDescription>
          </div>
          <Sheet open={isSidebarOpen} onOpenChange={handleSidebarOpenChange}>
            <SheetTrigger asChild>
              <Button
                size='sm'
                className='gap-1'
                disabled={isPlayerLimitReached()}
              >
                <UserPlus className='h-4 w-4' />
                {t('addPlayer')}
              </Button>
            </SheetTrigger>
            <SheetContent
              side='right'
              className='w-full overflow-y-auto sm:max-w-md'
            >
              <SheetHeader>
                <SheetTitle>{t('addPlayerToTournament')}</SheetTitle>
                <SheetDescription>
                  {tournamentPlayers.length} / {tournament.players_number}{' '}
                  {t('players').toLowerCase()}
                </SheetDescription>
                {isPlayerLimitReached() && (
                  <Alert variant='destructive' className='mt-4'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      {t('playerLimitReached', {
                        number: tournament.players_number
                      })}
                    </AlertDescription>
                  </Alert>
                )}
                <div className='mt-2'>
                  <div className='mb-1 flex justify-between text-sm'>
                    <span>
                      {t('players')}: {tournamentPlayers.length} /{' '}
                      {tournament.players_number}
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
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <div className='mb-1 flex justify-between text-sm'>
              <span>
                {t('players')}: {tournamentPlayers.length} /{' '}
                {tournament.players_number}
              </span>
              <span>{Math.round(getPlayerCountProgress())}%</span>
            </div>
            <Progress value={getPlayerCountProgress()} className='h-2' />
          </div>

          {loadingPlayers ? (
            <div className='space-y-2'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : tournamentPlayers.length === 0 ? (
            <div className='rounded-md border py-8 text-center'>
              <p className='mb-4 text-muted-foreground'>
                {t('noPlayersAdded')}
              </p>
              <Button
                size='sm'
                onClick={handleOpenSidebarToExistingPlayers}
                className='gap-1'
                disabled={isPlayerLimitReached()}
              >
                <UserPlus className='h-4 w-4' />
                {t('addPlayer')}
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
              {tournamentPlayers.map((tp) => (
                <PlayerCard
                  key={tp.id}
                  player={tp.player}
                  onDelete={handleDeletePlayer}
                  disableDelete={isDeletingPlayer}
                />
              ))}
            </div>
          )}

          {isPlayerLimitReached() && tournamentPlayers.length > 0 && (
            <Alert className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {t('playerLimitReached', {
                  number: tournament.players_number
                })}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tournament Couples Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div>
            <CardTitle>{t('couples')}</CardTitle>
            <CardDescription className='mt-1.5 flex items-center'>
              <Users className='mr-1 h-4 w-4' />
              {couples.length} / {Math.floor(tournament.players_number / 2)}{' '}
              {t('couples').toLowerCase()}
            </CardDescription>
          </div>
          <Sheet
            open={isCoupleSidebarOpen}
            onOpenChange={setIsCoupleSidebarOpen}
          >
            <SheetTrigger asChild>
              <Button
                size='sm'
                className='gap-1'
                disabled={tournamentPlayers.length < 2}
              >
                <Plus className='h-4 w-4' />
                {t('createCouple')}
              </Button>
            </SheetTrigger>
            <SheetContent
              side='right'
              className='w-full overflow-y-auto sm:max-w-md'
            >
              <SheetHeader>
                <SheetTitle>
                  {coupleToEdit ? t('editCouple') : t('createCouple')}
                </SheetTitle>
                <SheetDescription>
                  {couples.length} / {Math.floor(tournament.players_number / 2)}{' '}
                  {t('couples').toLowerCase()}
                </SheetDescription>
                <div className='mt-2'>
                  <div className='mb-1 flex justify-between text-sm'>
                    <span>
                      {t('couples')}: {couples.length} /{' '}
                      {Math.floor(tournament.players_number / 2)}
                    </span>
                    <span>
                      {Math.floor(tournament.players_number / 2) > 0
                        ? Math.round(
                            (couples.length /
                              Math.floor(tournament.players_number / 2)) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      Math.floor(tournament.players_number / 2) > 0
                        ? (couples.length /
                            Math.floor(tournament.players_number / 2)) *
                          100
                        : 0
                    }
                    className='h-2'
                  />
                </div>
              </SheetHeader>

              <div className='py-4'>
                <CoupleForm
                  availablePlayers={getAvailablePlayers()}
                  isLoading={isCreatingCouple || isEditingCouple}
                  onSubmit={
                    coupleToEdit ? handleEditCouple : handleCreateCouple
                  }
                  onCancel={handleCoupleSidebarClose}
                  editingCouple={coupleToEdit}
                  resetForm={true}
                  maxCouples={Math.floor(tournament.players_number / 2)}
                  currentCouplesCount={couples.length}
                />
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <div className='mb-1 flex justify-between text-sm'>
              <span>
                {t('couples')}: {couples.length} /{' '}
                {Math.floor(tournament.players_number / 2)}
              </span>
              <span>
                {Math.floor(tournament.players_number / 2) > 0
                  ? Math.round(
                      (couples.length /
                        Math.floor(tournament.players_number / 2)) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                Math.floor(tournament.players_number / 2) > 0
                  ? (couples.length /
                      Math.floor(tournament.players_number / 2)) *
                    100
                  : 0
              }
              className='h-2'
            />
          </div>

          {loadingCouples ? (
            <div className='space-y-2'>
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-20 w-full' />
            </div>
          ) : couples.length === 0 ? (
            <div className='rounded-md border py-8 text-center'>
              <p className='mb-4 text-muted-foreground'>
                {t('noCouplesCreated')}
              </p>
              <Button
                size='sm'
                className='gap-1'
                onClick={openCoupleCreateSidebar}
                disabled={tournamentPlayers.length < 2}
              >
                <Plus className='h-4 w-4' />
                {t('createCouple')}
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {couples.map((couple) => (
                <CoupleCard
                  key={couple.id}
                  couple={couple}
                  onEdit={openCoupleEditSidebar}
                  onDelete={handleDeleteCouple}
                  disableActions={isDeletingCouple}
                />
              ))}
            </div>
          )}

          {tournamentPlayers.length < 2 && (
            <Alert className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {t('needTwoPlayersForCouple')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Player deletion confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('removePlayerFromTournament')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('removePlayerConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPlayer}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlayer}
              disabled={isDeletingPlayer}
              className='bg-destructive hover:bg-destructive/90'
            >
              {isDeletingPlayer ? t('removing') : t('remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Couple deletion confirmation dialog */}
      <AlertDialog
        open={showDeleteCoupleDialog}
        onOpenChange={setShowDeleteCoupleDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCouple')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCoupleConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCouple}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCouple}
              disabled={isDeletingCouple}
              className='bg-destructive hover:bg-destructive/90'
            >
              {isDeletingCouple ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
