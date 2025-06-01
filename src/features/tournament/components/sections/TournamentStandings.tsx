import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
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

interface TournamentStandingsProps {
  tournament: Tournament;
}

export const TournamentStandings: React.FC<TournamentStandingsProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');
  const {
    standings,
    isLoading,
    isRecalculating,
    error,
    loadStandings,
    recalculateStats
  } = useTournamentStandings(tournament.id.toString(), undefined);

  // Load standings when component mounts
  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

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
    return `${Math.round(percentage * 100)}%`;
  };

  // Helper function to format date
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            Standings
            <Button
              variant='outline'
              size='sm'
              onClick={loadStandings}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center text-destructive'>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div>
            <span>Standings</span>
            {standings && (
              <div className='mt-1 text-sm font-normal text-muted-foreground'>
                Group: {standings.group_name}
              </div>
            )}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={loadStandings}
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
              onClick={recalculateStats}
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
        {isLoading ? (
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
                              <Badge variant='secondary' className='text-xs'>
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

            {/* Legend */}
            <div className='text-xs text-muted-foreground'>
              <p>
                <strong>MP:</strong> Matches Played, <strong>W:</strong> Won,{' '}
                <strong>D:</strong> Drawn, <strong>L:</strong> Lost,{' '}
                <strong>GW:</strong> Games Won, <strong>GL:</strong> Games Lost,{' '}
                <strong>GD:</strong> Games Difference, <strong>Pts:</strong>{' '}
                Points
              </p>
            </div>
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
};
