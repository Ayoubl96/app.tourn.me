import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Edit3 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { MatchStatusIndicator } from './MatchStatusIndicator';
import { CoupleDisplay, VersusDisplay } from './CoupleDisplay';
import { InlineMatchResultEntry } from './InlineMatchResultEntry';
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
  showStage?: boolean;
  stageType: 'group' | 'elimination';
  couples: Couple[];
  getCoupleName: (id: number) => string;
  getCourtName: (match: StagingMatch) => string;
  getGroupName: (match: StagingMatch) => string;
  getBracketName: (match: StagingMatch) => string;
  getStageName?: (match: StagingMatch) => string;
  onOpenResultEntry?: (match: StagingMatch) => void;
  onSaveResult?: (matchId: number, scores: any) => Promise<boolean>;
  isUpdatingMatch: boolean;
}

export function MatchRow({
  match,
  allMatches,
  showSchedule,
  showGroup = false,
  showBracket = false,
  showStage = false,
  stageType,
  couples,
  getCoupleName,
  getCourtName,
  getGroupName,
  getBracketName,
  getStageName,
  onOpenResultEntry,
  onSaveResult,
  isUpdatingMatch
}: MatchRowProps) {
  const t = useTranslations('Dashboard');
  const [showResultEntry, setShowResultEntry] = useState(false);

  const isCurrent = isCurrentMatch(match, allMatches, 0);
  const canPlay = canBePlayedNext(match, allMatches);

  // Check if match has result
  const hasResult = match.winner_couple_id !== null;

  const handleToggleResultEntry = () => {
    setShowResultEntry(!showResultEntry);
  };

  const handleSaveResult = async (matchId: number, scores: any) => {
    if (onSaveResult) {
      const success = await onSaveResult(matchId, scores);
      if (success) {
        setShowResultEntry(false);
      }
      return success;
    }
    return false;
  };

  const handleCancelResultEntry = () => {
    setShowResultEntry(false);
  };

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
    <>
      <TableRow
        key={match.id}
        className={
          isCurrent || canPlay
            ? 'border-l-4 border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-950/40'
            : ''
        }
      >
        {/* Conditional stage column */}
        {showStage && getStageName && (
          <TableCell>
            <span className='text-xs font-medium'>{getStageName(match)}</span>
          </TableCell>
        )}

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
            {/* Inline result entry button (preferred) */}
            {onSaveResult && (
              <Button
                {...getActionButtonProps(isCurrent, canPlay)}
                onClick={handleToggleResultEntry}
                disabled={isUpdatingMatch}
              >
                <Edit3 className='mr-2 h-4 w-4' />
                {showResultEntry
                  ? t('hideResultEntry', { defaultValue: 'Hide' })
                  : hasResult
                    ? t('editResult', { defaultValue: 'Edit' })
                    : t('enterResult', { defaultValue: 'Result' })}
              </Button>
            )}

            {/* Fallback to old popup if no onSaveResult */}
            {!onSaveResult && onOpenResultEntry && (
              <Button
                {...getActionButtonProps(isCurrent, canPlay)}
                onClick={() => onOpenResultEntry(match)}
                disabled={isUpdatingMatch}
              >
                <Clock className='mr-2 h-4 w-4' />
                {t('result', { defaultValue: 'Result' })}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Inline Result Entry Row */}
      {showResultEntry && onSaveResult && (
        <TableRow>
          <TableCell
            colSpan={
              (showStage && getStageName ? 1 : 0) + // Stage column
              3 + // Base columns: Couples, Status, Court
              (showGroup && stageType === 'group' ? 1 : 0) + // Group column
              (showBracket && stageType === 'elimination' ? 1 : 0) + // Bracket column
              (showSchedule ? 1 : 0) + // Schedule column
              2 // Result + Actions columns
            }
            className='p-0'
          >
            <InlineMatchResultEntry
              match={match}
              couple1Name={getCoupleName(match.couple1_id)}
              couple2Name={getCoupleName(match.couple2_id)}
              onSave={handleSaveResult}
              onCancel={handleCancelResultEntry}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
