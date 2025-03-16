'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Calendar,
  Users,
  ArrowLeft,
  Plus,
  UserPlus,
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

// Import our API functions and components
import {
  fetchTournament,
  fetchTournamentPlayers,
  fetchTournamentCouples,
  fetchAllPlayers,
  addPlayerToTournament,
  removePlayerFromTournament
} from '@/features/tournament/api/tournamentApi';
import {
  getTournamentStatus,
  formatDate,
  formatTime
} from '@/features/tournament/api/utils';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  Player
} from '@/features/tournament/api/types';
import { PlayerCard } from '@/features/tournament/components/PlayerCard';
import { CoupleCard } from '@/features/tournament/components/CoupleCard';
import { AddPlayerSelector } from '@/features/tournament/components/AddPlayerSelector';
import { CreatePlayerForm } from '@/features/tournament/components/CreatePlayerForm';
import { ImportPlaytomicPlayer } from '@/features/tournament/components/ImportPlaytomicPlayer';
import { LexicalRenderer } from '@/features/tournament/components/LexicalRenderer';

// Main component
export default function TournamentClientPage({
  tournamentId
}: {
  tournamentId: string;
}) {
  const t = useTranslations('Dashboard');
  const errorT = useTranslations('Errors');
  const callApi = useApi();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Players and Couples state
  const [tournamentPlayers, setTournamentPlayers] = useState<
    TournamentPlayer[]
  >([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingCouples, setLoadingCouples] = useState(false);
  const [loadingAllPlayers, setLoadingAllPlayers] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);

  // Player creation/import state
  const [searchQuery, setSearchQuery] = useState('');

  // Add state for player addition mode
  const [playerAdditionMode, setPlayerAdditionMode] = useState<
    'selection' | 'existing' | 'create' | 'import'
  >('selection');

  // Add state for player deletion
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadTournamentDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchTournament(callApi, tournamentId);
        setTournament(data);
      } catch (err) {
        console.error('Error fetching tournament details:', err);
        setError(
          err instanceof Error ? err.message : errorT('somethingWentWrong')
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (tournamentId) {
      loadTournamentDetails();
    }
  }, [callApi, tournamentId, errorT]);

  // Fetch tournament players when tab is active
  useEffect(() => {
    if (activeTab === 'players' && tournamentId) {
      loadTournamentPlayers();
      loadTournamentCouples();
    }
  }, [activeTab, tournamentId]);

  // Function to fetch tournament players
  const loadTournamentPlayers = async () => {
    try {
      setLoadingPlayers(true);
      const data = await fetchTournamentPlayers(callApi, tournamentId);
      setTournamentPlayers(data);
    } catch (error) {
      console.error('Error fetching tournament players:', error);
      toast.error(t('failedLoadPlayers'));
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Function to fetch tournament couples
  const loadTournamentCouples = async () => {
    try {
      setLoadingCouples(true);
      const data = await fetchTournamentCouples(callApi, tournamentId);
      setCouples(data);
    } catch (error) {
      console.error('Error fetching tournament couples:', error);
      toast.error(t('failedLoadCouples'));
    } finally {
      setLoadingCouples(false);
    }
  };

  // Function to fetch all players
  const loadAllPlayers = async () => {
    try {
      setLoadingAllPlayers(true);
      const data = await fetchAllPlayers(callApi);
      setAllPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error(t('failedLoadPlayers'));
    } finally {
      setLoadingAllPlayers(false);
    }
  };

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

  // Function to handle player creation and automatic addition to tournament
  const handlePlayerCreated = async (playerId: number) => {
    await handleAddPlayerToTournament(playerId);
    // Return to selection screen after player creation
    setPlayerAdditionMode('selection');
    loadAllPlayers(); // Refresh the player list in the background
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
      // Error message already shown in the ImportPlaytomicPlayer component
      console.error('Player import failed:', errorMessage);
      // Stay on the import screen to allow them to retry
    }
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

  // Function to filter players
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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

  // Function to handle the player addition mode selection
  const handlePlayerAdditionModeSelect = (
    mode: 'existing' | 'create' | 'import'
  ) => {
    setPlayerAdditionMode(mode);

    // If selecting existing, make sure we fetch all players
    if (mode === 'existing' && allPlayers.length === 0) {
      loadAllPlayers();
    }
  };

  // Function to go back to selection screen
  const handleBackToSelection = () => {
    setPlayerAdditionMode('selection');
  };

  // Then update the renderPlayerAdditionOptions function to show the appropriate content based on mode
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
            tournamentId={tournamentId}
          />
        </div>
      );
    }

    return null;
  };

  // Reset player addition mode when sidebar is closed
  useEffect(() => {
    if (!isSidebarOpen) {
      setPlayerAdditionMode('selection');
    }
  }, [isSidebarOpen]);

  // When using the main "Add Player" button in the card, directly go to existing players mode
  const handleOpenSidebarToExistingPlayers = () => {
    setIsSidebarOpen(true);
    setPlayerAdditionMode('existing');
    if (allPlayers.length === 0) {
      loadAllPlayers();
    }
  };

  // Add function to handle player deletion
  const handleDeletePlayer = (playerId: number) => {
    setPlayerToDelete(playerId);
    setShowDeleteDialog(true);
  };

  // Add function to confirm and execute player deletion
  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      setIsDeletingPlayer(true);
      await removePlayerFromTournament(callApi, tournamentId, playerToDelete);
      toast.success(t('playerRemoved'));

      // Refresh both players and couples lists
      loadTournamentPlayers();
      loadTournamentCouples();
    } catch (error) {
      console.error('Error removing player from tournament:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedToRemovePlayer')
      );
    } finally {
      setIsDeletingPlayer(false);
      setShowDeleteDialog(false);
      setPlayerToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-8'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-10 w-20' />
        </div>
        <Skeleton className='h-8 w-full' />
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='rounded-md bg-destructive/15 p-4 text-destructive'>
        <p>{error}</p>
        <Button
          variant='outline'
          onClick={() => window.location.reload()}
          className='mt-4'
        >
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  // No tournament data
  if (!tournament) {
    return (
      <div className='flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center'>
        <h3 className='mb-2 text-lg font-semibold'>
          {t('tournamentNotFound')}
        </h3>
        <p className='mb-4 text-sm text-muted-foreground'>
          {t('tournamentNotFoundDesc')}
        </p>
        <Link href='/dashboard/tournament/overview'>
          <Button>{t('backToTournaments')}</Button>
        </Link>
      </div>
    );
  }

  // Tournament exists, display content with tabs
  const status = getTournamentStatus(tournament);
  const startDate = new Date(tournament.start_date);
  const endDate = new Date(tournament.end_date);

  return (
    <div className='space-y-6'>
      {/* Back button and title section */}
      <div className='flex flex-col space-y-2 md:flex-row md:items-center md:justify-between'>
        <div>
          <Link
            href='/dashboard/tournament/overview'
            className='mb-2 flex items-center text-sm font-medium text-muted-foreground hover:text-primary'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            {t('backTo')} {t('tournament')}
          </Link>
          <Heading
            title={tournament.name}
            description={tournament.description}
          />
        </div>
        <div>
          <Badge
            variant={
              status === 'ongoing'
                ? 'default'
                : status === 'upcoming'
                  ? 'outline'
                  : 'secondary'
            }
            className='text-base'
          >
            {t(status)}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Tab navigation */}
      <Tabs
        defaultValue='overview'
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
      >
        <TabsList className='mb-4 w-full justify-start overflow-auto sm:w-auto'>
          <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
          <TabsTrigger value='manage'>{t('manage')}</TabsTrigger>
          <TabsTrigger value='players'>{t('playersAndTeams')}</TabsTrigger>
          <TabsTrigger value='leaderboard'>{t('leaderboard')}</TabsTrigger>
          <TabsTrigger value='games'>{t('games')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Tournament Header Info */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Tournament Image */}
            <Card className='overflow-hidden'>
              <div className='relative h-64 w-full'>
                {tournament.images && tournament.images.length > 0 ? (
                  <Image
                    src={tournament.images[0]}
                    alt={tournament.name}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-muted'>
                    <span className='text-muted-foreground'>
                      {t('noItemsFound')}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Tournament Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tournamentDetails')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='font-medium'>{t('dates')}</div>
                    <div className='text-sm text-muted-foreground'>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Users className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='font-medium'>{t('players')}</div>
                    <div className='text-sm text-muted-foreground'>
                      {tournament.players_number} {t('players').toLowerCase()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Description */}
          {tournament.full_description && (
            <Card>
              <CardHeader>
                <CardTitle>{t('fullDescription')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose dark:prose-invert max-w-none'>
                  <LexicalRenderer lexicalData={tournament.full_description} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manage Tab Content */}
        <TabsContent value='manage' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                {t('manage')} {t('tournament')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>{t('managementOptions')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Players & Teams Tab Content */}
        <TabsContent value='players' className='space-y-6'>
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
                <Sheet
                  open={isSidebarOpen}
                  onOpenChange={(open) => {
                    setIsSidebarOpen(open);
                    if (open) {
                      loadAllPlayers();
                    }
                  }}
                >
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
                        <Progress
                          value={getPlayerCountProgress()}
                          className='h-2'
                        />
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
                        t={t}
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
                <CardTitle>{t('couples')}</CardTitle>
                <Button size='sm' className='gap-1'>
                  <Plus className='h-4 w-4' />
                  {t('createCouple')}
                </Button>
              </CardHeader>
              <CardContent>
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
                    <Button size='sm' className='gap-1'>
                      <Plus className='h-4 w-4' />
                      {t('createCouple')}
                    </Button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-2'>
                    {couples.map((couple) => (
                      <CoupleCard key={couple.id} couple={couple} t={t} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leaderboard Tab Content */}
        <TabsContent value='leaderboard' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>{t('leaderboard')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>{t('leaderboardDesc')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab Content */}
        <TabsContent value='games' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                {t('tournament')} {t('games')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>{t('gamesDesc')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add the confirmation dialog to the component's JSX */}
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
    </div>
  );
}
