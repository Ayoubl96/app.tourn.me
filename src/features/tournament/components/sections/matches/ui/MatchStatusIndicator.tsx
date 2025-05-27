import React from 'react';
import { Clock } from 'lucide-react';
import { StagingMatch } from '@/api/tournaments/types';

interface MatchStatusIndicatorProps {
  match: StagingMatch;
  isCurrent: boolean;
  canPlay: boolean;
}

export function MatchStatusIndicator({
  match,
  isCurrent,
  canPlay
}: MatchStatusIndicatorProps) {
  // Only show indicator if match is either current or next to play
  if (isCurrent || canPlay) {
    return (
      <div className='mt-2 flex w-full items-center justify-center rounded-md bg-red-500 px-3 py-2 text-white dark:bg-red-600'>
        <Clock className='mr-2 h-4 w-4 animate-pulse' />
        <span className='font-semibold uppercase'>LIVE</span>
      </div>
    );
  }

  return null;
}
