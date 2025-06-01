import React, { useState } from 'react';
import { StagingMatch } from '@/api/tournaments/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Edit3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  isCurrentMatch,
  canBePlayedNext
} from '@/features/tournament/utils/matchHelpers';
import { CoupleDisplay, VersusDisplay } from './CoupleDisplay';
import { InlineMatchResultEntry } from './InlineMatchResultEntry';
import { Couple } from '@/features/tournament/types';

interface MatchCardProps {
  match: StagingMatch;
  allMatches: StagingMatch[];
  couples: Couple[];
  getCoupleName: (id: number) => string;
  getGroupName: (match: StagingMatch) => string;
  getBracketName: (match: StagingMatch) => string;
  index: number;
  onSaveResult?: (matchId: number, scores: any) => Promise<boolean>;
}

export function MatchCard({
  match,
  allMatches,
  couples,
  getCoupleName,
  getGroupName,
  getBracketName,
  index,
  onSaveResult
}: MatchCardProps) {
  const t = useTranslations('Dashboard');
  const [showResultEntry, setShowResultEntry] = useState(false);

  const isCurrent = isCurrentMatch(match, allMatches, index);
  const canPlay = canBePlayedNext(match, allMatches);
  const isActive = isCurrent || canPlay;

  // Get scores if the match has games
  const hasGames = match.games && match.games.length > 0;
  const couple1Score = hasGames
    ? match.games.filter((game) => game.winner_id === match.couple1_id).length
    : null;
  const couple2Score = hasGames
    ? match.games.filter((game) => game.winner_id === match.couple2_id).length
    : null;

  // Get pool/group/bracket info
  const groupInfo = match.group_id ? getGroupName(match) : null;
  const bracketInfo = match.bracket_id ? getBracketName(match) : null;
  const tournamentInfo = match.group_id
    ? `${t('roundRobin', { defaultValue: 'Round Robin' })} · ${groupInfo}`
    : match.bracket_id
      ? bracketInfo
      : '';

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

  return (
    <>
      <Card
        className={`overflow-hidden ${isActive ? 'border-l-4 border-yellow-400 dark:border-yellow-500' : ''}`}
      >
        <CardContent className='p-0'>
          <div className='border-b border-border/40 bg-muted/30 p-3'>
            <div className='text-sm text-muted-foreground'>
              {t('game', { defaultValue: 'Game' })} {index + 1}
            </div>
          </div>

          <div className='p-4'>
            <div className='flex flex-col space-y-4'>
              {/* Horizontal Team A vs Team B layout with scores */}
              <div className='flex items-center justify-between'>
                <VersusDisplay
                  couple1Id={match.couple1_id}
                  couple2Id={match.couple2_id}
                  couples={couples}
                  getCoupleName={getCoupleName}
                  showAvatars={true}
                  compact={false}
                  className='flex-1'
                />
                {(couple1Score !== null || couple2Score !== null) && (
                  <div className='ml-4 text-xl font-bold'>
                    {couple1Score || 0} - {couple2Score || 0}
                  </div>
                )}
              </div>

              {/* Winner indicator */}
              {match.winner_couple_id && (
                <div className='flex items-center rounded bg-green-50 p-2 text-xs font-medium text-green-600 dark:bg-green-950/20 dark:text-green-400'>
                  <Trophy className='mr-2 h-3 w-3 flex-shrink-0' />
                  <CoupleDisplay
                    coupleId={match.winner_couple_id}
                    couples={couples}
                    fallbackName={getCoupleName(match.winner_couple_id)}
                    showAvatars={false}
                    compact={true}
                  />
                </div>
              )}

              {/* Result Entry Button */}
              {onSaveResult && !hasResult && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleToggleResultEntry}
                  className='w-full'
                >
                  <Edit3 className='mr-2 h-4 w-4' />
                  {showResultEntry
                    ? t('hideResultEntry', {
                        defaultValue: 'Hide Result Entry'
                      })
                    : t('enterResult', { defaultValue: 'Enter Result' })}
                </Button>
              )}

              {/* Edit Result Button for completed matches */}
              {onSaveResult && hasResult && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleToggleResultEntry}
                  className='w-full'
                >
                  <Edit3 className='mr-2 h-4 w-4' />
                  {showResultEntry
                    ? t('hideResultEntry', {
                        defaultValue: 'Hide Result Entry'
                      })
                    : t('editResult', { defaultValue: 'Edit Result' })}
                </Button>
              )}
            </div>

            {/* Tournament info */}
            {tournamentInfo && (
              <div className='mt-4 flex items-center border-t border-border/40 pt-3 text-xs text-muted-foreground'>
                <Users className='mr-1 h-3 w-3' />
                {tournamentInfo}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inline Result Entry */}
      {showResultEntry && onSaveResult && (
        <InlineMatchResultEntry
          match={match}
          couple1Name={getCoupleName(match.couple1_id)}
          couple2Name={getCoupleName(match.couple2_id)}
          onSave={handleSaveResult}
          onCancel={handleCancelResultEntry}
        />
      )}
    </>
  );
}
