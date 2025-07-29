'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
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

// Import hooks
import { useTournament } from '@/features/tournament/hooks/useTournament';
import { useTournamentPlayers } from '@/features/tournament/hooks/useTournamentPlayers';
import { usePlayerManagement } from '@/features/tournament/hooks/usePlayerManagement';

// Import components
import { TournamentHeader } from '@/features/tournament/components/sections/TournamentHeader';
import { TournamentOverview } from '@/features/tournament/components/sections/TournamentOverview';
import { TournamentManage } from '@/features/tournament/components/sections/TournamentManage';
import { PlayersAndTeams } from '@/features/tournament/components/sections/PlayersAndTeams';
import { TournamentCourts } from '@/features/tournament/components/sections/TournamentCourts';
import { TournamentStaging } from '@/features/tournament/components/sections/TournamentStaging';
import { TournamentAllStandings } from '@/features/tournament/components/sections/TournamentAllStandings';
import { TournamentMatches } from '@/features/tournament/components/sections/TournamentMatches';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { TournamentProvider } from '@/features/tournament/context/TournamentContext';

export default function TournamentClientPage({
  tournamentId
}: {
  tournamentId: string;
}) {
  const t = useTranslations('Dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Use tournament hook for tournament data
  const { tournament, isLoading, error } = useTournament(tournamentId);

  // Use players hook for player management
  const {
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
    loadTournamentPlayers,
    loadTournamentCouples,
    loadAllPlayers,
    addPlayerToTournament,
    removePlayerFromTournament,
    getPlayerCountProgress,
    isPlayerLimitReached
  } = useTournamentPlayers(
    parseInt(tournamentId),
    activeTab === 'players',
    tournament?.players_number || 0
  );

  // Use player management hook
  const {
    playerAdditionMode,
    searchQuery,
    isCreating,
    searchTerm,
    isSearching,
    isImporting,
    playtomicPlayers,
    selectedPlayer,
    error: playerManagementError,
    setPlayerAdditionMode,
    setSearchQuery,
    setSearchTerm,
    setSelectedPlayer,
    handleCreatePlayer,
    handleSearchPlaytomicPlayers,
    handleImportPlayer,
    handleImportPlayerWithGender,
    handleSelectMode
  } = usePlayerManagement(addPlayerToTournament);

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

  return (
    <div className='space-y-6'>
      {/* Tournament header with title and status */}
      <TournamentHeader tournament={tournament} />

      <Separator />

      <TournamentProvider tournamentId={tournamentId}>
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
            <TabsTrigger value='courts'>{t('courts')}</TabsTrigger>
            <TabsTrigger value='players'>{t('playersAndTeams')}</TabsTrigger>
            <TabsTrigger value='staging'>{t('staging')}</TabsTrigger>
            <TabsTrigger value='standings'>{t('standings')}</TabsTrigger>
            <TabsTrigger value='matches'>{t('matches')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value='overview' className='space-y-6'>
            <TournamentOverview tournament={tournament} />
          </TabsContent>

          {/* Manage Tab Content */}
          <TabsContent value='manage' className='space-y-6'>
            <TournamentManage tournament={tournament} />
          </TabsContent>

          {/* Courts Tab Content */}
          <TabsContent value='courts' className='space-y-6'>
            <TournamentCourts tournament={tournament} />
          </TabsContent>

          {/* Players & Teams Tab Content */}
          <TabsContent value='players' className='space-y-6'>
            <PlayersAndTeams
              tournament={tournament}
              tournamentPlayers={tournamentPlayers}
              couples={couples}
              allPlayers={allPlayers}
              loadingPlayers={loadingPlayers}
              loadingCouples={loadingCouples}
              loadingAllPlayers={loadingAllPlayers}
              addingPlayer={addingPlayer}
              isDeletingPlayer={isDeletingPlayer}
              playerToDelete={playerToDelete}
              setPlayerToDelete={setPlayerToDelete}
              getPlayerCountProgress={getPlayerCountProgress}
              isPlayerLimitReached={isPlayerLimitReached}
              loadAllPlayers={loadAllPlayers}
              addPlayerToTournament={addPlayerToTournament}
              removePlayerFromTournament={removePlayerFromTournament}
              loadTournamentCouples={loadTournamentCouples}
              // Player management props
              playerAdditionMode={playerAdditionMode}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setPlayerAdditionMode={setPlayerAdditionMode}
              handleSelectMode={handleSelectMode}
              // Import Playtomic props
              playtomicPlayers={playtomicPlayers}
              isSearching={isSearching}
              isImporting={isImporting}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedPlayer={selectedPlayer}
              setSelectedPlayer={setSelectedPlayer}
              handleSearchPlaytomicPlayers={handleSearchPlaytomicPlayers}
              handleImportPlayer={handleImportPlayer}
              handleImportPlayerWithGender={handleImportPlayerWithGender}
              handleCreatePlayer={handleCreatePlayer}
              error={playerManagementError}
            />
          </TabsContent>

          {/* Staging Tab Content */}
          <TabsContent value='staging' className='space-y-6'>
            <TournamentStaging tournament={tournament} />
          </TabsContent>

          {/* Standings Tab Content */}
          <TabsContent value='standings' className='space-y-6'>
            <TournamentAllStandings tournament={tournament} />
          </TabsContent>

          {/* Matches Tab Content */}
          <TabsContent value='matches' className='space-y-6'>
            <TournamentMatches tournament={tournament} />
          </TabsContent>
        </Tabs>
      </TournamentProvider>

      {/* Player deletion confirmation dialog - moved to PlayersAndTeams component */}
    </div>
  );
}
