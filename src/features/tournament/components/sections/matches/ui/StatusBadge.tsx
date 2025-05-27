import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StagingMatch } from '@/api/tournaments/types';
import { getMatchTimingStatus } from '@/features/tournament/utils/matchHelpers';
import { useTranslations } from 'next-intl';

interface StatusBadgeProps {
  match: StagingMatch;
}

export function StatusBadge({ match }: StatusBadgeProps) {
  const t = useTranslations('Dashboard');
  const timingStatus = getMatchTimingStatus(match);

  if (match.match_result_status !== 'pending') {
    switch (match.match_result_status) {
      case 'completed':
        return (
          <Badge className='bg-green-500'>
            {t('completed', { defaultValue: 'Completed' })}
          </Badge>
        );
      case 'time_expired':
        return (
          <Badge className='bg-orange-500'>
            {t('timeExpired', { defaultValue: 'Time Expired' })}
          </Badge>
        );
      case 'forfeited':
        return (
          <Badge className='bg-red-500'>
            {t('forfeited', { defaultValue: 'Forfeited' })}
          </Badge>
        );
      default:
        return <Badge>{match.match_result_status}</Badge>;
    }
  }

  switch (timingStatus) {
    case 'in-progress':
      return (
        <Badge className='bg-red-500'>
          {t('live', { defaultValue: 'LIVE' })}
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge className='bg-amber-500'>
          {t('soon', { defaultValue: 'Starting Soon' })}
        </Badge>
      );
    case 'ended':
      return (
        <Badge variant='secondary'>
          {t('waitingResult', { defaultValue: 'Waiting Result' })}
        </Badge>
      );
    case 'scheduled':
      return (
        <Badge variant='outline'>
          {t('scheduled', { defaultValue: 'Scheduled' })}
        </Badge>
      );
    default:
      return (
        <Badge variant='outline'>
          {t('pending', { defaultValue: 'Pending' })}
        </Badge>
      );
  }
}
