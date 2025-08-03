'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

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
import { RealTimeTournamentProgress } from '@/api/dashboard';
interface PieGraphProps {
  data?: RealTimeTournamentProgress;
}

const chartConfig = {
  matches: {
    label: 'Matches'
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))'
  },
  scheduled: {
    label: 'Scheduled',
    color: 'hsl(var(--chart-2))'
  },
  in_progress: {
    label: 'In Progress',
    color: 'hsl(var(--chart-3))'
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-4))'
  }
} satisfies ChartConfig;

export function PieGraph({ data }: PieGraphProps) {
  const chartData = React.useMemo(() => {
    if (!data?.match_status_distribution) {
      return [];
    }

    const { match_status_distribution } = data;
    return [
      {
        status: 'completed',
        matches: match_status_distribution.completed,
        fill: 'var(--color-completed)'
      },
      {
        status: 'scheduled',
        matches: match_status_distribution.scheduled,
        fill: 'var(--color-scheduled)'
      },
      {
        status: 'in_progress',
        matches: match_status_distribution.in_progress,
        fill: 'var(--color-in_progress)'
      },
      {
        status: 'pending',
        matches: match_status_distribution.pending,
        fill: 'var(--color-pending)'
      }
    ].filter((item) => item.matches > 0);
  }, [data]);

  const totalMatches = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.matches, 0);
  }, [chartData]);

  if (!data) {
    return (
      <Card className='flex flex-col'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>Match Status Distribution</CardTitle>
          <CardDescription>Loading match status data...</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          <div className='flex h-[360px] items-center justify-center text-muted-foreground'>
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Match Status Distribution</CardTitle>
        <CardDescription>Current tournament match statuses</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[360px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='matches'
              nameKey='status'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalMatches.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Matches
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 font-medium leading-none'>
          Real-time match tracking <TrendingUp className='h-4 w-4' />
        </div>
        <div className='leading-none text-muted-foreground'>
          Current status of all tournament matches
        </div>
      </CardFooter>
    </Card>
  );
}
