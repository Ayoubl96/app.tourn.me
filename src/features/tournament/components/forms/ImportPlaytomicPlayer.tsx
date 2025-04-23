import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlaytomicPlayer } from '../../types';
import { formatPlayerLevel, getInitials } from '../../utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Import, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface ImportPlaytomicPlayerProps {
  onPlayerImported: (playerId: number) => void;
  onCancel: () => void;
  onSearch: (searchTerm: string) => Promise<void>;
  onImport: (
    player: PlaytomicPlayer
  ) => Promise<{ success: boolean; needsGender?: boolean; playerId?: number }>;
  onImportWithGender: (
    player: PlaytomicPlayer,
    gender: number
  ) => Promise<boolean>;
  playtomicPlayers: PlaytomicPlayer[];
  isSearching: boolean;
  isImporting: boolean;
  selectedPlayer: PlaytomicPlayer | null;
  setSelectedPlayer: (player: PlaytomicPlayer | null) => void;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const ImportPlaytomicPlayer: React.FC<ImportPlaytomicPlayerProps> = ({
  onPlayerImported,
  onCancel,
  onSearch,
  onImport,
  onImportWithGender,
  playtomicPlayers,
  isSearching,
  isImporting,
  selectedPlayer,
  setSelectedPlayer,
  error,
  searchTerm,
  setSearchTerm
}) => {
  const t = useTranslations('Dashboard');
  const [needsGenderInput, setNeedsGenderInput] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string>('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    await onSearch(searchTerm);
  };

  const handleImport = async () => {
    if (!selectedPlayer) return;

    try {
      // Reset gender input state
      setNeedsGenderInput(false);

      // Try to import the player
      const result = await onImport(selectedPlayer);

      // Handle the case where we need gender input
      if (result.needsGender) {
        setNeedsGenderInput(true);
        return;
      }
      // Handle successful import
      if (result.success && result.playerId) {
        onPlayerImported(result.playerId);
      }
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  const handleImportWithGender = async () => {
    // Check each condition separately to better identify the issue
    if (!selectedPlayer) {
      return;
    }

    if (!selectedGender) {
      return;
    }

    if (!onImportWithGender) {
      return;
    }

    try {
      const gender = parseInt(selectedGender, 10);
      const success = await onImportWithGender(selectedPlayer, gender);

      if (success) {
        setNeedsGenderInput(false);
        onPlayerImported(0); // The actual ID will be handled in the parent
      }
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  // Render gender selection form when needed
  if (needsGenderInput && selectedPlayer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('selectGender')}</CardTitle>
          <CardDescription>
            {t('genderMissingForPlayer', {
              player: selectedPlayer.full_name,
              fallback: `Gender is missing for ${selectedPlayer.full_name}. Please select a gender.`
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <RadioGroup
              value={selectedGender}
              onValueChange={(value) => {
                setSelectedGender(value);
              }}
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='1' id='male' />
                <Label htmlFor='male'>{t('male', { fallback: 'Male' })}</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='2' id='female' />
                <Label htmlFor='female'>
                  {t('female', { fallback: 'Female' })}
                </Label>
              </div>
            </RadioGroup>

            <div className='flex justify-end space-x-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setNeedsGenderInput(false)}
                size='sm'
              >
                {t('back')}
              </Button>
              <Button
                type='button'
                onClick={handleImportWithGender}
                disabled={isImporting || !selectedGender}
                size='sm'
              >
                {isImporting ? t('importing') : t('confirmImport')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='mr-2 h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className='flex space-x-2'>
        <Input
          placeholder={t('searchPlaytomicPlayers')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
          type='button'
        >
          {isSearching ? (
            <span className='mr-2 animate-spin'>⟳</span>
          ) : (
            <Search className='mr-2 h-4 w-4' />
          )}
          {t('search')}
        </Button>
      </div>

      {playtomicPlayers.length === 0 && !isSearching ? (
        <div className='py-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            {t('searchPlaytomicPlayersPrompt')}
          </p>
        </div>
      ) : isSearching ? (
        <div className='space-y-2'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      ) : (
        <div className='rounded-md border'>
          <ScrollArea className='h-96' type='always'>
            <div className='space-y-1 p-1'>
              {playtomicPlayers.map((player) => (
                <div
                  key={player.user_id}
                  className={`cursor-pointer rounded-md p-2 hover:bg-accent ${selectedPlayer?.user_id === player.user_id ? 'bg-accent' : ''}`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Avatar className='mr-2 h-8 w-8'>
                        <AvatarImage
                          src={player.picture}
                          alt={player.full_name}
                        />
                        <AvatarFallback>
                          {getInitials(player.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-sm font-medium'>
                          {player.full_name}
                        </p>
                        {player.additional_data &&
                          player.additional_data.length > 0 && (
                            <p className='text-xs text-muted-foreground'>
                              {t('level')}:{' '}
                              {player.additional_data[0].level_value}
                            </p>
                          )}
                      </div>
                    </div>
                    {selectedPlayer?.user_id === player.user_id && (
                      <Badge variant='outline' className='text-xs'>
                        {t('selected')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className='flex justify-end space-x-2 pt-2'>
        <Button type='button' variant='outline' onClick={onCancel} size='sm'>
          {t('cancel')}
        </Button>
        <Button
          type='button'
          onClick={handleImport}
          disabled={isImporting || !selectedPlayer}
          size='sm'
        >
          {isImporting ? (
            t('importing')
          ) : (
            <>
              <Import className='mr-2 h-4 w-4' />
              {t('importPlayer')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
