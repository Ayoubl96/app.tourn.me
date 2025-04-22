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

interface ImportPlaytomicPlayerProps {
  onPlayerImported: (playerId: number) => void;
  onCancel: () => void;
  onSearch: (searchTerm: string) => Promise<void>;
  onImport: (player: PlaytomicPlayer) => Promise<void>;
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    await onSearch(searchTerm);
  };

  const handleImport = async () => {
    if (!selectedPlayer) return;
    try {
      await onImport(selectedPlayer);
      onPlayerImported(0); // The actual ID will be handled in the parent component
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

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
        <div className='overflow-hidden rounded-md border'>
          <ScrollArea className='max-h-40'>
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
                              {formatPlayerLevel(
                                player.additional_data[0].level_value
                              )}
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
