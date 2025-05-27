import React from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trophy, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { MatchStatusIndicator } from './MatchStatusIndicator';
import { CoupleDisplay, VersusDisplay } from './CoupleDisplay';
import {
  formatMatchDate,
  formatMatchTime
} from '@/features/tournament/utils/matchHelpers';
import { getMatchResultData } from '@/features/tournament/utils/matchDisplayHelpers';
import {
  isCurrentMatch,
  canBePlayedNext
} from '@/features/tournament/utils/matchHelpers';
import { Couple } from '@/features/tournament/types';

interface MatchRowProps {
  match: StagingMatch;
  allMatches: StagingMatch[];
  showSchedule: boolean;
  showGroup?: boolean;
  showBracket?: boolean;
  stageType: 'group' | 'elimination';
  couples: Couple[];
  getCoupleName: (id: number) => string;
  getCourtName: (match: StagingMatch) => string;
  getGroupName: (match: StagingMatch) => string;
  getBracketName: (match: StagingMatch) => string;
  onOpenResultEntry: (match: StagingMatch) => void;
  isUpdatingMatch: boolean;
}

export function MatchRow({
  match,
  allMatches,
  showSchedule,
  showGroup = false,
  showBracket = false,
  stageType,
  couples,
  getCoupleName,
  getCourtName,
  getGroupName,
  getBracketName,
  onOpenResultEntry,
  isUpdatingMatch
}: MatchRowProps) {
  const t = useTranslations('Dashboard');
  const isCurrent = isCurrentMatch(match, allMatches, 0);
  const canPlay = canBePlayedNext(match, allMatches);

  // Standardize button styling
  const getActionButtonProps = (isCurrent: boolean, canPlay: boolean) => {
    return {
      variant:
        isCurrent || canPlay ? 'default' : ('outline' as 'default' | 'outline'),
      className:
        isCurrent || canPlay
          ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
          : '',
      size: 'sm' as 'sm'
    };
  };

  const renderCouplesCell = () => (
    <div className='flex flex-col space-y-2'>
      {/* Horizontal Team A vs Team B layout */}
      <VersusDisplay
        couple1Id={match.couple1_id}
        couple2Id={match.couple2_id}
        couples={couples}
        getCoupleName={getCoupleName}
        showAvatars={true}
        compact={false}
      />

      {/* Winner indicator */}
      {match.winner_couple_id && (
        <div className='flex items-center text-xs font-medium text-green-600 dark:text-green-400'>
          <Trophy className='mr-1 h-3 w-3' />
          <CoupleDisplay
            coupleId={match.winner_couple_id}
            couples={couples}
            fallbackName={getCoupleName(match.winner_couple_id)}
            showAvatars={false}
            compact={true}
          />
        </div>
      )}

      <MatchStatusIndicator
        match={match}
        isCurrent={isCurrent}
        canPlay={canPlay}
      />
    </div>
  );

  const renderResultCell = () => {
    const resultData = getMatchResultData(match);

    switch (resultData.type) {
      case 'no-result':
        return <span className='text-muted-foreground'>—</span>;

      case 'winner-only':
        return (
          <div className='font-medium text-green-600 dark:text-green-400'>
            <div className='mb-1 text-xs'>
              {t('winner', { defaultValue: 'Winner' })}:
            </div>
            <CoupleDisplay
              coupleId={resultData.winnerCoupleId!}
              couples={couples}
              fallbackName={getCoupleName(resultData.winnerCoupleId!)}
              showAvatars={false}
              compact={true}
            />
          </div>
        );

      case 'detailed-score':
        return (
          <div>
            <div className='text-base font-semibold'>
              {resultData.couple1Wins}-{resultData.couple2Wins}
            </div>
            <div className='mt-1 text-xs text-muted-foreground'>
              {resultData.gameScores!.map((game, index) => (
                <div key={index}>
                  {t('game', { defaultValue: 'Game' })} {index + 1}:{' '}
                  {game.couple1Score}-{game.couple2Score}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <TableRow
      key={match.id}
      className={
        isCurrent || canPlay
          ? 'border-l-4 border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-950/40'
          : ''
      }
    >
      <TableCell className='py-4'>{renderCouplesCell()}</TableCell>
      <TableCell>
        <StatusBadge match={match} />
      </TableCell>
      <TableCell>
        {match.court_id ? (
          getCourtName(match)
        ) : (
          <span className='text-sm text-muted-foreground'>—</span>
        )}
      </TableCell>

      {/* Conditional group column */}
      {showGroup && stageType === 'group' && (
        <TableCell>
          {getGroupName(match) || (
            <span className='text-sm text-muted-foreground'>—</span>
          )}
        </TableCell>
      )}

      {/* Conditional bracket column */}
      {showBracket && stageType === 'elimination' && (
        <TableCell>
          {match.bracket_id ? (
            getBracketName(match)
          ) : (
            <span className='text-sm text-muted-foreground'>—</span>
          )}
        </TableCell>
      )}

      {/* Conditional schedule column */}
      {showSchedule && (
        <TableCell>
          {match.scheduled_start ? (
            <div className='text-sm'>
              <div className='font-medium'>
                {formatMatchDate(match.scheduled_start)}
              </div>
              <div className='text-xs text-muted-foreground'>
                {formatMatchTime(match.scheduled_start)}
                {match.scheduled_end && (
                  <> - {formatMatchTime(match.scheduled_end)}</>
                )}
              </div>
            </div>
          ) : (
            <span className='text-sm text-muted-foreground'>
              {t('notScheduled', { defaultValue: 'Not scheduled' })}
            </span>
          )}
        </TableCell>
      )}

      {/* Result column */}
      <TableCell>{renderResultCell()}</TableCell>

      {/* Actions column */}
      <TableCell>
        <div className='flex gap-2'>
          <Button
            {...getActionButtonProps(isCurrent, canPlay)}
            onClick={() => onOpenResultEntry(match)}
            disabled={isUpdatingMatch}
          >
            <Clock className='mr-2 h-4 w-4' />
            {t('result', { defaultValue: 'Result' })}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
