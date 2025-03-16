import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { createCouple, updateCouple } from '../api/tournamentApi';
import { TournamentPlayer, Couple } from '../api/types';
import { getInitials, formatPlayerLevel } from '../api/utils';

interface CoupleFormProps {
  tournamentId: string;
  tournamentPlayers: TournamentPlayer[];
  couples: Couple[];
  existingCouple?: Couple;
  onComplete: (couple: Couple) => void;
  onCancel: () => void;
  t: any; // Translation function
}

export function CoupleForm({
  tournamentId,
  tournamentPlayers,
  couples,
  existingCouple,
  onComplete,
  onCancel,
  t
}: CoupleFormProps) {
  const callApi = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    firstPlayerId: '',
    secondPlayerId: ''
  });

  // Initialize form with existing couple data if editing
  useEffect(() => {
    if (existingCouple) {
      setFormData({
        name: existingCouple.name,
        firstPlayerId: existingCouple.first_player_id.toString(),
        secondPlayerId: existingCouple.second_player_id.toString()
      });
    }
  }, [existingCouple]);

  // Get available players, excluding players already in couples
  // and excluding the selected first player when selecting second player
  const getAvailablePlayers = (forSecondPlayer: boolean = false) => {
    return tournamentPlayers.filter((tp) => {
      // If this is for the second player selection and we have a first player selected,
      // exclude the first player from options
      if (
        forSecondPlayer &&
        formData.firstPlayerId &&
        tp.player_id.toString() === formData.firstPlayerId
      ) {
        return false;
      }

      // If editing an existing couple, allow the currently selected players
      if (existingCouple) {
        if (
          tp.player_id === existingCouple.first_player_id ||
          tp.player_id === existingCouple.second_player_id
        ) {
          return true;
        }
      }

      // Find existing couples that include this player
      const playerInExistingCouple = couples.some(
        (couple) =>
          couple.first_player_id === tp.player_id ||
          couple.second_player_id === tp.player_id
      );

      // If editing, players in the current couple should still be available
      if (existingCouple && playerInExistingCouple) {
        return (
          existingCouple.first_player_id === tp.player_id ||
          existingCouple.second_player_id === tp.player_id
        );
      }

      // Player is available if they're not in any couple
      return !playerInExistingCouple;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.firstPlayerId || !formData.secondPlayerId) {
      setError(t('selectBothPlayers'));
      return;
    }

    if (formData.firstPlayerId === formData.secondPlayerId) {
      setError(t('playersCannotBeSame'));
      return;
    }

    // If name is empty, auto-generate from player nicknames
    let coupleName = formData.name.trim();
    if (!coupleName) {
      const firstPlayer = tournamentPlayers.find(
        (tp) => tp.player_id.toString() === formData.firstPlayerId
      );
      const secondPlayer = tournamentPlayers.find(
        (tp) => tp.player_id.toString() === formData.secondPlayerId
      );

      if (firstPlayer && secondPlayer) {
        coupleName = `${firstPlayer.player.nickname} / ${secondPlayer.player.nickname}`;
      } else {
        coupleName = t('newCouple');
      }
    }

    try {
      setIsLoading(true);
      let result;

      // Convert IDs to numbers
      const firstPlayerId = parseInt(formData.firstPlayerId);
      const secondPlayerId = parseInt(formData.secondPlayerId);

      if (existingCouple) {
        // Update existing couple
        result = await updateCouple(
          callApi,
          tournamentId,
          existingCouple.id,
          firstPlayerId,
          secondPlayerId,
          coupleName
        );
        toast.success(t('coupleUpdated'));
      } else {
        // Create new couple
        result = await createCouple(
          callApi,
          tournamentId,
          firstPlayerId,
          secondPlayerId,
          coupleName
        );
        toast.success(t('coupleCreated'));
      }

      onComplete(result);
    } catch (err) {
      console.error('Error saving couple:', err);
      setError(err instanceof Error ? err.message : t('failedToSaveCouple'));
    } finally {
      setIsLoading(false);
    }
  };

  const availableFirstPlayers = getAvailablePlayers();
  const availableSecondPlayers = getAvailablePlayers(true);

  // Generate debug info
  console.log(`Total tournament players: ${tournamentPlayers.length}`);
  console.log(`Available for first player: ${availableFirstPlayers.length}`);
  console.log(`Available for second player: ${availableSecondPlayers.length}`);
  console.log(`Total couples: ${couples.length}`);
  console.log(
    'Players filtered out due to couples:',
    tournamentPlayers
      .filter((tp) =>
        couples.some(
          (c) =>
            c.first_player_id === tp.player_id ||
            c.second_player_id === tp.player_id
        )
      )
      .map((tp) => tp.player.nickname)
  );

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Display player count information */}
      <div className='mb-4 text-sm text-muted-foreground'>
        <p>
          {t('availablePlayers')}: {availableFirstPlayers.length} /{' '}
          {tournamentPlayers.length}
        </p>
        {tournamentPlayers.length > 0 && availableFirstPlayers.length === 0 && (
          <p className='mt-1 text-xs text-amber-500'>
            {t('allPlayersInCouples')}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='firstPlayerId'>{t('firstPlayer')} *</Label>
        <Select
          value={formData.firstPlayerId}
          onValueChange={(value) => handleSelectChange('firstPlayerId', value)}
          disabled={isLoading}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('selectPlayer')} />
          </SelectTrigger>
          <SelectContent>
            {availableFirstPlayers.length === 0 ? (
              <SelectItem value='no_players' disabled>
                {t('noAvailablePlayers')}
              </SelectItem>
            ) : (
              availableFirstPlayers.map((tp) => (
                <SelectItem key={tp.player_id} value={tp.player_id.toString()}>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-6 w-6'>
                      <AvatarImage
                        src={tp.player.picture || ''}
                        alt={tp.player.nickname}
                      />
                      <AvatarFallback>
                        {getInitials(tp.player.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{tp.player.nickname}</span>
                    {tp.player.level && (
                      <span className='text-xs text-muted-foreground'>
                        ({formatPlayerLevel(tp.player.level)})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='secondPlayerId'>{t('secondPlayer')} *</Label>
        <Select
          value={formData.secondPlayerId}
          onValueChange={(value) => handleSelectChange('secondPlayerId', value)}
          disabled={isLoading || !formData.firstPlayerId}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('selectPlayer')} />
          </SelectTrigger>
          <SelectContent>
            {!formData.firstPlayerId ? (
              <SelectItem value='select_first' disabled>
                {t('selectFirstPlayerFirst')}
              </SelectItem>
            ) : availableSecondPlayers.length === 0 ? (
              <SelectItem value='no_players' disabled>
                {t('noAvailablePlayers')}
              </SelectItem>
            ) : (
              availableSecondPlayers.map((tp) => (
                <SelectItem key={tp.player_id} value={tp.player_id.toString()}>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-6 w-6'>
                      <AvatarImage
                        src={tp.player.picture || ''}
                        alt={tp.player.nickname}
                      />
                      <AvatarFallback>
                        {getInitials(tp.player.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{tp.player.nickname}</span>
                    {tp.player.level && (
                      <span className='text-xs text-muted-foreground'>
                        ({formatPlayerLevel(tp.player.level)})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='name'>
          {t('coupleName')} ({t('optional')})
        </Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t('enterCoupleName')}
          disabled={isLoading}
        />
        <p className='text-xs text-muted-foreground'>{t('coupleNameHint')}</p>
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('cancel')}
        </Button>
        <Button
          type='submit'
          disabled={
            isLoading || !formData.firstPlayerId || !formData.secondPlayerId
          }
        >
          {isLoading
            ? existingCouple
              ? t('updating')
              : t('creating')
            : existingCouple
              ? t('updateCouple')
              : t('createCouple')}
        </Button>
      </div>
    </form>
  );
}
