import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Clock, Timer } from 'lucide-react';
import { Couple } from '@/features/tournament/types';
import {
  getMatchTimingStatus,
  getPriorityMatches
} from '@/features/tournament/utils/matchHelpers';

interface GlobalMatchTimerProps {
  matches: StagingMatch[];
  couples: Couple[];
  getCoupleName: (id: number) => string;
  onTimeExpired?: (matchIds: number[]) => void;
  onTimerUpdate?: (
    timeRemaining: number,
    status: TimerStatus,
    activeMatches: StagingMatch[]
  ) => void;
}

type TimerStatus = 'not-started' | 'running' | 'paused' | 'expired';

interface TimerState {
  timeRemaining: number; // in seconds
  status: TimerStatus;
  startedAt: Date | null;
  pausedAt: Date | null;
  activeMatches: StagingMatch[];
  totalTime: number; // Store the original time limit
  activeMatchIds: number[]; // Store match IDs for persistence
}

interface PersistedTimerData {
  timeRemaining: number;
  status: TimerStatus;
  startedAt: string | null;
  pausedAt: string | null;
  totalTime: number;
  activeMatchIds: number[];
  lastUpdated: string;
}

export function GlobalMatchTimer({
  matches,
  couples,
  getCoupleName,
  onTimeExpired,
  onTimerUpdate
}: GlobalMatchTimerProps) {
  const t = useTranslations('Dashboard');

  // Get active time-limited matches that can be played now
  // Use the same logic as CourtCardView to identify which matches are currently active on courts
  const activeTimeLimitedMatches = (() => {
    // Get available courts that have matches
    const availableCourts = Array.from(
      new Set(
        matches
          .filter((m) => m.court_id && m.match_result_status === 'pending')
          .map((m) => m.court_id!)
      )
    );

    const activeMatches: StagingMatch[] = [];

    // For each court, find the active/next match that should be playing
    availableCourts.forEach((courtId) => {
      const courtMatches = matches.filter(
        (m) => m.court_id === courtId && m.match_result_status === 'pending'
      );

      if (courtMatches.length > 0) {
        // Use the same priority sorting as CourtCardView
        const sortedMatches = getPriorityMatches(courtMatches);

        // Take the first (highest priority) match for this court
        const activeMatch = sortedMatches[0];

        // Only include if it's time-limited
        if (
          activeMatch.is_time_limited &&
          activeMatch.time_limit_minutes &&
          activeMatch.time_limit_minutes > 0
        ) {
          activeMatches.push(activeMatch);
        }
      }
    });

    return activeMatches;
  })();

  // Get the time limit (use the first match's time limit, assuming all active matches have the same limit)
  const timeLimit =
    activeTimeLimitedMatches.length > 0
      ? (activeTimeLimitedMatches[0].time_limit_minutes || 30) * 60
      : 30 * 60;

  // Storage key for persistence
  const STORAGE_KEY = 'tournament-global-timer';

  // Load persisted timer state
  const loadPersistedState = useCallback((): TimerState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          timeRemaining: timeLimit,
          status: 'not-started',
          startedAt: null,
          pausedAt: null,
          activeMatches: activeTimeLimitedMatches,
          totalTime: timeLimit,
          activeMatchIds: activeTimeLimitedMatches.map((m) => m.id)
        };
      }

      const data: PersistedTimerData = JSON.parse(stored);
      const now = new Date();
      const lastUpdated = new Date(data.lastUpdated);

      // Check if the stored timer is for the same matches
      const currentMatchIds = activeTimeLimitedMatches.map((m) => m.id).sort();
      const storedMatchIds = data.activeMatchIds.sort();
      const sameMatches =
        currentMatchIds.length === storedMatchIds.length &&
        currentMatchIds.every((id, index) => id === storedMatchIds[index]);

      // If different matches, reset timer
      if (!sameMatches) {
        return {
          timeRemaining: timeLimit,
          status: 'not-started',
          startedAt: null,
          pausedAt: null,
          activeMatches: activeTimeLimitedMatches,
          totalTime: timeLimit,
          activeMatchIds: activeTimeLimitedMatches.map((m) => m.id)
        };
      }

      // Calculate elapsed time if timer was running
      let adjustedTimeRemaining = data.timeRemaining;
      let adjustedStatus = data.status;

      if (data.status === 'running' && data.startedAt) {
        const elapsedSinceLastUpdate = Math.floor(
          (now.getTime() - lastUpdated.getTime()) / 1000
        );
        adjustedTimeRemaining = Math.max(
          0,
          data.timeRemaining - elapsedSinceLastUpdate
        );

        // Check if timer expired while away
        if (adjustedTimeRemaining === 0) {
          adjustedStatus = 'expired';
        }
      }

      return {
        timeRemaining: adjustedTimeRemaining,
        status: adjustedStatus,
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        pausedAt: data.pausedAt ? new Date(data.pausedAt) : null,
        activeMatches: activeTimeLimitedMatches,
        totalTime: data.totalTime,
        activeMatchIds: activeTimeLimitedMatches.map((m) => m.id)
      };
    } catch (error) {
      console.error('Error loading persisted timer state:', error);
      return {
        timeRemaining: timeLimit,
        status: 'not-started',
        startedAt: null,
        pausedAt: null,
        activeMatches: activeTimeLimitedMatches,
        totalTime: timeLimit,
        activeMatchIds: activeTimeLimitedMatches.map((m) => m.id)
      };
    }
  }, [timeLimit, activeTimeLimitedMatches]);

  // Save timer state to localStorage
  const saveTimerState = useCallback((state: TimerState) => {
    try {
      const dataToStore: PersistedTimerData = {
        timeRemaining: state.timeRemaining,
        status: state.status,
        startedAt: state.startedAt?.toISOString() || null,
        pausedAt: state.pausedAt?.toISOString() || null,
        totalTime: state.totalTime,
        activeMatchIds: state.activeMatchIds,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }, []);

  const [timer, setTimer] = useState<TimerState>(() => loadPersistedState());
  const [wasRestored, setWasRestored] = useState(false);

  // Update timer state and persist it
  const updateTimer = useCallback(
    (updater: (prev: TimerState) => TimerState) => {
      setTimer((prev) => {
        const newState = updater(prev);
        saveTimerState(newState);
        return newState;
      });
    },
    [saveTimerState]
  );

  // Load persisted state on mount only - avoid infinite loop
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const data: PersistedTimerData = JSON.parse(stored);
        // Check if we restored a running or paused timer
        if (data.status === 'running' || data.status === 'paused') {
          setWasRestored(true);
          // Hide the restoration indicator after 5 seconds
          setTimeout(() => setWasRestored(false), 5000);
        }
      } catch (error) {
        console.error('Error checking stored timer state:', error);
      }
    }
  }, []); // Only run on mount

  // Update timer when matches change (but don't reload from storage)
  useEffect(() => {
    setTimer((prev) => {
      // If matches changed, update the active matches but keep timer state if it's running
      const currentMatchIds = activeTimeLimitedMatches.map((m) => m.id).sort();
      const prevMatchIds = prev.activeMatchIds.sort();
      const sameMatches =
        currentMatchIds.length === prevMatchIds.length &&
        currentMatchIds.every((id, index) => id === prevMatchIds[index]);

      if (!sameMatches) {
        // Different matches - reset timer
        const newState = {
          timeRemaining: timeLimit,
          status: 'not-started' as TimerStatus,
          startedAt: null,
          pausedAt: null,
          activeMatches: activeTimeLimitedMatches,
          totalTime: timeLimit,
          activeMatchIds: activeTimeLimitedMatches.map((m) => m.id)
        };
        saveTimerState(newState);
        return newState;
      } else {
        // Same matches - just update the activeMatches array
        const updatedState = {
          ...prev,
          activeMatches: activeTimeLimitedMatches
        };
        saveTimerState(updatedState);
        return updatedState;
      }
    });
  }, [activeTimeLimitedMatches, timeLimit, saveTimerState]);

  // Check for expired timer on mount
  useEffect(() => {
    if (timer.status === 'expired' && timer.activeMatches.length > 0) {
      const matchIds = timer.activeMatches.map((match) => match.id);
      onTimeExpired?.(matchIds);
    }
  }, []); // Only run on mount

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Get timer color based on remaining time
  const getTimerColor = useCallback(
    (timeRemaining: number, totalTime: number) => {
      const percentage = (timeRemaining / totalTime) * 100;
      if (percentage > 50) return 'text-green-600 dark:text-green-400';
      if (percentage > 20) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    },
    []
  );

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer.status === 'running') {
      interval = setInterval(() => {
        updateTimer((prev) => {
          const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);

          // Notify parent of timer update
          onTimerUpdate?.(newTimeRemaining, prev.status, prev.activeMatches);

          // Check if time expired
          if (newTimeRemaining === 0) {
            const matchIds = prev.activeMatches.map((match) => match.id);
            onTimeExpired?.(matchIds);
            return {
              ...prev,
              timeRemaining: newTimeRemaining,
              status: 'expired'
            };
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.status, onTimeExpired, onTimerUpdate, updateTimer]);

  // Start timer
  const startTimer = () => {
    updateTimer((prev) => ({
      ...prev,
      status: 'running',
      startedAt: prev.startedAt || new Date(),
      pausedAt: null
    }));
  };

  // Pause timer
  const pauseTimer = () => {
    updateTimer((prev) => ({
      ...prev,
      status: 'paused',
      pausedAt: new Date()
    }));
  };

  // Reset timer
  const resetTimer = () => {
    updateTimer((prev) => ({
      timeRemaining: prev.totalTime,
      status: 'not-started',
      startedAt: null,
      pausedAt: null,
      activeMatches: prev.activeMatches,
      totalTime: prev.totalTime,
      activeMatchIds: prev.activeMatchIds
    }));
  };

  // Clear persisted state when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if timer is not running
      if (timer.status === 'not-started' || timer.status === 'expired') {
        localStorage.removeItem(STORAGE_KEY);
      }
    };
  }, [timer.status]);

  // Get status badge
  const getStatusBadge = () => {
    switch (timer.status) {
      case 'not-started':
        return <Badge variant='outline'>Ready</Badge>;
      case 'running':
        return <Badge className='bg-green-500'>Live</Badge>;
      case 'paused':
        return <Badge className='bg-yellow-500'>Paused</Badge>;
      case 'expired':
        return <Badge className='bg-red-500'>Time Expired</Badge>;
      default:
        return null;
    }
  };

  // Don't show timer if no active time-limited matches
  if (activeTimeLimitedMatches.length === 0) {
    // Clear persisted state if no matches
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Timer className='h-5 w-5' />
            {t('liveMatchTimer', { defaultValue: 'Live Match Timer' })}
            {wasRestored && (
              <Badge
                variant='outline'
                className='border-blue-200 bg-blue-50 text-xs text-blue-600 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
              >
                {t('timerRestored', { defaultValue: 'Restored' })}
              </Badge>
            )}
          </CardTitle>
          {getStatusBadge()}
        </div>
        {wasRestored && (
          <div className='mt-1 text-xs text-blue-600 dark:text-blue-400'>
            {t('timerContinuedFromSession', {
              defaultValue: 'Timer continued from previous session'
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Active Matches Info */}
        <div className='text-sm text-muted-foreground'>
          <p>
            {t('liveMatches', { defaultValue: 'Live matches on courts' })}:{' '}
            {activeTimeLimitedMatches.length}
          </p>
          <div className='mt-2 space-y-1'>
            {activeTimeLimitedMatches.slice(0, 3).map((match) => (
              <div key={match.id} className='text-xs'>
                {getCoupleName(match.couple1_id)} vs{' '}
                {getCoupleName(match.couple2_id)}
              </div>
            ))}
            {activeTimeLimitedMatches.length > 3 && (
              <div className='text-xs text-muted-foreground'>
                +{activeTimeLimitedMatches.length - 3}{' '}
                {t('moreMatches', { defaultValue: 'more matches' })}
              </div>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className='text-center'>
          <div
            className={`font-mono text-4xl font-bold ${getTimerColor(timer.timeRemaining, timer.totalTime)}`}
          >
            {formatTime(timer.timeRemaining)}
          </div>
          <div className='mt-1 text-sm text-muted-foreground'>
            {timer.status === 'expired'
              ? t('timeExpired', { defaultValue: 'Time Expired' })
              : t('timeRemaining', { defaultValue: 'Time Remaining' })}
          </div>
        </div>

        {/* Timer Controls */}
        <div className='flex justify-center gap-2'>
          {timer.status === 'not-started' && (
            <Button onClick={startTimer} className='flex items-center gap-2'>
              <Play className='h-4 w-4' />
              {t('startTimer', { defaultValue: 'Start Timer' })}
            </Button>
          )}

          {timer.status === 'running' && (
            <Button
              onClick={pauseTimer}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Pause className='h-4 w-4' />
              {t('pauseTimer', { defaultValue: 'Pause' })}
            </Button>
          )}

          {timer.status === 'paused' && (
            <>
              <Button onClick={startTimer} className='flex items-center gap-2'>
                <Play className='h-4 w-4' />
                {t('resumeTimer', { defaultValue: 'Resume' })}
              </Button>
              <Button
                onClick={resetTimer}
                variant='outline'
                className='flex items-center gap-2'
              >
                <RotateCcw className='h-4 w-4' />
                {t('resetTimer', { defaultValue: 'Reset' })}
              </Button>
            </>
          )}

          {timer.status === 'expired' && (
            <Button onClick={resetTimer} className='flex items-center gap-2'>
              <RotateCcw className='h-4 w-4' />
              {t('newTimer', { defaultValue: 'New Timer' })}
            </Button>
          )}
        </div>

        {/* Time Expired Message */}
        {timer.status === 'expired' && (
          <div className='rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/20'>
            <p className='font-medium text-red-600 dark:text-red-400'>
              {t('allLiveMatchesTimeExpired', {
                defaultValue: 'All live matches time has expired!'
              })}
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t('clickNewTimerLive', {
                defaultValue:
                  'Click "New Timer" to start a new countdown for current live matches'
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
