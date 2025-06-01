'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { useTournamentStaging } from '../../hooks/useTournamentStaging';
import { useApi } from '@/hooks/useApi';
import { fetchTournamentMatches } from '@/api/tournaments/api';
import { StagingMatch } from '@/api/tournaments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CourtsView } from './matches/views/CourtsView';
import { useMatchFilters } from '../../utils/matchFilters';
import { useTournamentContext } from '../../context/TournamentContext';

interface TournamentAllMatchesProps {
  tournament: Tournament;
}

export const TournamentAllMatches: React.FC<TournamentAllMatchesProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');
  const callApi = useApi();
  const { couples } = useTournamentContext();

  // State for matches and view configuration
  const [allMatches, setAllMatches] = useState<StagingMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // State for group data mapping
  const [groupsMap, setGroupsMap] = useState<Record<number, string>>({});

  // Get stages data for additional context
  const { stages } = useTournamentStaging({
    tournamentId: tournament.id,
    autoLoad: true
  });

  // Filter setup with proper default values
  const initialFilters = {
    status: ['pending', 'completed', 'time_expired', 'forfeited'], // Include all statuses by default
    courts: [],
    groups: [],
    brackets: [],
    search: ''
  };

  const {
    filters,
    setFilters,
    toggleStatusFilter,
    toggleCourtFilter,
    toggleGroupFilter,
    toggleBracketFilter,
    clearFilters,
    activeFilterCount,
    filterMatches
  } = useMatchFilters(initialFilters);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  // Load all matches for the tournament
  const loadAllMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const matches = await fetchTournamentMatches(callApi, tournament.id);
      setAllMatches(matches);
    } catch (err) {
      console.error('Error loading all matches:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load matches';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load matches when component mounts
  useEffect(() => {
    loadAllMatches();
  }, [tournament.id]);

  // Load group names mapping
  useEffect(() => {
    const loadGroupNames = async () => {
      if (stages.length === 0) return;

      const groupNamesMap: Record<number, string> = {};

      for (const stage of stages) {
        if (stage.stage_type === 'group') {
          try {
            const stageGroups = await import('@/api/tournaments/api').then(
              (api) => api.fetchStageGroups(callApi, stage.id)
            );

            stageGroups.forEach((group) => {
              groupNamesMap[group.id] = group.name;
            });
          } catch (error) {
            console.error(
              `Failed to load groups for stage ${stage.id}:`,
              error
            );
          }
        }
      }

      setGroupsMap(groupNamesMap);
    };

    loadGroupNames();
  }, [stages, callApi]);

  // Helper functions for match display
  const getCoupleName = (coupleId: number): string => {
    const couple = couples.find((c) => c.id === coupleId);
    return couple ? couple.name : `Couple ${coupleId}`;
  };

  const getCourtName = (match: StagingMatch): string => {
    return match.court_id ? `Court ${match.court_id}` : 'No Court';
  };

  const getGroupName = (match: StagingMatch): string => {
    if (!match.group_id) return 'No Group';

    // Get the actual group name from the groups map
    const groupName = groupsMap[match.group_id];
    return groupName || `Group ${match.group_id}`;
  };

  const getBracketName = (match: StagingMatch): string => {
    if (!match.bracket_id) return 'No Bracket';

    // For brackets, we can show bracket type or just bracket ID
    return `Bracket ${match.bracket_id}`;
  };

  const getStageName = (match: StagingMatch): string => {
    const stage = stages.find((s) => s.id === match.stage_id);
    return stage ? stage.name : `Stage ${match.stage_id}`;
  };

  // Filter matches based on current filters
  const filteredMatches = allMatches.filter((match) => {
    // Status filter
    if (!filters.status.includes(match.match_result_status)) {
      return false;
    }

    // Court filter
    if (
      filters.courts.length > 0 &&
      match.court_id &&
      !filters.courts.includes(match.court_id)
    ) {
      return false;
    }

    // Stage filter (using groups filter array for stage IDs)
    if (filters.groups.length > 0 && !filters.groups.includes(match.stage_id)) {
      return false;
    }

    // Search filter (match number, couple names)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchIdStr = match.id.toString();
      const couple1Name = getCoupleName(match.couple1_id).toLowerCase();
      const couple2Name = getCoupleName(match.couple2_id).toLowerCase();
      const courtName = getCourtName(match).toLowerCase();
      const stageName = getStageName(match).toLowerCase();

      return (
        matchIdStr.includes(searchLower) ||
        couple1Name.includes(searchLower) ||
        couple2Name.includes(searchLower) ||
        courtName.includes(searchLower) ||
        stageName.includes(searchLower)
      );
    }

    return true;
  });

  // Handle match result updates
  const handleSaveMatchResult = async (
    matchId: number,
    scores: any
  ): Promise<boolean> => {
    try {
      setIsUpdatingMatch(true);
      // Here you would implement the match update logic
      // For now, we'll just reload the matches
      await loadAllMatches();
      return true;
    } catch (err) {
      console.error('Error updating match:', err);
      return false;
    } finally {
      setIsUpdatingMatch(false);
    }
  };

  // Get available courts for filtering
  const availableCourts = Array.from(
    new Set(allMatches.filter((m) => m.court_id).map((m) => m.court_id!))
  );

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant='outline'
            size='sm'
            onClick={loadAllMatches}
            disabled={isLoading}
            className='ml-4'
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center space-x-4'>
                  <Skeleton className='h-12 flex-1' />
                  <Skeleton className='h-8 w-24' />
                  <Skeleton className='h-8 w-24' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with controls */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Tournament Matches</h2>
          <p className='text-muted-foreground'>
            {filteredMatches.length} of {allMatches.length} matches
            {activeFilterCount > 0 && ` (${activeFilterCount} filters applied)`}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={loadAllMatches}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* View type selector */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2'
          >
            <Filter className='h-4 w-4' />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant='secondary' className='ml-1'>
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant='outline' size='sm' onClick={clearFilters}>
              Clear Filters ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Input */}
            <div className='mb-4'>
              <h4 className='mb-2 text-sm font-medium'>Search</h4>
              <Input
                type='text'
                placeholder='Search matches, couples, courts...'
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              {/* Status Filter */}
              <div>
                <h4 className='mb-2 text-sm font-medium'>Status</h4>
                <div className='space-y-2'>
                  {['pending', 'completed', 'time_expired', 'forfeited'].map(
                    (status) => (
                      <div key={status} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status.includes(status)}
                          onCheckedChange={() => toggleStatusFilter(status)}
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className='text-sm capitalize'
                        >
                          {status.replace('_', ' ')}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Court Filter */}
              <div>
                <h4 className='mb-2 text-sm font-medium'>Courts</h4>
                <div className='space-y-2'>
                  {availableCourts.map((courtId) => (
                    <div key={courtId} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`court-${courtId}`}
                        checked={filters.courts.includes(courtId)}
                        onCheckedChange={() => toggleCourtFilter(courtId)}
                      />
                      <label htmlFor={`court-${courtId}`} className='text-sm'>
                        Court {courtId}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Filter */}
              <div>
                <h4 className='mb-2 text-sm font-medium'>Stages</h4>
                <div className='space-y-2'>
                  {stages.map((stage) => (
                    <div key={stage.id} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`stage-${stage.id}`}
                        checked={filters.groups.includes(stage.id)} // Using groups filter for stages
                        onCheckedChange={() => toggleGroupFilter(stage.id)}
                      />
                      <label htmlFor={`stage-${stage.id}`} className='text-sm'>
                        {stage.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches content */}
      {allMatches.length === 0 ? (
        <Card>
          <CardContent className='py-8'>
            <div className='text-center text-muted-foreground'>
              <p>No matches found for this tournament.</p>
              <p className='mt-2 text-sm'>
                Matches will appear after stages are set up and matches are
                generated.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filteredMatches.length === 0 ? (
        <Card>
          <CardContent className='py-8'>
            <div className='text-center text-muted-foreground'>
              <p>No matches match the current filters.</p>
              <Button variant='outline' className='mt-4' onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Court View */}
          <CourtsView
            matches={filteredMatches}
            stageType='group' // We'll show both group and elimination
            isUpdatingMatch={isUpdatingMatch}
            availableCourts={availableCourts}
            couples={couples}
            getCoupleName={getCoupleName}
            getCourtName={getCourtName}
            getGroupName={getGroupName}
            getBracketName={getBracketName}
            getStageName={getStageName}
            onSaveResult={handleSaveMatchResult}
          />
        </>
      )}
    </div>
  );
};
