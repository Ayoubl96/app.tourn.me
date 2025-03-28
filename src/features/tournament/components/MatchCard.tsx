'use client';

import React, { useState } from 'react';
import { Match, Couple, MatchGames } from '@/features/tournament/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, formatTime } from '@/features/tournament/api/utils';
import { CalendarDays, Clock, Trophy, CircleAlert, Trash2 } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  t: any;
  onUpdateScore: (
    matchId: number,
    couple1Score: number,
    couple2Score: number
  ) => Promise<void>;
  onDelete?: (matchId: number) => Promise<void>;
  editable?: boolean;
  deleting?: boolean;
}

export function MatchCard({
  match,
  t,
  onUpdateScore,
  onDelete,
  editable = true,
  deleting = false
}: MatchCardProps) {
  // Get initial scores from match.games
  const getInitialScores = () => {
    if (!match.games) return { couple1: null, couple2: null };

    if (Array.isArray(match.games) && match.games.length > 0) {
      return {
        couple1: match.games[0].couple1,
        couple2: match.games[0].couple2
      };
    } else if ('sets' in match.games && match.games.sets.length > 0) {
      return {
        couple1: match.games.sets[0].couple1,
        couple2: match.games.sets[0].couple2
      };
    }

    return { couple1: null, couple2: null };
  };

  const initialScores = getInitialScores();

  const [isEditing, setIsEditing] = useState(false);
  const [couple1Score, setCouple1Score] = useState<number | null>(
    initialScores.couple1
  );
  const [couple2Score, setCouple2Score] = useState<number | null>(
    initialScores.couple2
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine the status based on games and winner_couple_id
  const getMatchStatus = (): 'scheduled' | 'completed' | 'in_progress' => {
    if (match.winner_couple_id) {
      return 'completed';
    } else if (match.games) {
      if (Array.isArray(match.games) && match.games.length > 0) {
        return 'in_progress';
      } else if ('sets' in match.games && match.games.sets.length > 0) {
        return 'in_progress';
      }
    }
    return 'scheduled';
  };

  const getStatusBadge = () => {
    const status = getMatchStatus();

    switch (status) {
      case 'scheduled':
        return (
          <Badge variant='outline' className='ml-2'>
            {t('scheduled')}
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant='default' className='ml-2'>
            {t('inProgress')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant='secondary' className='ml-2'>
            {t('completed')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCoupleName = (couple?: Couple) => {
    if (!couple) return t('unknown');
    return (
      couple.name ||
      `${couple.first_player?.nickname} / ${couple.second_player?.nickname}`
    );
  };

  const handleSaveScore = async () => {
    if (couple1Score === null || couple2Score === null) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateScore(match.id, couple1Score, couple2Score);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update match score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scores = getInitialScores();
  const status = getMatchStatus();
  const canEdit = editable && status !== 'completed';

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-base'>
          {t('match')} #{match.id} {getStatusBadge()}
        </CardTitle>
        {onDelete && (
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 text-destructive hover:bg-destructive/10'
            onClick={() => onDelete(match.id)}
            disabled={deleting}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-3'>
        {match.match_date && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
            <div className='flex items-center'>
              <CalendarDays className='mr-1 h-4 w-4' />
              {formatDate(new Date(match.match_date))}
            </div>
            <div className='flex items-center'>
              <Clock className='mr-1 h-4 w-4' />
              {formatTime(new Date(match.match_date))}
            </div>
          </div>
        )}

        <div className='mt-4 grid grid-cols-7 items-center gap-2'>
          <div className='col-span-3 text-sm font-medium'>
            {formatCoupleName(match.couple1)}
          </div>
          <div className='col-span-1 text-center'>vs</div>
          <div className='col-span-3 text-right text-sm font-medium'>
            {formatCoupleName(match.couple2)}
          </div>

          {isEditing ? (
            <>
              <div className='col-span-3'>
                <Input
                  type='number'
                  min='0'
                  value={couple1Score || ''}
                  onChange={(e) =>
                    setCouple1Score(parseInt(e.target.value) || 0)
                  }
                  className='text-center'
                />
              </div>
              <div className='col-span-1 text-center'>-</div>
              <div className='col-span-3'>
                <Input
                  type='number'
                  min='0'
                  value={couple2Score || ''}
                  onChange={(e) =>
                    setCouple2Score(parseInt(e.target.value) || 0)
                  }
                  className='text-center'
                />
              </div>
            </>
          ) : (
            <>
              <div className='col-span-3 text-center text-xl font-bold'>
                {scores.couple1 !== null ? scores.couple1 : '-'}
              </div>
              <div className='col-span-1 text-center'>-</div>
              <div className='col-span-3 text-center text-xl font-bold'>
                {scores.couple2 !== null ? scores.couple2 : '-'}
              </div>
            </>
          )}
        </div>

        {match.winner_couple_id && (
          <div className='mt-2 flex items-center justify-center text-sm font-medium text-green-600'>
            <Trophy className='mr-1 h-4 w-4' />
            {match.winner_couple_id === match.couple1_id
              ? t('winner', { couple: formatCoupleName(match.couple1) })
              : t('winner', { couple: formatCoupleName(match.couple2) })}
          </div>
        )}

        {status === 'completed' && !match.winner_couple_id && (
          <div className='mt-2 flex items-center justify-center text-sm font-medium text-amber-600'>
            <CircleAlert className='mr-1 h-4 w-4' />
            {t('draw')}
          </div>
        )}

        {canEdit && (
          <div className='mt-4 flex justify-end'>
            {isEditing ? (
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button
                  size='sm'
                  onClick={handleSaveScore}
                  disabled={
                    isSubmitting ||
                    couple1Score === null ||
                    couple2Score === null
                  }
                >
                  {isSubmitting ? t('saving') : t('saveScore')}
                </Button>
              </div>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsEditing(true)}
              >
                {scores.couple1 !== null && scores.couple2 !== null
                  ? t('updateScore')
                  : t('enterScore')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
