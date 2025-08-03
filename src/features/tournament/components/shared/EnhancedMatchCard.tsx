'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { useCourtName } from '../../hooks/useCourtName';

interface EnhancedMatchCardProps {
  match: StagingMatch;
  getCoupleName: (id: number) => string;
  onMatchResultEntry: (match: StagingMatch) => void;
  /** Show group name badge if available */
  showGroupName?: boolean;
  /** Court data sources for enhanced court name resolution */
  courtDataSources?: {
    stageCourts?: Array<{ id: number; court_name?: string; name?: string }>;
    tournamentCourts?: Array<{
      id: number;
      court_name?: string;
      name?: string;
    }>;
    additionalCourts?: Array<{
      id: number;
      court_name?: string;
      name?: string;
    }>;
  };
}

/**
 * Centralized Enhanced Match Card component
 * Used across StageMatches and TournamentMatches with configurable options
 */
export const EnhancedMatchCard: React.FC<EnhancedMatchCardProps> = ({
  match,
  getCoupleName,
  onMatchResultEntry,
  showGroupName = false,
  courtDataSources
}) => {
  const t = useTranslations('Dashboard');

  // Initialize court name hook
  const { getCourtName } = useCourtName(courtDataSources || {});

  /**
   * Get match status information with styling
   */
  const getStatusInfo = () => {
    switch (match.match_result_status) {
      case 'pending':
        if (
          match.court_id &&
          match.scheduled_start &&
          new Date(match.scheduled_start) <= new Date()
        ) {
          return {
            label: t('live', { defaultValue: 'Live' }),
            variant: 'destructive' as const,
            canEdit: true
          };
        }
        return {
          label: t('upcoming', { defaultValue: 'Upcoming' }),
          variant: 'secondary' as const,
          canEdit: true
        };
      case 'completed':
        return {
          label: t('completed', { defaultValue: 'Completed' }),
          variant: 'default' as const,
          canEdit: true
        };
      case 'time_expired':
        return {
          label: t('timeExpired', { defaultValue: 'Time Expired' }),
          variant: 'destructive' as const,
          canEdit: true
        };
      case 'forfeited':
        return {
          label: t('forfeited', { defaultValue: 'Forfeited' }),
          variant: 'outline' as const,
          canEdit: true
        };
      default:
        return {
          label: t('unknown', { defaultValue: 'Unknown' }),
          variant: 'secondary' as const,
          canEdit: false
        };
    }
  };

  const statusInfo = getStatusInfo();
  const hasResult = match.games && match.games.length > 0;

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>
            {getCoupleName(match.couple1_id)} {t('vs', { defaultValue: 'vs' })}{' '}
            {getCoupleName(match.couple2_id)}
          </CardTitle>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {/* Group name badge - conditionally rendered */}
          {showGroupName && match.group_name && (
            <Badge variant='outline' className='text-xs'>
              {match.group_name}
            </Badge>
          )}

          {/* Match details */}
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            {match.court_id && (
              <div className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {getCourtName(match.court_id)}
              </div>
            )}
            {match.scheduled_start && (
              <div className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                {new Date(match.scheduled_start).toLocaleString()}
              </div>
            )}
          </div>

          {/* Game results if available */}
          {hasResult && (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>
                {t('gameScores', { defaultValue: 'Game Scores' })}
              </h4>
              <div className='grid gap-1'>
                {match.games?.map((game, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between text-sm'
                  >
                    <span>
                      {t('game', { defaultValue: 'Game' })} {game.game_number}
                    </span>
                    <span className='font-mono'>
                      {game.couple1_score} - {game.couple2_score}
                    </span>
                  </div>
                ))}
              </div>
              {match.winner_couple_id && (
                <div className='flex items-center gap-2 text-sm font-medium text-green-600'>
                  <Trophy className='h-3 w-3' />
                  {t('winner', { defaultValue: 'Winner' })}:{' '}
                  {getCoupleName(match.winner_couple_id)}
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          {statusInfo.canEdit && (
            <Button
              onClick={() => onMatchResultEntry(match)}
              variant='outline'
              size='sm'
              className='w-full'
            >
              {hasResult
                ? t('editResult', { defaultValue: 'Edit Result' })
                : t('enterResult', { defaultValue: 'Enter Result' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
