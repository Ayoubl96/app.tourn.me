'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { useTranslations } from 'next-intl';
import { MetricCards } from './metric-cards';
import { PieGraph } from './pie-graph';
import { AreaGraph } from './area-graph';
import { TournamentHighlights } from './tournament-highlights';
import { OperationalAlerts } from './operational-alerts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function DashboardOverview() {
  const { data, loading, error } = useDashboard();
  const t = useTranslations('DashboardOverview');

  if (error) {
    return (
      <Card className='m-4'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-red-600'>
            <AlertCircle className='h-5 w-5' />
            {t('errorLoadingDashboard')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-4' />
              </CardHeader>
              <CardContent>
                <Skeleton className='mb-2 h-8 w-16' />
                <Skeleton className='h-3 w-32' />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>
            <Skeleton className='h-[400px] w-full' />
          </div>
          <div className='col-span-4 md:col-span-3'>
            <Skeleton className='h-[400px] w-full' />
          </div>
          <div className='col-span-4'>
            <Skeleton className='h-[400px] w-full' />
          </div>
          <div className='col-span-4 md:col-span-3'>
            <Skeleton className='h-[400px] w-full' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Metric Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCards data={data.tournament_management} />
      </div>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Tournament Highlights */}
        <div className='col-span-4'>
          <TournamentHighlights
            progressData={data.real_time_progress}
            timelineData={data.tournament_management.tournament_timeline}
            tournamentDetails={data.tournament_management.tournament_details}
          />
        </div>

        {/* Player Level Distribution */}
        <div className='col-span-4 md:col-span-3'>
          <AreaGraph data={data.player_performance} />
        </div>

        {/* Match Status Distribution */}
        <div className='col-span-4'>
          <PieGraph data={data.real_time_progress} />
        </div>
      </div>

      {/* Operational Alerts Section */}
      <div className='mt-6'>
        <OperationalAlerts data={data.operational_dashboard} />
      </div>
    </div>
  );
}
