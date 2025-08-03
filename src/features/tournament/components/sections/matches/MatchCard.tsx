'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  Timer,
  Edit2,
  Trophy
} from 'lucide-react';
import { format } from 'date-fns';
import { MatchResultEntry } from './MatchResultEntry';
import { useCourtName } from '../../../hooks/useCourtName';

interface MatchCardProps {
  match: StagingMatch;
  getCoupleName: (id: number) => string;
  onMatchUpdate: () => void;
  /** Optional court data sources for enhanced court name resolution */
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

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  getCoupleName,
  onMatchUpdate,
  courtDataSources
}) => {
  const t = useTranslations('Dashboard');
  const [showResultEntry, setShowResultEntry] = useState(false);

  // Initialize court name hook
  const { getCourtName } = useCourtName(courtDataSources || {});

  // Get match status info
  const getMatchStatusInfo = () => {
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
            icon: Play
          };
        }
        return {
          label: t('upcoming', { defaultValue: 'Upcoming' }),
          variant: 'secondary' as const,
          icon: Clock
        };
      case 'completed':
        return {
          label: t('completed', { defaultValue: 'Completed' }),
          variant: 'default' as const,
          icon: CheckCircle
        };
      case 'time_expired':
        return {
          label: t('timeExpired', { defaultValue: 'Time Expired' }),
          variant: 'destructive' as const,
          icon: Timer
        };
      case 'forfeited':
        return {
          label: t('forfeited', { defaultValue: 'Forfeited' }),
          variant: 'outline' as const,
          icon: Trophy
        };
      default:
        return {
          label: t('unknown', { defaultValue: 'Unknown' }),
          variant: 'secondary' as const,
          icon: Clock
        };
    }
  };

  const statusInfo = getMatchStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Get match result display
  const getMatchResult = () => {
    if (!match.winner_couple_id || match.match_result_status === 'pending') {
      return null;
    }

    const winner =
      match.winner_couple_id === match.couple1_id
        ? getCoupleName(match.couple1_id)
        : getCoupleName(match.couple2_id);

    // Get games scores if available
    const couple1Games =
      match.games?.filter((g) => g.winner_id === match.couple1_id).length || 0;
    const couple2Games =
      match.games?.filter((g) => g.winner_id === match.couple2_id).length || 0;

    return {
      winner,
      score: `${couple1Games}-${couple2Games}`
    };
  };

  const result = getMatchResult();

  return (
    <>
      <Card className='w-full'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              {getCoupleName(match.couple1_id)} vs{' '}
              {getCoupleName(match.couple2_id)}
            </CardTitle>
            <Badge
              variant={statusInfo.variant}
              className='flex items-center gap-1'
            >
              <StatusIcon className='h-3 w-3' />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          <div className='space-y-3'>
            {/* Match Details */}
            <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
              {match.court_id && (
                <div className='flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {getCourtName(match.court_id)}
                </div>
              )}

              {match.scheduled_start && (
                <div className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  {format(new Date(match.scheduled_start), 'MMM d, HH:mm')}
                </div>
              )}

              {match.is_time_limited && match.time_limit_minutes && (
                <div className='flex items-center gap-1'>
                  <Timer className='h-3 w-3' />
                  {match.time_limit_minutes}min
                </div>
              )}
            </div>

            {/* Match Result */}
            {result && (
              <div className='flex items-center justify-between rounded-lg bg-muted p-3'>
                <div className='flex items-center gap-2'>
                  <Trophy className='h-4 w-4 text-yellow-600' />
                  <span className='font-medium'>{result.winner}</span>
                </div>
                <Badge variant='outline' className='font-mono'>
                  {result.score}
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex items-center justify-end gap-2 pt-2'>
              {match.match_result_status === 'pending' && (
                <Button
                  onClick={() => setShowResultEntry(true)}
                  size='sm'
                  variant='outline'
                  className='flex items-center gap-1'
                >
                  <Edit2 className='h-3 w-3' />
                  {t('enterResult', { defaultValue: 'Enter Result' })}
                </Button>
              )}

              {match.match_result_status !== 'pending' && (
                <Button
                  onClick={() => setShowResultEntry(true)}
                  size='sm'
                  variant='ghost'
                  className='flex items-center gap-1'
                >
                  <Edit2 className='h-3 w-3' />
                  {t('editResult', { defaultValue: 'Edit Result' })}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Result Entry Dialog */}
      {showResultEntry && (
        <MatchResultEntry
          match={match}
          couple1Name={getCoupleName(match.couple1_id)}
          couple2Name={getCoupleName(match.couple2_id)}
          isOpen={showResultEntry}
          onClose={() => setShowResultEntry(false)}
          onSave={async () => {
            onMatchUpdate();
            return true;
          }}
        />
      )}
    </>
  );
};
