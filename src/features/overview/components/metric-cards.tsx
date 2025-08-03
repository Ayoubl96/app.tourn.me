'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentManagementOverview } from '@/api/dashboard';
import { Trophy, Users, Activity, Building } from 'lucide-react';

interface MetricCardsProps {
  data: TournamentManagementOverview;
}

export function MetricCards({ data }: MetricCardsProps) {
  const cards = [
    {
      title: 'Active Tournaments',
      value: data.active_tournaments.toString(),
      change: `${data.upcoming_tournaments} upcoming`,
      icon: Trophy,
      color: 'text-blue-600'
    },
    {
      title: 'Registered Players',
      value: data.total_registered_players.toString(),
      change: `${data.player_change > 0 ? '+' : ''}${data.player_change_percentage.toFixed(1)}% from last month`,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Matches Today',
      value: data.matches_played_today.toString(),
      change: `${data.pending_matches} pending`,
      icon: Activity,
      color: 'text-orange-600'
    },
    {
      title: 'Court Utilization',
      value: `${data.court_utilization_rate.toFixed(1)}%`,
      change: "Today's usage rate",
      icon: Building,
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
