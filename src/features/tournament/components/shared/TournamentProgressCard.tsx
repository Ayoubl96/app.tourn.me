import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Trophy, PlayCircle, Pause } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TournamentProgressCardProps {
  tournamentProgress: {
    percentage: number;
    quickStats: {
      matches_in_progress: number;
      matches_waiting: number;
      matches_remaining: number;
      matches_completed: number;
      estimated_completion: string;
    };
    name: string;
    lastUpdated: string;
  } | null;
  isLoading?: boolean;
}

export function TournamentProgressCard({
  tournamentProgress,
  isLoading = false
}: TournamentProgressCardProps) {
  const t = useTranslations('Dashboard');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='h-4 animate-pulse rounded bg-gray-200'></div>
            <div className='h-2 animate-pulse rounded bg-gray-200'></div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='h-8 animate-pulse rounded bg-gray-200'></div>
              <div className='h-8 animate-pulse rounded bg-gray-200'></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tournamentProgress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-4 text-center text-muted-foreground'>
            <p>No tournament progress data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { percentage, quickStats, name, lastUpdated } = tournamentProgress;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Tournament Progress
          </div>
          <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
            {percentage.toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-medium'>{name}</span>
            <span className='text-muted-foreground'>
              {quickStats.estimated_completion}
            </span>
          </div>
          <Progress value={percentage} className='h-3' />
        </div>

        {/* Quick Stats Grid */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='flex items-center gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-950/20'>
            <PlayCircle className='h-4 w-4 text-green-600' />
            <div className='text-sm'>
              <div className='font-medium text-green-700 dark:text-green-400'>
                {quickStats.matches_in_progress}
              </div>
              <div className='text-xs text-green-600 dark:text-green-500'>
                Live
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20'>
            <Pause className='h-4 w-4 text-blue-600' />
            <div className='text-sm'>
              <div className='font-medium text-blue-700 dark:text-blue-400'>
                {quickStats.matches_waiting}
              </div>
              <div className='text-xs text-blue-600 dark:text-blue-500'>
                Waiting
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 rounded-lg bg-orange-50 p-2 dark:bg-orange-950/20'>
            <Clock className='h-4 w-4 text-orange-600' />
            <div className='text-sm'>
              <div className='font-medium text-orange-700 dark:text-orange-400'>
                {quickStats.matches_remaining}
              </div>
              <div className='text-xs text-orange-600 dark:text-orange-500'>
                Remaining
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-900/20'>
            <Trophy className='h-4 w-4 text-gray-600' />
            <div className='text-sm'>
              <div className='font-medium text-gray-700 dark:text-gray-400'>
                {quickStats.matches_completed}
              </div>
              <div className='text-xs text-gray-600 dark:text-gray-500'>
                Completed
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className='border-t pt-2 text-center text-xs text-muted-foreground'>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
