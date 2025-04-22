import React from 'react';
import { useTranslations } from 'next-intl';
import { Player } from '../../../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { getInitials } from '../../../utils/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DropdownSelectionProps {
  availablePlayers: Player[];
  selectedPlayers: Player[];
  handleSelectPlayer: (player: Player) => void;
  handleRemovePlayer: (playerId: number) => void;
  isLoading: boolean;
}

/**
 * Dropdown-based player selection component
 * Allows selecting players from dropdowns for each position
 */
export function DropdownSelection({
  availablePlayers,
  selectedPlayers,
  handleSelectPlayer,
  handleRemovePlayer,
  isLoading
}: DropdownSelectionProps) {
  const t = useTranslations('Dashboard');

  // Filter out already selected players for dropdown options
  const availableForSelection = availablePlayers.filter(
    (player) => !selectedPlayers.some((p) => p.id === player.id)
  );

  return (
    <div className='space-y-4'>
      {/* Player 1 Selection */}
      <div className='flex items-center gap-2'>
        <div className='flex-1'>
          <Select
            disabled={isLoading}
            value={selectedPlayers[0]?.id.toString() || ''}
            onValueChange={(value) => {
              const player = availablePlayers.find(
                (p) => p.id.toString() === value
              );
              if (player) handleSelectPlayer(player);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select first player' />
            </SelectTrigger>
            <SelectContent>
              {availableForSelection.map((player) => (
                <SelectItem key={player.id} value={player.id.toString()}>
                  {player.nickname}
                </SelectItem>
              ))}
              {selectedPlayers[0] && (
                <SelectItem value={selectedPlayers[0].id.toString()}>
                  {selectedPlayers[0].nickname}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        {selectedPlayers[0] && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => handleRemovePlayer(selectedPlayers[0].id)}
            disabled={isLoading}
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Player 2 Selection */}
      <div className='flex items-center gap-2'>
        <div className='flex-1'>
          <Select
            disabled={isLoading || !selectedPlayers[0]}
            value={selectedPlayers[1]?.id.toString() || ''}
            onValueChange={(value) => {
              const player = availablePlayers.find(
                (p) => p.id.toString() === value
              );
              if (player) handleSelectPlayer(player);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select second player' />
            </SelectTrigger>
            <SelectContent>
              {availableForSelection.map((player) => (
                <SelectItem key={player.id} value={player.id.toString()}>
                  {player.nickname}
                </SelectItem>
              ))}
              {selectedPlayers[1] && (
                <SelectItem value={selectedPlayers[1].id.toString()}>
                  {selectedPlayers[1].nickname}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        {selectedPlayers[1] && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => handleRemovePlayer(selectedPlayers[1].id)}
            disabled={isLoading}
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Selected players display */}
      {selectedPlayers.length > 0 && (
        <Card className='mt-4'>
          <CardHeader className='py-2'>
            <CardTitle className='text-sm'>
              {t('selectedPlayers')} ({selectedPlayers.length}/2)
            </CardTitle>
          </CardHeader>
          <CardContent className='py-2'>
            <div className='space-y-2'>
              {selectedPlayers.map((player) => (
                <div
                  key={player.id}
                  className='flex items-center justify-between rounded-md bg-muted p-2'
                >
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src={player.picture || ''}
                        alt={player.nickname}
                      />
                      <AvatarFallback>
                        {getInitials(player.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-medium'>
                      {player.nickname}
                    </span>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DropdownSelection;
