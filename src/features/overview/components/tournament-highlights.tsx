'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RealTimeTournamentProgress,
  TournamentTimelineItem,
  TournamentDetails
} from '@/api/dashboard';
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Play,
  AlertTriangle
} from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

interface TournamentHighlightsProps {
  progressData?: RealTimeTournamentProgress;
  timelineData?: TournamentTimelineItem[];
  tournamentDetails?: TournamentDetails;
}

export function TournamentHighlights({
  progressData,
  timelineData,
  tournamentDetails
}: TournamentHighlightsProps) {
  const t = useTranslations('DashboardOverview.tournamentHighlights');

  // Helper function to get tournament progress data
  const getTournamentProgress = (tournamentId: number) => {
    return progressData?.tournament_progress?.find(
      (tp) => tp.tournament_id === tournamentId
    );
  };
  if (!progressData && !timelineData && !tournamentDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('loadingTournamentData')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[400px] items-center justify-center text-muted-foreground'>
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCouples = progressData?.top_performing_couples?.slice(0, 5) || [];
  const recentTournaments = timelineData?.slice(0, 3) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='h-5 w-5' />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Tournament Details Section */}
          {tournamentDetails && (
            <div>
              <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                <Calendar className='h-4 w-4 text-blue-600' />
                {t('tournamentStatus')}
              </h4>
              <div className='space-y-3'>
                {/* Next Tournament */}
                {tournamentDetails.next_tournament && (
                  <div className='flex items-center'>
                    <Avatar className='h-9 w-9'>
                      <AvatarFallback className='bg-gradient-to-r from-green-500 to-teal-600 text-white'>
                        <Clock className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                    <div className='ml-4 flex-1 space-y-1'>
                      <Link
                        href={`/dashboard/tournament/${tournamentDetails.next_tournament.id}`}
                        className='block cursor-pointer text-sm font-medium leading-none hover:text-blue-600 hover:underline'
                      >
                        {t('next')} {tournamentDetails.next_tournament.name}
                      </Link>
                      <p className='text-xs text-muted-foreground'>
                        {t('startsInDays', {
                          days: tournamentDetails.next_tournament
                            .days_until_start
                        })}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        {tournamentDetails.next_tournament.registered_players}/
                        {tournamentDetails.next_tournament.max_capacity}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {(
                          (tournamentDetails.next_tournament
                            .registered_players /
                            tournamentDetails.next_tournament.max_capacity) *
                          100
                        ).toFixed(0)}
                        % full
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Tournaments */}
                {tournamentDetails.live_tournaments.map((tournament) => (
                  <div key={tournament.id} className='flex items-center'>
                    <Avatar className='h-9 w-9'>
                      <AvatarFallback className='bg-gradient-to-r from-red-500 to-pink-600 text-white'>
                        <Play className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                    <div className='ml-4 flex-1 space-y-1'>
                      <Link
                        href={`/dashboard/tournament/${tournament.id}`}
                        className='block cursor-pointer text-sm font-medium leading-none hover:text-blue-600 hover:underline'
                      >
                        {t('live')} {tournament.name}
                      </Link>
                      <p className='text-xs text-muted-foreground'>
                        {t('day')} {tournament.days_running}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        {(() => {
                          const progress = getTournamentProgress(tournament.id);
                          return progress?.completion_percentage
                            ? progress.completion_percentage.toFixed(0)
                            : '0';
                        })()}
                        %
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {t('complete')}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tournaments Ending Soon */}
                {tournamentDetails.tournaments_ending_soon.map((tournament) => (
                  <div key={tournament.id} className='flex items-center'>
                    <Avatar className='h-9 w-9'>
                      <AvatarFallback className='bg-gradient-to-r from-orange-500 to-red-600 text-white'>
                        <AlertTriangle className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                    <div className='ml-4 flex-1 space-y-1'>
                      <Link
                        href={`/dashboard/tournament/${tournament.id}`}
                        className='block cursor-pointer text-sm font-medium leading-none hover:text-blue-600 hover:underline'
                      >
                        {t('ending')} {tournament.name}
                      </Link>
                      <p className='text-xs text-muted-foreground'>
                        {t('daysRemaining', {
                          days: tournament.days_remaining
                        })}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        {tournament.completion_percentage
                          ? tournament.completion_percentage.toFixed(0)
                          : '0'}
                        %
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {t('complete')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Performing Couples */}
          {topCouples.length > 0 && (
            <div>
              <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                <Trophy className='h-4 w-4 text-yellow-600' />
                {t('topPerformingCouples')}
              </h4>
              <div className='space-y-3'>
                {topCouples.map((couple, index) => (
                  <div key={couple.couple_id} className='flex items-center'>
                    <Avatar className='h-9 w-9'>
                      <AvatarFallback className='bg-gradient-to-r from-blue-500 to-purple-600 text-white'>
                        #{index + 1}
                      </AvatarFallback>
                    </Avatar>
                    <div className='ml-4 flex-1 space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {couple.couple_name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {couple.tournament_name}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        {couple.win_rate.toFixed(1)}%
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {couple.total_points} {t('points')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tournaments Timeline (if no tournament details available) */}
          {!tournamentDetails && recentTournaments.length > 0 && (
            <div>
              <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                <Calendar className='h-4 w-4 text-blue-600' />
                {t('recentTournaments')}
              </h4>
              <div className='space-y-3'>
                {recentTournaments.map((tournament) => (
                  <div key={tournament.id} className='flex items-center'>
                    <Avatar className='h-9 w-9'>
                      <AvatarFallback>
                        <Users className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                    <div className='ml-4 flex-1 space-y-1'>
                      <Link
                        href={`/dashboard/tournament/${tournament.id}`}
                        className='block cursor-pointer text-sm font-medium leading-none hover:text-blue-600 hover:underline'
                      >
                        {tournament.name}
                      </Link>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(tournament.start_date).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric'
                          }
                        )}{' '}
                        -{' '}
                        {new Date(tournament.end_date).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric'
                          }
                        )}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          tournament.status === 'active'
                            ? 'default'
                            : tournament.status === 'upcoming'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {tournament.status}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {tournament.players_number} players
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
