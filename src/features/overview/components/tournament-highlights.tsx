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
  TournamentTimelineItem
} from '@/api/dashboard';
import { Trophy, Calendar, Users } from 'lucide-react';

interface TournamentHighlightsProps {
  progressData?: RealTimeTournamentProgress;
  timelineData?: TournamentTimelineItem[];
}

export function TournamentHighlights({
  progressData,
  timelineData
}: TournamentHighlightsProps) {
  if (!progressData && !timelineData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tournament Highlights</CardTitle>
          <CardDescription>Loading tournament data...</CardDescription>
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
          Tournament Highlights
        </CardTitle>
        <CardDescription>
          Top performing couples and recent tournaments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Top Performing Couples */}
          {topCouples.length > 0 && (
            <div>
              <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                <Trophy className='h-4 w-4 text-yellow-600' />
                Top Performing Couples
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
                        {couple.total_points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tournaments */}
          {recentTournaments.length > 0 && (
            <div>
              <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                <Calendar className='h-4 w-4 text-blue-600' />
                Recent Tournaments
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
                      <p className='text-sm font-medium leading-none'>
                        {tournament.name}
                      </p>
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
