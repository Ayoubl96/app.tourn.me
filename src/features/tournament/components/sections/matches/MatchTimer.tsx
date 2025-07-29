'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface MatchTimerProps {
  matches: StagingMatch[];
  onTimeExpired: () => void;
}

export const MatchTimer: React.FC<MatchTimerProps> = ({
  matches,
  onTimeExpired
}) => {
  const t = useTranslations('Dashboard');

  // Filter time-limited matches
  const timeLimitedMatches = matches.filter(
    (match) =>
      match.is_time_limited &&
      match.time_limit_minutes &&
      match.time_limit_minutes > 0
  );

  const [timers, setTimers] = useState<
    Record<
      number,
      {
        timeRemaining: number;
        isRunning: boolean;
        isPaused: boolean;
      }
    >
  >({});

  // Initialize timers for time-limited matches
  useEffect(() => {
    const newTimers: Record<
      number,
      {
        timeRemaining: number;
        isRunning: boolean;
        isPaused: boolean;
      }
    > = {};

    timeLimitedMatches.forEach((match) => {
      const timeLimit = (match.time_limit_minutes || 30) * 60; // Convert to seconds
      newTimers[match.id] = {
        timeRemaining: timeLimit,
        isRunning: false,
        isPaused: false
      };
    });

    setTimers(newTimers);
  }, [timeLimitedMatches]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        let hasExpired = false;

        Object.keys(updated).forEach((matchIdStr) => {
          const matchId = parseInt(matchIdStr);
          const timer = updated[matchId];

          if (timer && timer.isRunning && !timer.isPaused) {
            timer.timeRemaining = Math.max(0, timer.timeRemaining - 1);

            if (timer.timeRemaining === 0) {
              timer.isRunning = false;
              hasExpired = true;
            }
          }
        });

        if (hasExpired) {
          onTimeExpired();
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeExpired]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Get timer color based on remaining time
  const getTimerColor = (timeRemaining: number, totalTime: number) => {
    const percentage = (timeRemaining / totalTime) * 100;
    if (percentage > 50) return 'text-green-600 dark:text-green-400';
    if (percentage > 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Control functions
  const startTimer = (matchId: number) => {
    setTimers((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        isRunning: true,
        isPaused: false
      }
    }));
  };

  const pauseTimer = (matchId: number) => {
    setTimers((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        isPaused: !prev[matchId].isPaused
      }
    }));
  };

  const resetTimer = (matchId: number) => {
    const match = timeLimitedMatches.find((m) => m.id === matchId);
    if (match) {
      const timeLimit = (match.time_limit_minutes || 30) * 60;
      setTimers((prev) => ({
        ...prev,
        [matchId]: {
          timeRemaining: timeLimit,
          isRunning: false,
          isPaused: false
        }
      }));
    }
  };

  if (timeLimitedMatches.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      {timeLimitedMatches.map((match) => {
        const timer = timers[match.id];
        if (!timer) return null;

        const totalTime = (match.time_limit_minutes || 30) * 60;
        const isExpired = timer.timeRemaining === 0;

        return (
          <Card key={match.id} className='w-full'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                  <Timer className='h-5 w-5' />
                  {t('matchTimer', { defaultValue: 'Match Timer' })}
                </CardTitle>
                <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                  {match.time_limit_minutes}min{' '}
                  {t('limit', { defaultValue: 'limit' })}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className='pt-0'>
              <div className='space-y-4'>
                {/* Timer Display */}
                <div className='text-center'>
                  <div
                    className={`font-mono text-4xl font-bold ${getTimerColor(timer.timeRemaining, totalTime)}`}
                  >
                    {formatTime(timer.timeRemaining)}
                  </div>
                  <div className='mt-1 text-sm text-muted-foreground'>
                    {isExpired
                      ? t('timeExpired', { defaultValue: 'Time Expired' })
                      : timer.isRunning && timer.isPaused
                        ? t('paused', { defaultValue: 'Paused' })
                        : timer.isRunning
                          ? t('running', { defaultValue: 'Running' })
                          : t('ready', { defaultValue: 'Ready' })}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className='flex items-center justify-center gap-2'>
                  {!timer.isRunning ? (
                    <Button
                      onClick={() => startTimer(match.id)}
                      disabled={isExpired}
                      size='sm'
                      className='flex items-center gap-1'
                    >
                      <Play className='h-3 w-3' />
                      {t('start', { defaultValue: 'Start' })}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => pauseTimer(match.id)}
                      size='sm'
                      variant='outline'
                      className='flex items-center gap-1'
                    >
                      <Pause className='h-3 w-3' />
                      {timer.isPaused
                        ? t('resume', { defaultValue: 'Resume' })
                        : t('pause', { defaultValue: 'Pause' })}
                    </Button>
                  )}

                  <Button
                    onClick={() => resetTimer(match.id)}
                    size='sm'
                    variant='outline'
                    className='flex items-center gap-1'
                  >
                    <RotateCcw className='h-3 w-3' />
                    {t('reset', { defaultValue: 'Reset' })}
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className='h-2 w-full rounded-full bg-muted'>
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      timer.timeRemaining / totalTime > 0.5
                        ? 'bg-green-500'
                        : timer.timeRemaining / totalTime > 0.2
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(timer.timeRemaining / totalTime) * 100}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
