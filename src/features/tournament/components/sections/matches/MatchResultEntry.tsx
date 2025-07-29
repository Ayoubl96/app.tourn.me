'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { useApi } from '@/hooks/useApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trophy, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateMatch } from '@/api/tournaments/api';

interface MatchResultEntryProps {
  match: StagingMatch;
  couple1Name: string;
  couple2Name: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<boolean>;
}

interface GameScore {
  game_number: number;
  couple1_score: number;
  couple2_score: number;
  winner_id: number | null;
  duration_minutes: number | null;
}

type MatchResultStatus = 'completed' | 'time_expired' | 'forfeited';

export const MatchResultEntry: React.FC<MatchResultEntryProps> = ({
  match,
  couple1Name,
  couple2Name,
  isOpen,
  onClose,
  onSave
}) => {
  const t = useTranslations('Dashboard');
  const callApi = useApi();

  // State
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [winnerCoupleId, setWinnerCoupleId] = useState<number | null>(
    match.winner_couple_id
  );
  const [resultStatus, setResultStatus] =
    useState<MatchResultStatus>('completed');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize game scores when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (match.games && match.games.length > 0) {
        // Load existing games
        const existingGames = match.games.map((game) => ({
          game_number: game.game_number,
          couple1_score: game.couple1_score,
          couple2_score: game.couple2_score,
          winner_id: game.winner_id,
          duration_minutes: game.duration_minutes
        }));
        setGameScores(existingGames);
      } else {
        // Default to 3 games
        setGameScores([
          {
            game_number: 1,
            couple1_score: 0,
            couple2_score: 0,
            winner_id: null,
            duration_minutes: null
          },
          {
            game_number: 2,
            couple1_score: 0,
            couple2_score: 0,
            winner_id: null,
            duration_minutes: null
          },
          {
            game_number: 3,
            couple1_score: 0,
            couple2_score: 0,
            winner_id: null,
            duration_minutes: null
          }
        ]);
      }
      setWinnerCoupleId(match.winner_couple_id);
      setError(null);
    }
  }, [isOpen, match]);

  // Update game score
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

        // Determine game winner
        if (updatedGame.couple1_score > updatedGame.couple2_score) {
          updatedGame.winner_id = match.couple1_id;
        } else if (updatedGame.couple2_score > updatedGame.couple1_score) {
          updatedGame.winner_id = match.couple2_id;
        } else {
          updatedGame.winner_id = null;
        }

        return updatedGame;
      }
      return game;
    });

    setGameScores(updatedScores);

    // Calculate overall match winner
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

  // Add new game
  const addGame = () => {
    const newGameNumber = gameScores.length + 1;
    setGameScores([
      ...gameScores,
      {
        game_number: newGameNumber,
        couple1_score: 0,
        couple2_score: 0,
        winner_id: null,
        duration_minutes: null
      }
    ]);
  };

  // Remove game
  const removeGame = (gameNumber: number) => {
    if (gameScores.length <= 1) return;

    const updatedScores = gameScores
      .filter((game) => game.game_number !== gameNumber)
      .map((game, index) => ({
        ...game,
        game_number: index + 1,
        duration_minutes: game.duration_minutes
      }));

    setGameScores(updatedScores);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    setIsSaving(true);

    try {
      // For non-completed matches, require a winner
      if (resultStatus !== 'completed' && winnerCoupleId === null) {
        setError(
          t('pleaseSelectWinner', { defaultValue: 'Please select a winner' })
        );
        return;
      }

      const matchData = {
        games: gameScores,
        winner_couple_id: winnerCoupleId,
        match_result_status: resultStatus
      };

      await updateMatch(callApi, match.id, matchData);

      toast.success(
        t('matchResultSaved', {
          defaultValue: 'Match result saved successfully'
        })
      );

      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving match result:', error);
      setError(
        t('failedToSaveResult', {
          defaultValue: 'Failed to save match result. Please try again.'
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            {t('enterMatchResult', { defaultValue: 'Enter Match Result' })}
          </DialogTitle>
          <DialogDescription>
            {couple1Name} vs {couple2Name}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Match Status Selection */}
          <div className='space-y-2'>
            <Label>{t('matchStatus', { defaultValue: 'Match Status' })}</Label>
            <Select
              value={resultStatus}
              onValueChange={(value) =>
                setResultStatus(value as MatchResultStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='completed'>
                  {t('completed', { defaultValue: 'Completed' })}
                </SelectItem>
                <SelectItem value='time_expired'>
                  {t('timeExpired', { defaultValue: 'Time Expired' })}
                </SelectItem>
                <SelectItem value='forfeited'>
                  {t('forfeited', { defaultValue: 'Forfeited' })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Winner Selection for non-completed matches */}
          {resultStatus !== 'completed' && (
            <div className='space-y-2'>
              <Label>{t('winner', { defaultValue: 'Winner' })}</Label>
              <Select
                value={winnerCoupleId?.toString() || ''}
                onValueChange={(value) => setWinnerCoupleId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('selectWinner', {
                      defaultValue: 'Select winner'
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={match.couple1_id.toString()}>
                    {couple1Name}
                  </SelectItem>
                  <SelectItem value={match.couple2_id.toString()}>
                    {couple2Name}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Game Scores */}
          {resultStatus === 'completed' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label>
                  {t('gameScores', { defaultValue: 'Game Scores' })}
                </Label>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    onClick={addGame}
                    size='sm'
                    variant='outline'
                  >
                    <Plus className='h-3 w-3' />
                  </Button>
                  {gameScores.length > 1 && (
                    <Button
                      type='button'
                      onClick={() => removeGame(gameScores.length)}
                      size='sm'
                      variant='outline'
                    >
                      <Minus className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              </div>

              <div className='space-y-3'>
                {gameScores.map((game) => (
                  <Card key={game.game_number}>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm'>
                        {t('game', { defaultValue: 'Game' })} {game.game_number}
                        {game.winner_id && (
                          <Badge variant='secondary' className='ml-2'>
                            {game.winner_id === match.couple1_id
                              ? couple1Name
                              : couple2Name}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label className='text-xs'>{couple1Name}</Label>
                          <Input
                            type='number'
                            min='0'
                            value={game.couple1_score}
                            onChange={(e) =>
                              updateGameScore(
                                game.game_number,
                                'couple1',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className='text-center'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label className='text-xs'>{couple2Name}</Label>
                          <Input
                            type='number'
                            min='0'
                            value={game.couple2_score}
                            onChange={(e) =>
                              updateGameScore(
                                game.game_number,
                                'couple2',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className='text-center'
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Overall Winner Display */}
              {winnerCoupleId && resultStatus === 'completed' && (
                <div className='flex items-center justify-center rounded-lg bg-muted p-4'>
                  <div className='flex items-center gap-2'>
                    <Trophy className='h-4 w-4 text-yellow-600' />
                    <span className='font-medium'>
                      {t('winner', { defaultValue: 'Winner' })}:{' '}
                      {winnerCoupleId === match.couple1_id
                        ? couple1Name
                        : couple2Name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Save className='mr-2 h-4 w-4' />
            )}
            {t('saveResult', { defaultValue: 'Save Result' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
