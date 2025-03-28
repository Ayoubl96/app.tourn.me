import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Plus,
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
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

import { useTournament } from '@/features/tournament/context/TournamentContext';
import { useTournamentCouples } from '@/features/tournament/hooks/useTournamentCouples';
import { PlayerCard } from '@/features/tournament/components/PlayerCard';
import { CoupleCard } from '@/features/tournament/components/CoupleCard';
import { CoupleForm } from '@/features/tournament/components/CoupleForm';
import { AddPlayerSelector } from '@/features/tournament/components/AddPlayerSelector';
import { CreatePlayerForm } from '@/features/tournament/components/CreatePlayerForm';
import { ImportPlaytomicPlayer } from '@/features/tournament/components/ImportPlaytomicPlayer';
import { DeletePlayerDialog } from '@/features/tournament/dialogs/DeletePlayerDialog';
import { CoupleFormDialog } from '@/features/tournament/dialogs/CoupleFormDialog';
import { DeleteCoupleDialog } from '@/features/tournament/dialogs/DeleteCoupleDialog';
import { AddPlayerSidebar } from '@/features/tournament/dialogs/AddPlayerSidebar';
import {
  Player,
  TournamentPlayer,
  Couple
} from '@/features/tournament/api/types';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  addPlayerToTournament,
  removePlayerFromTournament
} from '@/features/tournament/api/tournamentApi';

interface TournamentPlayersTabProps {
  t: (key: string, params?: Record<string, any>) => string;
  commonT: (key: string, params?: Record<string, any>) => string;
}

