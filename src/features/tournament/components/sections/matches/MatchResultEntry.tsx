'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Trophy, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

interface MatchResultEntryProps {
  match: StagingMatch;
  isOpen: boolean;
  onClose: () => void;
  onSave: (matchId: number, scores: MatchScores) => Promise<boolean>;
  couple1Name: string;
  couple2Name: string;
}

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

export function MatchResultEntry({
  match,
  isOpen,
  onClose,
  onSave,
  couple1Name,
  couple2Name
}: MatchResultEntryProps) {
  const t = useTranslations('Dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [resultStatus, setResultStatus] = useState<
    'completed' | 'time_expired' | 'forfeited'
  >(
    match.match_result_status === 'completed' ||
      match.match_result_status === 'time_expired' ||
      match.match_result_status === 'forfeited'
      ? match.match_result_status
      : 'completed'
  );
  const [winnerCoupleId, setWinnerCoupleId] = useState<number | null>(
    match.winner_couple_id
  );
  const [error, setError] = useState<string | null>(null);

  // Initialize with existing games or default games based on match configuration
  const [gameScores, setGameScores] = useState<GameScore[]>(() => {
    // If the match already has games with scores
    if (match.games && match.games.length > 0) {
      return match.games.map((game) => ({
        game_number: game.game_number,
        couple1_score: game.couple1_score,
        couple2_score: game.couple2_score,
        winner_id: game.winner_id,
        // Convert null to undefined for duration_minutes to match the GameScore type
        duration_minutes: game.duration_minutes || undefined
      }));
    }

    // Otherwise, create default game objects based on the stage configuration
    const gamesCount = 3; // Default to 3 if not specified
    return Array.from({ length: gamesCount }, (_, i) => ({
      game_number: i + 1,
      couple1_score: 0,
      couple2_score: 0,
      winner_id: null
    }));
  });

  // Update a specific game score
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

        // Automatically set the winner based on scores
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

    // Determine match winner based on game wins
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

  // Update game duration
  const updateGameDuration = (gameNumber: number, duration: number) => {
    setGameScores(
      gameScores.map((game) =>
        game.game_number === gameNumber
          ? {
              ...game,
              duration_minutes: Math.max(0, parseInt(duration.toString()) || 0)
            }
          : game
      )
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);

    // Only require a winner for non-completed matches (time expired, forfeited)
    if (resultStatus !== 'completed' && winnerCoupleId === null) {
      setError(
        t('noWinnerSelected', { defaultValue: 'Please select a winner' })
      );
      return;
    }

    // For completed matches, draws are allowed (winnerCoupleId can be null)
    // Individual games can be tied (e.g., 5-5), and the match winner is determined
    // by the number of games won by each team - but if equal, it's a draw

    setIsSaving(true);

    try {
      const scores: MatchScores = {
        games: gameScores,
        winner_couple_id: winnerCoupleId,
        match_result_status: resultStatus
      };

      const success = await onSave(match.id, scores);

      if (success) {
        toast.success(
          t('resultSaved', { defaultValue: 'Match result saved successfully' })
        );
        onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {t('enterMatchResult', { defaultValue: 'Enter Match Result' })}
          </DialogTitle>
          <DialogDescription>
            {t('enterMatchResultDescription', {
              defaultValue:
                'Enter the score for each game and determine the match winner'
            })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Match Info */}
          <div className='flex items-center justify-between rounded-md bg-muted/50 p-3'>
            <div className='flex-1 text-center'>
              <p className='font-semibold'>{couple1Name}</p>
            </div>
            <div className='px-4 text-center'>
              {t('vs', { defaultValue: 'vs' })}
            </div>
            <div className='flex-1 text-center'>
              <p className='font-semibold'>{couple2Name}</p>
            </div>
          </div>

          {/* Result type selection */}
          <div>
            <Label className='mb-2 block'>
              {t('resultType', { defaultValue: 'Result Type' })}
            </Label>
            <RadioGroup
              value={resultStatus}
              onValueChange={(value) => setResultStatus(value as any)}
              className='flex flex-wrap gap-4'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='completed' id='completed' />
                <Label htmlFor='completed'>
                  {t('normalCompletion', { defaultValue: 'Normal Completion' })}
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='time_expired' id='time_expired' />
                <Label htmlFor='time_expired'>
                  {t('timeExpired', { defaultValue: 'Time Expired' })}
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='forfeited' id='forfeited' />
                <Label htmlFor='forfeited'>
                  {t('forfeited', { defaultValue: 'Forfeited' })}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Game Scores */}
          {resultStatus === 'completed' && (
            <div className='space-y-4'>
              <h3 className='text-md font-medium'>
                {t('gameScores', { defaultValue: 'Game Scores' })}
              </h3>
              <Separator />

              {gameScores.map((game) => (
                <div
                  key={game.game_number}
                  className='grid grid-cols-9 items-center gap-4'
                >
                  <div className='col-span-1'>
                    <Label>
                      {t('game')} {game.game_number}
                    </Label>
                  </div>

                  <div className='col-span-3'>
                    <div className='flex flex-col gap-1'>
                      <Label htmlFor={`game-${game.game_number}-couple1`}>
                        {couple1Name}
                      </Label>
                      <Input
                        id={`game-${game.game_number}-couple1`}
                        type='number'
                        min='0'
                        value={game.couple1_score}
                        onChange={(e) =>
                          updateGameScore(
                            game.game_number,
                            'couple1',
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className='col-span-1 flex items-center justify-center'>
                    <span className='text-lg font-medium'>
                      {t('vs', { defaultValue: 'vs' })}
                    </span>
                  </div>

                  <div className='col-span-3'>
                    <div className='flex flex-col gap-1'>
                      <Label htmlFor={`game-${game.game_number}-couple2`}>
                        {couple2Name}
                      </Label>
                      <Input
                        id={`game-${game.game_number}-couple2`}
                        type='number'
                        min='0'
                        value={game.couple2_score}
                        onChange={(e) =>
                          updateGameScore(
                            game.game_number,
                            'couple2',
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className='col-span-1'>
                    <div className='flex flex-col gap-1'>
                      <Label htmlFor={`game-${game.game_number}-duration`}>
                        {t('duration')}
                      </Label>
                      <Input
                        id={`game-${game.game_number}-duration`}
                        type='number'
                        min='0'
                        placeholder='min'
                        value={game.duration_minutes || ''}
                        onChange={(e) =>
                          updateGameDuration(
                            game.game_number,
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Winner Selection for non-normal completion */}
          {resultStatus !== 'completed' && (
            <div>
              <Label className='mb-2 block'>
                {t('matchWinner', { defaultValue: 'Match Winner' })}
              </Label>
              <RadioGroup
                value={winnerCoupleId?.toString() || ''}
                onValueChange={(value) =>
                  setWinnerCoupleId(value ? parseInt(value) : null)
                }
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={match.couple1_id.toString()}
                    id='couple1'
                  />
                  <Label htmlFor='couple1'>{couple1Name}</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={match.couple2_id.toString()}
                    id='couple2'
                  />
                  <Label htmlFor='couple2'>{couple2Name}</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Match Summary */}
          {resultStatus === 'completed' && (
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle>
                  {t('matchSummary', { defaultValue: 'Match Summary' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('couple1Wins', { defaultValue: 'Games Won' })}
                    </p>
                    <p className='text-2xl font-semibold'>
                      {
                        gameScores.filter(
                          (g) => g.winner_id === match.couple1_id
                        ).length
                      }
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-muted-foreground'>
                      {t('winner', { defaultValue: 'Winner' })}
                    </p>
                    <p className='text-lg font-semibold'>
                      {winnerCoupleId === match.couple1_id
                        ? couple1Name
                        : winnerCoupleId === match.couple2_id
                          ? couple2Name
                          : 'Draw'}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>
                      {t('couple2Wins', { defaultValue: 'Games Won' })}
                    </p>
                    <p className='text-2xl font-semibold'>
                      {
                        gameScores.filter(
                          (g) => g.winner_id === match.couple2_id
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error display */}
          {error && (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>{t('error', { defaultValue: 'Error' })}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('cancel', { namespace: 'Common' })}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
