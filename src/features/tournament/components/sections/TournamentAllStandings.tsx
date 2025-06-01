'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { useTournamentStaging } from '../../hooks/useTournamentStaging';
import { useApi } from '@/hooks/useApi';
import { fetchTournamentStandings } from '@/api/tournaments/api';
import { TournamentStandingsResponse } from '@/api/tournaments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, Medal, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TournamentAllStandingsProps {
  tournament: Tournament;
}

export const TournamentAllStandings: React.FC<TournamentAllStandingsProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');
  const callApi = useApi();

  // State for all standings data grouped by stage/group
  const [allStandings, setAllStandings] = useState<
    TournamentStandingsResponse[]
  >([]);
  const [stageGroupMap, setStageGroupMap] = useState<
    Record<number, { stageName: string; stageId: number }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get stages and groups data
  const { stages, loadGroups, groups } = useTournamentStaging({
    tournamentId: tournament.id,
    autoLoad: true
  });

  // Load all standings for all groups in all stages
  const loadAllStandings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const standingsData: TournamentStandingsResponse[] = [];
      const groupStageMapping: Record<
        number,
        { stageName: string; stageId: number }
      > = {};

      // For each stage, get its groups and then standings for each group
      for (const stage of stages) {
        if (stage.stage_type === 'group') {
          // Load groups for this stage first
          await loadGroups(stage.id);

          // Then load standings for each group
          try {
            // We need to get the groups for this stage, but since loadGroups is async
            // we'll use a separate API call to get groups for now
            const stageGroups = await import('@/api/tournaments/api').then(
              (api) => api.fetchStageGroups(callApi, stage.id)
            );

            for (const group of stageGroups) {
              // Map group to stage
              groupStageMapping[group.id] = {
                stageName: stage.name,
                stageId: stage.id
              };

              try {
                const standings = await fetchTournamentStandings(
                  callApi,
                  tournament.id,
                  group.id.toString()
                );
                standingsData.push(standings);
              } catch (groupError) {
                console.error(
                  `Failed to load standings for group ${group.id}:`,
                  groupError
                );
                // Continue loading other groups even if one fails
              }
            }
          } catch (stageError) {
            console.error(
              `Failed to load groups for stage ${stage.id}:`,
              stageError
            );
          }
        }
      }

      setAllStandings(standingsData);
      setStageGroupMap(groupStageMapping);
    } catch (err) {
      console.error('Error loading all standings:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load standings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load standings when component mounts or when stages change
  useEffect(() => {
    if (stages.length > 0) {
      loadAllStandings();
    }
  }, [stages]);

  // Helper function to get position icon
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className='h-4 w-4 text-yellow-500' />;
      case 2:
        return <Medal className='h-4 w-4 text-gray-400' />;
      case 3:
        return <Award className='h-4 w-4 text-amber-600' />;
      default:
        return null;
    }
  };

  // Helper function to format percentage
  const formatPercentage = (percentage: number) => {
    return `${Math.round(percentage)}%`;
  };

  // Helper function to format date
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant='outline'
            size='sm'
            onClick={loadAllStandings}
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
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-6 w-48' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className='flex items-center space-x-4'>
                    <Skeleton className='h-8 w-8' />
                    <Skeleton className='h-4 flex-1' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (allStandings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            Tournament Standings
            <Button
              variant='outline'
              size='sm'
              onClick={loadAllStandings}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-muted-foreground'>
            <p>No standings data available yet.</p>
            <p className='mt-2 text-sm'>
              Standings will appear after matches are played and stages are set
              up.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Tournament Standings</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={loadAllStandings}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh All
        </Button>
      </div>

      {allStandings.map((standings) => {
        // Get the stage information for this group
        const stageInfo = stageGroupMap[standings.group_id];

        return (
          <Card key={`${standings.group_id}`}>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span>{standings.group_name}</span>
                    {stageInfo && (
                      <Badge variant='outline' className='text-xs'>
                        Stage: {stageInfo.stageName}
                      </Badge>
                    )}
                  </div>
                  <div className='mt-1 text-sm font-normal text-muted-foreground'>
                    Tournament: {standings.tournament_name}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {standings.stats && standings.stats.length > 0 ? (
                <div className='space-y-4'>
                  {/* Last updated info */}
                  <div className='text-sm text-muted-foreground'>
                    Last updated: {formatLastUpdated(standings.last_updated)}
                  </div>

                  {/* Standings table */}
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-16'>Pos</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className='text-center'>MP</TableHead>
                          <TableHead className='text-center'>W</TableHead>
                          <TableHead className='text-center'>D</TableHead>
                          <TableHead className='text-center'>L</TableHead>
                          <TableHead className='text-center'>GW</TableHead>
                          <TableHead className='text-center'>GL</TableHead>
                          <TableHead className='text-center'>GD</TableHead>
                          <TableHead className='text-center'>Pts</TableHead>
                          <TableHead className='text-center'>Win%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standings.stats
                          .sort((a, b) => a.position - b.position)
                          .map((stat) => (
                            <TableRow key={stat.couple_id}>
                              <TableCell className='font-medium'>
                                <div className='flex items-center gap-2'>
                                  {getPositionIcon(stat.position)}
                                  <span>{stat.position}</span>
                                </div>
                              </TableCell>
                              <TableCell className='font-medium'>
                                <div className='flex items-center gap-2'>
                                  <span>{stat.couple.name}</span>
                                  {stat.position <= 3 && (
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      Qualified
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className='text-center'>
                                {stat.matches_played}
                              </TableCell>
                              <TableCell className='text-center'>
                                {stat.matches_won}
                              </TableCell>
                              <TableCell className='text-center'>
                                {stat.matches_drawn}
                              </TableCell>
                              <TableCell className='text-center'>
                                {stat.matches_lost}
                              </TableCell>
                              <TableCell className='text-center'>
                                {stat.games_won}
                              </TableCell>
                              <TableCell className='text-center'>
                                {stat.games_lost}
                              </TableCell>
                              <TableCell className='text-center'>
                                <span
                                  className={
                                    stat.games_diff >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }
                                >
                                  {stat.games_diff >= 0 ? '+' : ''}
                                  {stat.games_diff}
                                </span>
                              </TableCell>
                              <TableCell className='text-center font-semibold'>
                                {stat.total_points}
                              </TableCell>
                              <TableCell className='text-center'>
                                {formatPercentage(stat.win_percentage)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Legend (only show once) */}
                  {standings === allStandings[0] && (
                    <div className='text-xs text-muted-foreground'>
                      <p>
                        <strong>MP:</strong> Matches Played, <strong>W:</strong>{' '}
                        Won, <strong>D:</strong> Drawn, <strong>L:</strong>{' '}
                        Lost, <strong>GW:</strong> Games Won,{' '}
                        <strong>GL:</strong> Games Lost, <strong>GD:</strong>{' '}
                        Games Difference, <strong>Pts:</strong> Points
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='py-8 text-center text-muted-foreground'>
                  <p>No standings data available for this group yet.</p>
                  <p className='mt-2 text-sm'>
                    Standings will appear after matches are played.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
