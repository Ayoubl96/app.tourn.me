'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament, TournamentStage } from '@/api/tournaments/types';
import { useTournamentContext } from '@/features/tournament/context/TournamentContext';
import { useApi } from '@/hooks/useApi';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Clock,
  CheckCircle,
  MapPin,
  Trophy,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { fetchStageMatches } from '@/api/tournaments/api';
import { StagingMatch, StageMatchOrderInfo } from '@/api/tournaments/types';
import { EmptyState } from '../shared/EmptyState';
import { MatchResultEntry } from './matches/MatchResultEntry';
import { useCourtName } from '../../hooks/useCourtName';
import { EnhancedMatchCard } from '../shared/EnhancedMatchCard';
import { MatchAccordionLayout } from '../shared/MatchAccordionLayout';
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
  const [stageMatchInfo, setStageMatchInfo] =
    useState<StageMatchOrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<StagingMatch | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Initialize court name hook with stage courts data
  const { getCourtName } = useCourtName({
    stageCourts: stageMatchInfo?.courts || []
  });

  // Load stage matches
  const loadMatches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stageData = await fetchStageMatches(
        callApi,
        stage.id,
        tournament.id
      );
      setStageMatchInfo(stageData);
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

  // Get matches grouped by status for accordion layout
  const getMatchesByStatus = () => {
    if (!stageMatchInfo) {
      return {
        live: [],
        next: [],
        upcoming: [],
        completed: [],
        all: []
      };
    }

    const completedMatches = Object.values(
      stageMatchInfo.completed_matches_by_group
    ).flat();
    const allMatches = [
      ...stageMatchInfo.live_matches,
      ...stageMatchInfo.next_matches,
      ...stageMatchInfo.all_pending_matches,
      ...completedMatches
    ];

    return {
      live: stageMatchInfo.live_matches,
      next: stageMatchInfo.next_matches,
      upcoming: stageMatchInfo.all_pending_matches,
      completed: completedMatches,
      all: allMatches
    };
  };

  const matchesByStatus = getMatchesByStatus();

  // Get match counts for header
  const matchCounts = {
    live: matchesByStatus.live.length,
    next: matchesByStatus.next.length,
    upcoming: matchesByStatus.upcoming.length,
    completed: matchesByStatus.completed.length,
    all: matchesByStatus.all.length
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
          courtDataSources={{ stageCourts: stageMatchInfo?.courts || [] }}
        />
      ))}
    </div>
  );

  // Render accordion layout using shared component
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

  // Empty state - show generate matches option
  if (!stageMatchInfo || stageMatchInfo.total_matches_in_stage === 0) {
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
            {' • '}
            {t('totalMatches', { defaultValue: 'Total' })}: {matchCounts.all}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button onClick={loadMatches} variant='outline' size='sm'>
            <RefreshCw className='mr-1 h-4 w-4' />
            {t('refresh', { defaultValue: 'Refresh' })}
          </Button>
        </div>
      </div>

      {/* Accordion Layout */}
      {renderAccordionView()}

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
