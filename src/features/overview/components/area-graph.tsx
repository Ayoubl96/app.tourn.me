'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { PlayerCouplePerformance } from '@/api/dashboard';
interface AreaGraphProps {
  data?: PlayerCouplePerformance;
}

const chartConfig = {
  players: {
    label: 'Players',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

export function AreaGraph({ data }: AreaGraphProps) {
  const chartData = React.useMemo(() => {
    if (!data?.player_level_distribution) {
      return [];
    }

    return Object.entries(data.player_level_distribution)
      .map(([level, count]) => ({
        level: `Level ${level}`,
        players: count
      }))
      .sort((a, b) => {
        const levelA = parseInt(a.level.replace('Level ', ''));
        const levelB = parseInt(b.level.replace('Level ', ''));
        return levelA - levelB;
      });
  }, [data]);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Distribution</CardTitle>
          <CardDescription>Loading player data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[310px] items-center justify-center text-muted-foreground'>
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  const registrationTrend = data.player_registration_trends;
  const isGrowthPositive = registrationTrend.change > 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Level Distribution</CardTitle>
        <CardDescription>
          Distribution of players across skill levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[310px] w-full'
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='level'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='players'
              type='natural'
              fill='var(--color-players)'
              fillOpacity={0.4}
              stroke='var(--color-players)'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 font-medium leading-none'>
              {isGrowthPositive ? (
                <>
                  Registration growth by {Math.abs(registrationTrend.change)}{' '}
                  this month
                  <TrendingUp className='h-4 w-4' />
                </>
              ) : (
                <>
                  Registration declined by {Math.abs(registrationTrend.change)}{' '}
                  this month
                  <TrendingDown className='h-4 w-4' />
                </>
              )}
            </div>
            <div className='flex items-center gap-2 leading-none text-muted-foreground'>
              Current: {registrationTrend.current_month} | Previous:{' '}
              {registrationTrend.last_month}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
