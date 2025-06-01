import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { TournamentStage, TournamentGroup } from '@/api/tournaments/types';
import { useTournamentStandings } from '../../hooks/useTournamentStandings';
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
import { useApi } from '@/hooks/useApi';
import {
  fetchStageGroups,
  fetchTournamentStandings,
  recalculateTournamentStats
} from '@/api/tournaments/api';
import { TournamentStandingsResponse } from '@/api/tournaments/types';
import { toast } from 'sonner';

interface StageStandingsProps {
  stage: TournamentStage;
  tournament: Tournament;
}

export const StageStandings: React.FC<StageStandingsProps> = ({
  stage,
  tournament
}) => {
  const t = useTranslations('Dashboard');
  const callApi = useApi();
  const [groups, setGroups] = useState<TournamentGroup[]>([]);
  const [groupStandings, setGroupStandings] = useState<
    Record<number, TournamentStandingsResponse>
  >({});
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [loadingStandings, setLoadingStandings] = useState<
    Record<number, boolean>
  >({});
  const [recalculatingStandings, setRecalculatingStandings] = useState<
    Record<number, boolean>
  >({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  // Load groups for this stage
  useEffect(() => {
    const loadGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const groupsData = await fetchStageGroups(callApi, stage.id);
        setGroups(groupsData);
      } catch (err) {
        console.error('Error loading groups:', err);
        toast.error('Failed to load groups');
      } finally {
        setIsLoadingGroups(false);
      }
    };

    loadGroups();
  }, [stage.id, callApi]);

  // Load standings for all groups
  useEffect(() => {
    const loadAllStandings = async () => {
      if (groups.length === 0) return;

      const loadingStates: Record<number, boolean> = {};
      groups.forEach((group) => {
        loadingStates[group.id] = true;
      });
      setLoadingStandings(loadingStates);

      for (const group of groups) {
        try {
          const standings = await fetchTournamentStandings(
            callApi,
            tournament.id,
            group.id.toString()
          );
          setGroupStandings((prev) => ({
            ...prev,
            [group.id]: standings
          }));
          setErrors((prev) => ({
            ...prev,
            [group.id]: ''
          }));
        } catch (err) {
          console.error(`Error loading standings for group ${group.id}:`, err);
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load standings';
          setErrors((prev) => ({
            ...prev,
            [group.id]: errorMessage
          }));
        } finally {
          setLoadingStandings((prev) => ({
            ...prev,
            [group.id]: false
          }));
        }
      }
    };

    loadAllStandings();
  }, [groups, callApi, tournament.id]);

  // Refresh standings for a specific group
  const refreshGroupStandings = async (groupId: number) => {
    setLoadingStandings((prev) => ({ ...prev, [groupId]: true }));
    try {
      const standings = await fetchTournamentStandings(
        callApi,
        tournament.id,
        groupId.toString()
      );
      setGroupStandings((prev) => ({
        ...prev,
        [groupId]: standings
      }));
      setErrors((prev) => ({
        ...prev,
        [groupId]: ''
      }));
    } catch (err) {
      console.error(`Error refreshing standings for group ${groupId}:`, err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh standings';
      setErrors((prev) => ({
        ...prev,
        [groupId]: errorMessage
      }));
      toast.error(errorMessage);
    } finally {
      setLoadingStandings((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  // Recalculate standings for a specific group
  const recalculateGroupStandings = async (groupId: number) => {
    setRecalculatingStandings((prev) => ({ ...prev, [groupId]: true }));
    try {
      await recalculateTournamentStats(
        callApi,
        tournament.id,
        groupId.toString()
      );
      toast.success('Group statistics recalculated successfully');
      // Refresh standings after recalculation
      await refreshGroupStandings(groupId);
    } catch (err) {
      console.error(`Error recalculating stats for group ${groupId}:`, err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to recalculate statistics';
      setErrors((prev) => ({
        ...prev,
        [groupId]: errorMessage
      }));
      toast.error(errorMessage);
    } finally {
      setRecalculatingStandings((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  // Refresh all standings
  const refreshAllStandings = async () => {
    for (const group of groups) {
      await refreshGroupStandings(group.id);
    }
  };

  // Recalculate all standings
  const recalculateAllStandings = async () => {
    for (const group of groups) {
      await recalculateGroupStandings(group.id);
    }
  };

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

  if (stage.stage_type !== 'group') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-muted-foreground'>
            <p>Standings are only available for group stages.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingGroups) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-muted-foreground'>
            <p>No groups found for this stage.</p>
            <p className='mt-2 text-sm'>
              Create groups first to view standings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with global actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div>
              <span>Standings</span>
              <div className='mt-1 text-sm font-normal text-muted-foreground'>
                Stage: {stage.name} - {groups.length} group
                {groups.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={refreshAllStandings}
                disabled={Object.values(loadingStandings).some(
                  (loading) => loading
                )}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${Object.values(loadingStandings).some((loading) => loading) ? 'animate-spin' : ''}`}
                />
                Refresh All
              </Button>
              <Button
                variant='secondary'
                size='sm'
                onClick={recalculateAllStandings}
                disabled={Object.values(recalculatingStandings).some(
                  (recalculating) => recalculating
                )}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${Object.values(recalculatingStandings).some((recalculating) => recalculating) ? 'animate-spin' : ''}`}
                />
                Recalculate All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Individual group standings */}
      {groups.map((group) => {
        const standings = groupStandings[group.id];
        const isLoading = loadingStandings[group.id];
        const isRecalculating = recalculatingStandings[group.id];
        const error = errors[group.id];

        return (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div>
                  <span>{group.name}</span>
                  {standings && (
                    <div className='mt-1 text-sm font-normal text-muted-foreground'>
                      Last updated: {formatLastUpdated(standings.last_updated)}
                    </div>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => refreshGroupStandings(group.id)}
                    disabled={isLoading || isRecalculating}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => recalculateGroupStandings(group.id)}
                    disabled={isLoading || isRecalculating}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`}
                    />
                    Recalculate
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className='py-8 text-center text-destructive'>
                  <p>{error}</p>
                </div>
              ) : isLoading ? (
                <div className='space-y-4'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className='flex items-center space-x-4'>
                      <Skeleton className='h-8 w-8' />
                      <Skeleton className='h-4 flex-1' />
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='h-4 w-16' />
                    </div>
                  ))}
                </div>
              ) : standings && standings.stats.length > 0 ? (
                <div className='space-y-4'>
                  {/* Standings table */}
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-16'>Pos</TableHead>
                          <TableHead className='min-w-[150px]'>Team</TableHead>
                          <TableHead className='w-20 text-center'>MP</TableHead>
                          <TableHead className='w-20 text-center'>W</TableHead>
                          <TableHead className='w-20 text-center'>D</TableHead>
                          <TableHead className='w-20 text-center'>L</TableHead>
                          <TableHead className='w-20 text-center'>GW</TableHead>
                          <TableHead className='w-20 text-center'>GL</TableHead>
                          <TableHead className='w-20 text-center'>GD</TableHead>
                          <TableHead className='w-20 text-center'>
                            Pts
                          </TableHead>
                          <TableHead className='w-20 text-center'>
                            Win%
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standings.stats
                          .sort((a, b) => a.position - b.position)
                          .map((stat) => (
                            <TableRow key={stat.couple_id}>
                              <TableCell className='w-16 font-medium'>
                                <div className='flex items-center gap-2'>
                                  {getPositionIcon(stat.position)}
                                  <span>{stat.position}</span>
                                </div>
                              </TableCell>
                              <TableCell className='min-w-[200px] font-medium'>
                                <div className='flex items-center gap-2'>
                                  <span>{stat.couple.name}</span>
                                  {stat.position <=
                                    stage.config.advancement_rules.top_n && (
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      Qualified
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className='w-16 text-center'>
                                {stat.matches_played}
                              </TableCell>
                              <TableCell className='w-16 text-center'>
                                {stat.matches_won}
                              </TableCell>
                              <TableCell className='w-16 text-center'>
                                {stat.matches_drawn}
                              </TableCell>
                              <TableCell className='w-16 text-center'>
                                {stat.matches_lost}
                              </TableCell>
                              <TableCell className='w-16 text-center'>
                                {stat.games_won}
                              </TableCell>
                              <TableCell className='w-16 text-center'>
                                {stat.games_lost}
                              </TableCell>
                              <TableCell className='w-16 text-center'>
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
                              <TableCell className='w-20 text-center font-semibold'>
                                {stat.total_points}
                              </TableCell>
                              <TableCell className='w-20 text-center'>
                                {formatPercentage(stat.win_percentage)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Legend - only show once */}
                  {group.id === groups[0].id && (
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
                  <p>No standings data available yet.</p>
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
