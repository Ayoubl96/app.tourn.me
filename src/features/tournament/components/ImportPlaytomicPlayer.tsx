import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Search, Import } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { PlaytomicPlayer } from '../api/types';
import { getInitials, formatPlayerLevel } from '../api/utils';
import {
  searchPlaytomicPlayers,
  importPlaytomicPlayer
} from '../api/tournamentApi';

interface ImportPlaytomicPlayerProps {
  onPlayerImported: (
    success: boolean,
    playerId?: number,
    errorMessage?: string
  ) => void;
  onCancel: () => void;
  t: any; // Translation function
  tournamentId: string; // Add tournamentId to pass to API functions
}

// Component for importing players from Playtomic
export function ImportPlaytomicPlayer({
  onPlayerImported,
  onCancel,
  t,
  tournamentId
}: ImportPlaytomicPlayerProps) {
  const callApi = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [playtomicPlayers, setPlaytomicPlayers] = useState<PlaytomicPlayer[]>(
    []
  );
  const [selectedPlayer, setSelectedPlayer] = useState<PlaytomicPlayer | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setIsSearching(true);
      setError(null);

      // Use the API function for searching Playtomic players
      const players = await searchPlaytomicPlayers(callApi, searchTerm);
      setPlaytomicPlayers(players);
    } catch (error) {
      console.error('Error searching Playtomic players:', error);
      setError(
        error instanceof Error ? error.message : t('failedToSearchPlaytomic')
      );
      toast.error(
        error instanceof Error ? error.message : t('failedToSearchPlaytomic')
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async () => {
    if (!selectedPlayer) return;

    try {
      setIsImporting(true);
      setError(null);

      // Convert gender string to integer (1 for male, 2 for female)
      const genderInt = selectedPlayer.gender.toUpperCase() === 'MALE' ? 1 : 2;

      // Use the API function to import player from Playtomic
      try {
        const newPlayer = await importPlaytomicPlayer(
          callApi,
          selectedPlayer.user_id,
          genderInt
        );

        // Success - player was imported
        toast.success(t('playerImported'));

        // Notify parent that the player was successfully imported
        onPlayerImported(true, newPlayer.id);
      } catch (importError) {
        // Specifically handle import errors
        const errorMessage =
          importError instanceof Error
            ? importError.message
            : t('failedToImportPlayer');

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error importing player:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('failedToImportPlayer');
      setError(errorMessage);
      toast.error(errorMessage);

      // Notify parent that the import failed
      onPlayerImported(false, undefined, errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  // Updated rendering to match player page style with picture and without gender
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
}
