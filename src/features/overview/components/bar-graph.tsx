'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { MatchCourtAnalytics } from '@/api/dashboard';

interface BarGraphProps {
  data?: MatchCourtAnalytics;
}

const chartConfig = {
  matches: {
    label: 'Matches',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

export function BarGraph({ data }: BarGraphProps) {
  const chartData = React.useMemo(() => {
    if (!data?.matches_per_day_30d) {
      return [];
    }

    return Object.entries(data.matches_per_day_30d)
      .map(([date, count]) => ({
        date,
        matches: count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Show last 14 days for better visibility
  }, [data]);

  const totalMatches = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.matches, 0);
  }, [chartData]);

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matches per Day</CardTitle>
          <CardDescription>Loading match data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[280px] items-center justify-center text-muted-foreground'>
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Matches per Day</CardTitle>
          <CardDescription>
            Showing match activity for the last 14 days
          </CardDescription>
        </div>
        <div className='flex'>
          <div className='relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6'>
            <span className='text-xs text-muted-foreground'>Total Matches</span>
            <span className='text-lg font-bold leading-none sm:text-3xl'>
              {totalMatches.toLocaleString()}
            </span>
          </div>
          <div className='relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6'>
            <span className='text-xs text-muted-foreground'>Avg Duration</span>
            <span className='text-lg font-bold leading-none sm:text-3xl'>
              {data.average_match_duration_minutes}min
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[280px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='matches'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar dataKey='matches' fill='var(--color-matches)' />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
