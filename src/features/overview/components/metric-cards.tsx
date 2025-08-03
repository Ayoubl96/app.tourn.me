'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentManagementOverview } from '@/api/dashboard';
import { Trophy, Users, Activity, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MetricCardsProps {
  data: TournamentManagementOverview;
}

export function MetricCards({ data }: MetricCardsProps) {
  const t = useTranslations('DashboardOverview.metricCards');

  const cards = [
    {
      title: t('activeTournaments'),
      value: data.active_tournaments.toString(),
      change: `${data.upcoming_tournaments} ${t('upcoming')}`,
      icon: Trophy,
      color: 'text-blue-600'
    },
    {
      title: t('totalPlayers'),
      value: data.total_registered_players.toLocaleString(),
      change: `${data.current_month_players} ${t('thisMonth')} (${data.player_change > 0 ? '+' : ''}${data.player_change_percentage.toFixed(1)}%)`,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: t('matchesThisMonth'),
      value: data.matches_played_this_month.toString(),
      change: `${data.pending_matches} ${t('pending')}`,
      icon: Activity,
      color: 'text-orange-600'
    },
    {
      title: t('tournamentCapacity'),
      value: `${data.tournament_capacity_utilization.toFixed(1)}%`,
      change: t('seatsFilledVsAvailable'),
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

  return (
    <>
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {card.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{card.value}</div>
              <p className='text-xs text-muted-foreground'>{card.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
