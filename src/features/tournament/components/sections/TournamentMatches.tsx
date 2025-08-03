'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '@/api/tournaments/types';
import { useTournamentContext } from '@/features/tournament/context/TournamentContext';
import { useApi } from '@/hooks/useApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Clock,
  CheckCircle,
  Calendar,
  Trophy,
  Loader2,
  RefreshCw,
  List,
  Users
} from 'lucide-react';
import { getTournamentMatchOrderInfo } from '@/api/tournaments/api';
import {
  StagingMatch,
  TournamentMatchOrderInfo
} from '@/api/tournaments/types';
import { EmptyState } from '../shared/EmptyState';
import { MatchResultEntry } from './matches/MatchResultEntry';
import { useCourtName } from '../../hooks/useCourtName';
import { EnhancedMatchCard } from '../shared/EnhancedMatchCard';
import { MatchAccordionLayout } from '../shared/MatchAccordionLayout';

interface TournamentMatchesProps {
  tournament: Tournament;
}

type MatchStatus = 'live' | 'next' | 'upcoming' | 'completed' | 'all';

export const TournamentMatches: React.FC<TournamentMatchesProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');
  const callApi = useApi();
  const { couples } = useTournamentContext();

  // State
  const [matchOrderInfo, setMatchOrderInfo] =
    useState<TournamentMatchOrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MatchStatus>('all');
  const [showAccordion, setShowAccordion] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<StagingMatch | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Initialize court name hook with tournament courts data
  const { getCourtName } = useCourtName({
    tournamentCourts: matchOrderInfo?.courts || []
  });

  // Load tournament matches with order info
  const loadMatches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orderInfo = await getTournamentMatchOrderInfo(
        callApi,
        tournament.id
      );
      setMatchOrderInfo(orderInfo);
    } catch (error) {
      console.error('Error loading tournament matches:', error);
      setError(
        t('failedToLoadMatches', { defaultValue: 'Failed to load matches' })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load matches on mount
  useEffect(() => {
    loadMatches();
  }, [tournament.id]);

  // Helper functions
  const getCoupleName = (coupleId: number): string => {
    const couple = couples.find((c) => c.id === coupleId);
    return (
      couple?.name || `${t('couple', { defaultValue: 'Couple' })} #${coupleId}`
    );
  };

  // Get matches from order info - backend already provides them grouped by status
  const getMatchesByStatus = () => {
    if (!matchOrderInfo) {
      return {
        live: [],
        next: [],
        upcoming: [],
        completed: [],
        all: []
      };
    }

    const completedMatches = Object.values(
      matchOrderInfo.completed_matches_by_stage
    ).flat();
    const allMatches = [
      ...matchOrderInfo.live_matches,
      ...matchOrderInfo.next_matches,
      ...matchOrderInfo.all_pending_matches,
      ...completedMatches
    ];

    return {
      live: matchOrderInfo.live_matches,
      next: matchOrderInfo.next_matches,
      upcoming: matchOrderInfo.all_pending_matches,
      completed: completedMatches,
      all: allMatches
    };
  };

  const matchesByStatus = getMatchesByStatus();
  const filteredMatches = matchesByStatus[activeView] || [];

  // Get match counts for tabs
  const matchCounts = {
    live: matchesByStatus.live.length,
    next: matchesByStatus.next.length,
    upcoming: matchesByStatus.upcoming.length,
    completed: matchesByStatus.completed.length,
    all: matchesByStatus.all.length
  };

  // Handle match result entry
  const handleMatchResultEntry = (match: StagingMatch) => {
    setSelectedMatch(match);
    setShowResultDialog(true);
  };

  const handleCloseResultDialog = () => {
    setSelectedMatch(null);
    setShowResultDialog(false);
  };

  const handleSaveResult = async (): Promise<boolean> => {
    // The MatchResultEntry component handles the saving internally
    await loadMatches(); // Refresh matches after save
    return true;
  };

  // Render match list
  const renderMatchList = (matches: StagingMatch[]) => (
    <div className='grid gap-4'>
      {matches.map((match) => (
        <EnhancedMatchCard
          key={match.id}
          match={match}
          getCoupleName={getCoupleName}
          onMatchResultEntry={handleMatchResultEntry}
          showGroupName={true}
          courtDataSources={{ tournamentCourts: matchOrderInfo?.courts || [] }}
        />
      ))}
    </div>
  );

  // Render accordion view using shared layout component
  const renderAccordionView = () => (
    <MatchAccordionLayout
      matches={matchesByStatus}
      renderMatchList={renderMatchList}
    />
  );

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>
            {t('matches', { defaultValue: 'Matches' })}
          </h2>
          <div className='flex items-center space-x-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='text-sm text-muted-foreground'>
              {t('loading', { defaultValue: 'Loading...' })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>
            {t('matches', { defaultValue: 'Matches' })}
          </h2>
          <Button onClick={loadMatches} variant='outline' size='sm'>
            <RefreshCw className='mr-1 h-4 w-4' />
            {t('retry', { defaultValue: 'Retry' })}
          </Button>
        </div>
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!matchOrderInfo || matchCounts.all === 0) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>
            {t('matches', { defaultValue: 'Matches' })}
          </h2>
          <Button onClick={loadMatches} variant='outline' size='sm'>
            <RefreshCw className='mr-1 h-4 w-4' />
            {t('refresh', { defaultValue: 'Refresh' })}
          </Button>
        </div>
        <EmptyState
          icon={<Trophy className='h-8 w-8' />}
          title={t('noMatches', { defaultValue: 'No matches found' })}
          description={t('noMatchesDescription', {
            defaultValue:
              'Matches will appear here once they are generated in the staging area.'
          })}
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h2 className='text-2xl font-bold'>
            {t('matches', { defaultValue: 'Matches' })}
          </h2>
          {matchOrderInfo && (
            <p className='text-sm text-muted-foreground'>
              {t('totalMatches', { defaultValue: 'Total' })}: {matchCounts.all}{' '}
              •{t('progress', { defaultValue: 'Progress' })}:{' '}
              {Math.round(matchOrderInfo.progress_percentage)}%
            </p>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            onClick={() => setShowAccordion(!showAccordion)}
            variant={showAccordion ? 'default' : 'outline'}
            size='sm'
          >
            <List className='mr-1 h-4 w-4' />
            {t('accordionView', { defaultValue: 'All Matches View' })}
          </Button>
          <Button onClick={loadMatches} variant='outline' size='sm'>
            <RefreshCw className='mr-1 h-4 w-4' />
            {t('refresh', { defaultValue: 'Refresh' })}
          </Button>
        </div>
      </div>

      {/* Tournament Progress Card */}
      {matchOrderInfo?.quick_stats && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Users className='h-5 w-5' />
              {t('tournamentProgress', { defaultValue: 'Tournament Progress' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {matchOrderInfo.quick_stats.matches_in_progress}
                </div>
                <div className='text-muted-foreground'>
                  {t('inProgress', { defaultValue: 'In Progress' })}
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {matchOrderInfo.quick_stats.matches_waiting}
                </div>
                <div className='text-muted-foreground'>
                  {t('waiting', { defaultValue: 'Waiting' })}
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {matchOrderInfo.quick_stats.matches_remaining}
                </div>
                <div className='text-muted-foreground'>
                  {t('remaining', { defaultValue: 'Remaining' })}
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {matchOrderInfo.quick_stats.matches_completed}
                </div>
                <div className='text-muted-foreground'>
                  {t('completed', { defaultValue: 'Completed' })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {showAccordion ? (
        // Accordion View - Shows all matches grouped by status
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <List className='h-4 w-4' />
            {t('accordionViewDescription', {
              defaultValue:
                'All matches organized by status. Click sections to expand/collapse.'
            })}
          </div>
          {renderAccordionView()}
        </div>
      ) : (
        // Tab View - Shows matches by selected status
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as MatchStatus)}
        >
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='all' className='relative'>
              {t('allMatches', { defaultValue: 'All' })}
              {matchCounts.all > 0 && (
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {matchCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='live' className='relative'>
              <Play className='mr-1 h-3 w-3' />
              {t('live', { defaultValue: 'Live' })}
              {matchCounts.live > 0 && (
                <Badge variant='destructive' className='ml-1 text-xs'>
                  {matchCounts.live}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='next' className='relative'>
              <Calendar className='mr-1 h-3 w-3' />
              {t('next', { defaultValue: 'Next' })}
              {matchCounts.next > 0 && (
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {matchCounts.next}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='upcoming' className='relative'>
              <Clock className='mr-1 h-3 w-3' />
              {t('upcoming', { defaultValue: 'Upcoming' })}
              {matchCounts.upcoming > 0 && (
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {matchCounts.upcoming}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='completed' className='relative'>
              <CheckCircle className='mr-1 h-3 w-3' />
              {t('completed', { defaultValue: 'Completed' })}
              {matchCounts.completed > 0 && (
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {matchCounts.completed}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value='all' className='mt-6'>
            {renderMatchList(filteredMatches)}
          </TabsContent>

          <TabsContent value='live' className='mt-6'>
            {filteredMatches.length === 0 ? (
              <EmptyState
                icon={<Play className='h-8 w-8' />}
                title={t('noLiveMatches', { defaultValue: 'No live matches' })}
                description={t('noLiveMatchesDescription', {
                  defaultValue:
                    'Live matches will appear here when they are in progress.'
                })}
              />
            ) : (
              renderMatchList(filteredMatches)
            )}
          </TabsContent>

          <TabsContent value='next' className='mt-6'>
            {filteredMatches.length === 0 ? (
              <EmptyState
                icon={<Calendar className='h-8 w-8' />}
                title={t('noNextMatches', { defaultValue: 'No next matches' })}
                description={t('noNextMatchesDescription', {
                  defaultValue:
                    'Next matches will appear here when they are ready to be played.'
                })}
              />
            ) : (
              renderMatchList(filteredMatches)
            )}
          </TabsContent>

          <TabsContent value='upcoming' className='mt-6'>
            {filteredMatches.length === 0 ? (
              <EmptyState
                icon={<Clock className='h-8 w-8' />}
                title={t('noUpcomingMatches', {
                  defaultValue: 'No upcoming matches'
                })}
                description={t('noUpcomingMatchesDescription', {
                  defaultValue:
                    'Upcoming matches will appear here when they are scheduled.'
                })}
              />
            ) : (
              renderMatchList(filteredMatches)
            )}
          </TabsContent>

          <TabsContent value='completed' className='mt-6'>
            {filteredMatches.length === 0 ? (
              <EmptyState
                icon={<CheckCircle className='h-8 w-8' />}
                title={t('noCompletedMatches', {
                  defaultValue: 'No completed matches'
                })}
                description={t('noCompletedMatchesDescription', {
                  defaultValue:
                    'Completed matches will appear here after they finish.'
                })}
              />
            ) : (
              renderMatchList(filteredMatches)
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Match Result Entry Dialog */}
      {selectedMatch && (
        <MatchResultEntry
          match={selectedMatch}
          couple1Name={getCoupleName(selectedMatch.couple1_id)}
          couple2Name={getCoupleName(selectedMatch.couple2_id)}
          isOpen={showResultDialog}
          onClose={handleCloseResultDialog}
          onSave={handleSaveResult}
        />
      )}
    </div>
  );
};
