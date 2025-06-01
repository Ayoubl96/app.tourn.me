'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Trophy, AlertTriangle, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GameScore {
  game_number: number;
  couple1_score: number;
  couple2_score: number;
  winner_id: number | null;
  duration_minutes?: number;
}

interface MatchScores {
  games: GameScore[];
  winner_couple_id: number | null;
  match_result_status: 'completed' | 'time_expired' | 'forfeited';
}

interface InlineMatchResultEntryProps {
  match: StagingMatch;
  couple1Name: string;
  couple2Name: string;
  onSave: (matchId: number, scores: MatchScores) => Promise<boolean>;
  onCancel: () => void;
}

export function InlineMatchResultEntry({
  match,
  couple1Name,
  couple2Name,
  onSave,
  onCancel
}: InlineMatchResultEntryProps) {
  const t = useTranslations('Dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with existing games or a single default set
  const [gameScores, setGameScores] = useState<GameScore[]>(() => {
    if (match.games && match.games.length > 0) {
      return match.games.map((game) => ({
        game_number: game.game_number,
        couple1_score: game.couple1_score,
        couple2_score: game.couple2_score,
        winner_id: game.winner_id,
        duration_minutes: game.duration_minutes || undefined
      }));
    }

    // Start with one set
    return [
      {
        game_number: 1,
        couple1_score: 0,
        couple2_score: 0,
        winner_id: null
      }
    ];
  });

  // Calculate overall winner based on sets won
  const [winnerCoupleId, setWinnerCoupleId] = useState<number | null>(
    match.winner_couple_id
  );

  // Update a specific set score
  const updateGameScore = (
    gameNumber: number,
    team: 'couple1' | 'couple2',
    score: number
  ) => {
    const updatedScores = gameScores.map((game) => {
      if (game.game_number === gameNumber) {
        const updatedGame = {
          ...game,
          [`${team}_score`]: Math.max(0, parseInt(score.toString()) || 0)
        };

        // Automatically set set winner based on scores
        if (updatedGame.couple1_score > updatedGame.couple2_score) {
          updatedGame.winner_id = match.couple1_id;
        } else if (updatedGame.couple2_score > updatedGame.couple1_score) {
          updatedGame.winner_id = match.couple2_id;
        } else {
          updatedGame.winner_id = null; // Tie
        }

        return updatedGame;
      }
      return game;
    });

    setGameScores(updatedScores);

    // Determine match winner based on sets won
    const couple1Wins = updatedScores.filter(
      (g) => g.winner_id === match.couple1_id
    ).length;
    const couple2Wins = updatedScores.filter(
      (g) => g.winner_id === match.couple2_id
    ).length;

    if (couple1Wins > couple2Wins) {
      setWinnerCoupleId(match.couple1_id);
    } else if (couple2Wins > couple1Wins) {
      setWinnerCoupleId(match.couple2_id);
    } else {
      setWinnerCoupleId(null);
    }
  };

  // Add a new set
  const addNewSet = () => {
    const newSetNumber = gameScores.length + 1;
    setGameScores([
      ...gameScores,
      {
        game_number: newSetNumber,
        couple1_score: 0,
        couple2_score: 0,
        winner_id: null
      }
    ]);
  };

  // Remove a set
  const removeSet = (gameNumber: number) => {
    if (gameScores.length <= 1) return; // Don't allow removing the last set

    const updatedScores = gameScores
      .filter((game) => game.game_number !== gameNumber)
      .map((game, index) => ({
        ...game,
        game_number: index + 1
      }));

    setGameScores(updatedScores);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);

    // Validate that we have valid scores
    const invalidScores = gameScores.some(
      (game) =>
        game.couple1_score === game.couple2_score || game.winner_id === null
    );

    if (invalidScores) {
      setError(
        t('invalidScores', {
          defaultValue:
            'Set scores cannot be tied. Please ensure scores are valid.'
        })
      );
      return;
    }

    if (winnerCoupleId === null) {
      setError(
        t('noWinnerSelected', { defaultValue: 'Please select a winner' })
      );
      return;
    }

    setIsSaving(true);

    try {
      const scores: MatchScores = {
        games: gameScores,
        winner_couple_id: winnerCoupleId,
        match_result_status: 'completed'
      };

      const success = await onSave(match.id, scores);

      if (success) {
        toast.success(
          t('resultSaved', { defaultValue: 'Match result saved successfully' })
        );
        onCancel(); // Close the inline editor
      }
    } catch (error) {
      console.error('Error saving match result:', error);
      setError(
        typeof error === 'string'
          ? error
          : t('savingError', {
              defaultValue: 'An error occurred while saving the match result'
            })
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate sets won for display
  const couple1SetsWon = gameScores.filter(
    (g) => g.winner_id === match.couple1_id
  ).length;
  const couple2SetsWon = gameScores.filter(
    (g) => g.winner_id === match.couple2_id
  ).length;

  return (
    <Card className='mt-4 border-2 border-primary/20 bg-muted/30'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-lg'>
          <span className='flex items-center'>
            <Trophy className='mr-2 h-5 w-5' />
            {t('enterMatchResult', { defaultValue: 'Enter Match Result' })}
          </span>
          <Button variant='ghost' size='sm' onClick={onCancel}>
            <X className='h-4 w-4' />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Match Summary */}
        <div className='flex items-center justify-between rounded-md bg-background/60 p-3'>
          <div className='flex-1 text-center'>
            <p className='font-semibold'>{couple1Name}</p>
            <p className='text-sm text-muted-foreground'>
              {couple1SetsWon}{' '}
              {couple1SetsWon === 1
                ? t('set', { defaultValue: 'set' }).toLowerCase()
                : t('sets', { defaultValue: 'sets' }).toLowerCase()}
            </p>
          </div>
          <div className='px-4 text-center'>
            <span className='text-lg font-medium'>
              {t('vs', { defaultValue: 'vs' })}
            </span>
          </div>
          <div className='flex-1 text-center'>
            <p className='font-semibold'>{couple2Name}</p>
            <p className='text-sm text-muted-foreground'>
              {couple2SetsWon}{' '}
              {couple2SetsWon === 1
                ? t('set', { defaultValue: 'set' }).toLowerCase()
                : t('sets', { defaultValue: 'sets' }).toLowerCase()}
            </p>
          </div>
        </div>

        {/* Sets Entry */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-base font-medium'>
              {t('setScores', { defaultValue: 'Set Scores' })}
            </Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addNewSet}
              className='flex items-center gap-1'
            >
              <Plus className='h-4 w-4' />
              {t('addSet', { defaultValue: 'Add Set' })}
            </Button>
          </div>

          {gameScores.map((game) => (
            <div
              key={game.game_number}
              className='grid grid-cols-7 items-center gap-3 rounded-md bg-background/60 p-3'
            >
              <div className='col-span-1'>
                <Label className='text-sm font-medium'>
                  {t('set', { defaultValue: 'Set' })} {game.game_number}
                </Label>
              </div>

              <div className='col-span-2'>
                <Input
                  type='number'
                  min='0'
                  placeholder='0'
                  value={game.couple1_score}
                  onChange={(e) =>
                    updateGameScore(
                      game.game_number,
                      'couple1',
                      parseInt(e.target.value)
                    )
                  }
                  className='text-center'
                />
              </div>

              <div className='col-span-1 flex items-center justify-center'>
                <span className='text-sm font-medium'>-</span>
              </div>

              <div className='col-span-2'>
                <Input
                  type='number'
                  min='0'
                  placeholder='0'
                  value={game.couple2_score}
                  onChange={(e) =>
                    updateGameScore(
                      game.game_number,
                      'couple2',
                      parseInt(e.target.value)
                    )
                  }
                  className='text-center'
                />
              </div>

              <div className='col-span-1 flex justify-end'>
                {gameScores.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeSet(game.game_number)}
                    className='h-8 w-8 p-1'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Winner Display */}
        {winnerCoupleId && (
          <div className='flex items-center justify-center rounded bg-green-50 p-3 text-sm font-medium text-green-600 dark:bg-green-950/20 dark:text-green-400'>
            <Trophy className='mr-2 h-4 w-4' />
            {t('winner', { defaultValue: 'Winner' })}:{' '}
            {winnerCoupleId === match.couple1_id ? couple1Name : couple2Name}
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>{t('error', { defaultValue: 'Error' })}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className='flex gap-2 pt-2'>
          <Button onClick={handleSubmit} disabled={isSaving} className='flex-1'>
            {isSaving ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('saving', { defaultValue: 'Saving...' })}
              </>
            ) : (
              <>
                <Trophy className='mr-2 h-4 w-4' />
                {t('saveResult', { defaultValue: 'Save Result' })}
              </>
            )}
          </Button>
          <Button variant='outline' onClick={onCancel}>
            {t('cancel', { namespace: 'Common' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
