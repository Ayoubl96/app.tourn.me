'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament, TournamentStage } from '@/api/tournaments/types';
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
  MapPin,
  Trophy,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { fetchStageMatches } from '@/api/tournaments/api';
import { StagingMatch } from '@/api/tournaments/types';
import { EmptyState } from '../shared/EmptyState';
import { MatchResultEntry } from './matches/MatchResultEntry';
// GenerateMatchesDialog component will be added later if needed

interface StageMatchesProps {
  stage: TournamentStage;
  tournament: Tournament;
}

type MatchStatus = 'live' | 'next' | 'upcoming' | 'completed' | 'all';

export const StageMatches: React.FC<StageMatchesProps> = ({
  stage,
  tournament
}) => {
  const t = useTranslations('Dashboard');
  const callApi = useApi();
  const { couples } = useTournamentContext();

  // State
  const [matches, setMatches] = useState<StagingMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MatchStatus>('all');
  const [showCourts, setShowCourts] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<StagingMatch | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Load stage matches
  const loadMatches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const matchesData = await fetchStageMatches(callApi, stage.id);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading stage matches:', error);
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
  }, [stage.id]);

  // Helper functions
  const getCoupleName = (coupleId: number): string => {
    const couple = couples.find((c) => c.id === coupleId);
    return (
      couple?.name || `${t('couple', { defaultValue: 'Couple' })} #${coupleId}`
    );
  };

  const getCourtName = (courtId: number | null): string => {
    if (!courtId)
      return t('noCourtAssigned', { defaultValue: 'No court assigned' });
    return `${t('court', { defaultValue: 'Court' })} ${courtId}`;
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
    await loadMatches(); // Refresh matches after save
    return true;
  };

  // Enhanced match card component with result entry functionality
  const EnhancedMatchCard = ({ match }: { match: StagingMatch }) => {
    const getStatusInfo = () => {
      switch (match.match_result_status) {
        case 'pending':
          if (
            match.court_id &&
            match.scheduled_start &&
            new Date(match.scheduled_start) <= new Date()
          ) {
            return {
              label: t('live', { defaultValue: 'Live' }),
              variant: 'destructive' as const,
              canEdit: true
            };
          }
          return {
            label: t('upcoming', { defaultValue: 'Upcoming' }),
            variant: 'secondary' as const,
            canEdit: true
          };
        case 'completed':
          return {
            label: t('completed', { defaultValue: 'Completed' }),
            variant: 'default' as const,
            canEdit: true
          };
        case 'time_expired':
          return {
            label: t('timeExpired', { defaultValue: 'Time Expired' }),
            variant: 'destructive' as const,
            canEdit: true
          };
        case 'forfeited':
          return {
            label: t('forfeited', { defaultValue: 'Forfeited' }),
            variant: 'outline' as const,
            canEdit: true
          };
        default:
          return {
            label: t('unknown', { defaultValue: 'Unknown' }),
            variant: 'secondary' as const,
            canEdit: false
          };
      }
    };

    const statusInfo = getStatusInfo();
    const hasResult = match.games && match.games.length > 0;

    return (
      <Card className='w-full'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              {getCoupleName(match.couple1_id)}{' '}
              {t('vs', { defaultValue: 'vs' })}{' '}
              {getCoupleName(match.couple2_id)}
            </CardTitle>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {/* Match details */}
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              {match.court_id && (
                <div className='flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {getCourtName(match.court_id)}
                </div>
              )}
              {match.scheduled_start && (
                <div className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  {new Date(match.scheduled_start).toLocaleString()}
                </div>
              )}
            </div>

            {/* Game results if available */}
            {hasResult && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  {t('gameScores', { defaultValue: 'Game Scores' })}
                </h4>
                <div className='grid gap-1'>
                  {match.games?.map((game, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between text-sm'
                    >
                      <span>
                        {t('game', { defaultValue: 'Game' })} {game.game_number}
                      </span>
                      <span className='font-mono'>
                        {game.couple1_score} - {game.couple2_score}
                      </span>
                    </div>
                  ))}
                </div>
                {match.winner_couple_id && (
                  <div className='flex items-center gap-2 text-sm font-medium text-green-600'>
                    <Trophy className='h-3 w-3' />
                    {t('winner', { defaultValue: 'Winner' })}:{' '}
                    {getCoupleName(match.winner_couple_id)}
                  </div>
                )}
              </div>
            )}

            {/* Action button */}
            {statusInfo.canEdit && (
              <Button
                onClick={() => handleMatchResultEntry(match)}
                variant='outline'
                size='sm'
                className='w-full'
              >
                {hasResult
                  ? t('editResult', { defaultValue: 'Edit Result' })
                  : t('enterResult', { defaultValue: 'Enter Result' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter matches by status
  const getFilteredMatches = (status: MatchStatus): StagingMatch[] => {
    switch (status) {
      case 'live':
        return matches.filter(
          (match) =>
            match.match_result_status === 'pending' &&
            match.court_id &&
            match.scheduled_start &&
            new Date(match.scheduled_start) <= new Date()
        );
      case 'upcoming':
        return matches.filter(
          (match) =>
            match.match_result_status === 'pending' &&
            (!match.scheduled_start ||
              new Date(match.scheduled_start) > new Date())
        );
      case 'completed':
        return matches.filter((match) =>
          ['completed', 'time_expired', 'forfeited'].includes(
            match.match_result_status
          )
        );
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches(activeView);

  // Get match counts for tabs
  const matchCounts = {
    live: getFilteredMatches('live').length,
    upcoming: getFilteredMatches('upcoming').length,
    completed: getFilteredMatches('completed').length,
    all: matches.length
  };

  // Render match list
  const renderMatchList = (matches: StagingMatch[]) => (
    <div className='grid gap-4'>
      {matches.map((match) => (
        <EnhancedMatchCard key={match.id} match={match} />
      ))}
    </div>
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

  // Empty state - show generate matches option
  if (matches.length === 0) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>
            {t('matches', { defaultValue: 'Matches' })}
          </h2>
          <div className='flex items-center space-x-2'>
            <Button
              onClick={() => setShowGenerateDialog(true)}
              variant='default'
              size='sm'
            >
              <Plus className='mr-1 h-4 w-4' />
              {t('generateMatches', { defaultValue: 'Generate Matches' })}
            </Button>
            <Button onClick={loadMatches} variant='outline' size='sm'>
              <RefreshCw className='mr-1 h-4 w-4' />
              {t('refresh', { defaultValue: 'Refresh' })}
            </Button>
          </div>
        </div>

        <EmptyState
          icon={<Trophy className='h-8 w-8' />}
          title={t('noMatchesInStage', {
            defaultValue: 'No matches in this stage'
          })}
          description={t('noMatchesInStageDescription', {
            defaultValue: 'Generate matches for this stage to get started.'
          })}
          action={
            <Button onClick={() => setShowGenerateDialog(true)}>
              <Plus className='mr-2 h-4 w-4' />
              {t('generateMatches', { defaultValue: 'Generate Matches' })}
            </Button>
          }
        />

        {/* Generate Matches Dialog - TODO: Implement if needed */}
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
          <p className='text-sm text-muted-foreground'>
            {stage.name} •{' '}
            {stage.stage_type === 'group'
              ? t('groupStage')
              : t('eliminationStage')}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            onClick={() => setShowCourts(!showCourts)}
            variant={showCourts ? 'default' : 'outline'}
            size='sm'
          >
            <MapPin className='mr-1 h-4 w-4' />
            {t('courtView', { defaultValue: 'Court View' })}
          </Button>
          <Button onClick={loadMatches} variant='outline' size='sm'>
            <RefreshCw className='mr-1 h-4 w-4' />
            {t('refresh', { defaultValue: 'Refresh' })}
          </Button>
        </div>
      </div>

      {/* Match Status Tabs */}
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as MatchStatus)}
      >
        <TabsList className='grid w-full grid-cols-4'>
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