export default function TournamentPlayersTab({
  t,
  commonT
}: TournamentPlayersTabProps) {
  const {
    tournamentId,
    tournament,
    tournamentPlayers,
    loadingTournamentPlayers: loadingPlayers,
    refreshTournamentPlayers: loadTournamentPlayers,
    allPlayers,
    loadingAllPlayers,
    loadAllPlayers
  } = useTournament();

  const callApi = useApi();

  const [searchQuery, setSearchQuery] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [deletingPlayer, setDeletingPlayer] = useState(false);

  // Player deletion dialog state
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
  const [playerDeleteDialogOpen, setPlayerDeleteDialogOpen] = useState(false);

  // Couple management states
  const {
    couples,
    loadingCouples,
    loadTournamentCouples,
    handleCreateCouple,
    handleUpdateCouple,
    handleDeleteCouple,
    isDeletingCouple: deletingCouple
  } = useTournamentCouples(tournamentId, tournamentPlayers, t, () =>
    loadTournamentPlayers()
  );

  const [isCoupleFormOpen, setIsCoupleFormOpen] = useState(false);
  const [coupleToEdit, setCoupleToEdit] = useState<Couple | undefined>(
    undefined
  );
  const [coupleToDelete, setCoupleToDelete] = useState<number | null>(null);
  const [coupleDeleteDialogOpen, setCoupleDeleteDialogOpen] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      loadTournamentPlayers();
      loadTournamentCouples();
    }
  }, [tournamentId]);

  // Add player to tournament
  const handleAddPlayerToTournament = async (playerId: number) => {
    try {
      // Check if tournament player limit is reached
      if (tournament && tournamentPlayers.length >= tournament.players_number) {
        toast.error(
          t('playerLimitReached', {
            number: tournament.players_number
          })
        );
        return;
      }

      setAddingPlayer(true);
      await addPlayerToTournament(callApi, tournamentId, playerId);
      toast.success(t('playerAdded'));
      loadTournamentPlayers(); // Refresh the list
    } catch (error) {
      console.error('Error adding player to tournament:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedAddPlayer')
      );
    } finally {
      setAddingPlayer(false);
    }
  };

  // Handle player creation and automatic addition to tournament
  const handlePlayerCreated = async (playerId: number) => {
    await handleAddPlayerToTournament(playerId);
    loadAllPlayers(); // Refresh the player list in the background
  };

  // Calculate player count percentage
  const getPlayerCountProgress = () => {
    if (!tournament || tournament.players_number === 0) return 0;
    return (tournamentPlayers.length / tournament.players_number) * 100;
  };

  // Check if player limit is reached
  const isPlayerLimitReached = (): boolean => {
    return Boolean(
      tournament && tournamentPlayers.length >= tournament.players_number
    );
  };

  // Filter players by search query
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

  // Player deletion
  const handleDeletePlayer = (playerId: number) => {
    setPlayerToDelete(playerId);
    setPlayerDeleteDialogOpen(true);
  };

  const confirmDeletePlayer = async () => {
    if (playerToDelete === null) return;

    try {
      setDeletingPlayer(true);
      await removePlayerFromTournament(callApi, tournamentId, playerToDelete);
      toast.success(t('playerRemoved'));
      loadTournamentPlayers(); // Refresh the list
      loadTournamentCouples(); // Also refresh couples as they might be affected
    } catch (error) {
      console.error('Error removing player from tournament:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedToRemovePlayer')
      );
    } finally {
      setDeletingPlayer(false);
      setPlayerDeleteDialogOpen(false);
      setPlayerToDelete(null);
    }
  };

  // Couple form management
  const handleOpenCoupleForm = () => {
    setCoupleToEdit(undefined);
    setIsCoupleFormOpen(true);
  };

  const handleEditCouple = (couple: Couple) => {
    setCoupleToEdit(couple);
    setIsCoupleFormOpen(true);
  };

  const handleCoupleFormComplete = () => {
    setIsCoupleFormOpen(false);
    setCoupleToEdit(undefined);
    loadTournamentCouples(); // Refresh couples list
  };

  // Couple deletion
  const handleDeleteCoupleInit = (coupleId: number) => {
    setCoupleToDelete(coupleId);
    setCoupleDeleteDialogOpen(true);
  };

  const confirmDeleteCouple = async () => {
    if (coupleToDelete === null) return;

    try {
      await handleDeleteCouple(coupleToDelete);
      setCoupleDeleteDialogOpen(false);
      setCoupleToDelete(null);
    } catch (error) {
      console.error('Error deleting couple:', error);
    }
  };

  const handleOpenSidebarToExistingPlayers = () => {
    setIsSidebarOpen(true);
    loadAllPlayers(); // Load all players when opening sidebar
  };

  // If tournament is not loaded yet, show loading state
  if (!tournament) {
    return null;
  }

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Tournament Players Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div>
            <CardTitle>{t('players')}</CardTitle>
            <CardDescription className='mt-1.5 flex items-center'>
              <Users className='mr-1 h-4 w-4' />
              {tournamentPlayers.length} / {tournament.players_number}{' '}
              {t('players').toLowerCase()}
            </CardDescription>
          </div>
          <AddPlayerSidebar
            open={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            buttonText={t('addPlayer')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredPlayers={filteredPlayers}
            handleAddPlayerToTournament={handleAddPlayerToTournament}
            handlePlayerCreated={handlePlayerCreated}
            getPlayerCountProgress={getPlayerCountProgress}
            isPlayerLimitReached={isPlayerLimitReached}
            t={t}
            addingPlayer={addingPlayer}
          >
            <Button
              size='sm'
              className='gap-1'
              disabled={isPlayerLimitReached()}
            >
              <UserPlus className='h-4 w-4' />
              {t('addPlayer')}
            </Button>
          </AddPlayerSidebar>
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
                  t={t}
                  onDelete={handleDeletePlayer}
                  disableDelete={deletingPlayer}
                />
              ))}
            </div>
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
              {couples.length} {t('couples').toLowerCase()}
            </CardDescription>
          </div>
          <Button
            size='sm'
            className='gap-1'
            onClick={handleOpenCoupleForm}
            disabled={tournamentPlayers.length < 2 || isCoupleLimitReached()}
          >
            <Plus className='h-4 w-4' />
            {t('createCouple')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <div className='mb-1 flex justify-between text-sm'>
              <span>
                {t('couples')}: {couples.length} / {getMaxPossibleCouples()}
              </span>
              <span>{Math.round(getCoupleCountProgress())}%</span>
            </div>
            <Progress value={getCoupleCountProgress()} className='h-2' />
          </div>

          {loadingCouples ? (
            <div className='space-y-2'>
              <Skeleton className='h-20 w-full' />
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
                onClick={handleOpenCoupleForm}
                className='gap-1'
                disabled={tournamentPlayers.length < 2}
              >
                <Plus className='h-4 w-4' />
                {t('createCouple')}
              </Button>
              {tournamentPlayers.length < 2 && (
                <p className='mt-2 text-sm text-muted-foreground'>
                  {t('needTwoPlayersForCouple')}
                </p>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              {couples.map((couple) => (
                <CoupleCard
                  key={couple.id}
                  couple={couple}
                  t={t}
                  onEdit={() => handleEditCouple(couple)}
                  onDelete={() => handleDeleteCoupleInit(couple.id)}
                  disableActions={deletingCouple}
                />
              ))}
            </div>
          )}

          {isCoupleLimitReached() && (
            <Alert className='mt-4' variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{t('coupleLimitReached')}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Player Delete Dialog */}
      <DeletePlayerDialog
        open={playerDeleteDialogOpen}
        onOpenChange={setPlayerDeleteDialogOpen}
        onConfirm={confirmDeletePlayer}
        cancelText={commonT('cancel')}
        removeText={t('remove')}
        removingText={t('removing')}
        title={t('removePlayerFromTournament')}
        description={t('removePlayerConfirmation')}
        isDeleting={deletingPlayer}
      />

      {/* Couple Delete Dialog */}
      <DeleteCoupleDialog
        open={coupleDeleteDialogOpen}
        onOpenChange={setCoupleDeleteDialogOpen}
        onConfirm={confirmDeleteCouple}
        cancelText={commonT('cancel')}
        deleteText={commonT('delete')}
        deletingText={t('deleting')}
        title={t('deleteCouple')}
        description={t('deleteCoupleConfirmation')}
        isDeleting={deletingCouple}
      />

      {/* Couple Form Dialog */}
      <CoupleFormDialog
        open={isCoupleFormOpen}
        onOpenChange={setIsCoupleFormOpen}
        tournamentId={tournamentId}
        tournamentPlayers={tournamentPlayers}
        couples={couples}
        existingCouple={coupleToEdit}
        onComplete={handleCoupleFormComplete}
        onCancel={() => setIsCoupleFormOpen(false)}
        t={t}
      />
    </div>
  );

  // Helper functions for couples
  function getMaxPossibleCouples() {
    return Math.floor(tournamentPlayers.length / 2);
  }

  function getCoupleCountProgress() {
    const maxCouples = getMaxPossibleCouples();
    if (maxCouples === 0) return 0;
    return (couples.length / maxCouples) * 100;
  }

  function isCoupleLimitReached() {
    return couples.length >= getMaxPossibleCouples();
  }
}
