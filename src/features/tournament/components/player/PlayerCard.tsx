import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, GripVertical } from 'lucide-react';
import { Player } from '../../types';
import { getInitials } from '../../utils/formatters';

interface PlayerCardProps {
  player: Player;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  showLevel?: boolean;
}

/**
 * PlayerCard component for displaying player information
 * Used in various places throughout the application
 */
export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onRemove,
  showRemoveButton = false,
  showLevel = true
}) => {
  // Convert player level (1-7) to percentage (0-100)
  const levelPercentage = (player.level / 7) * 100;

  return (
    <div className='flex w-full flex-col'>
      <div className='relative flex w-full items-center gap-2'>
        <Avatar className='h-8 w-8 flex-shrink-0'>
          <AvatarImage src={player.picture || ''} alt={player.nickname} />
          <AvatarFallback>{getInitials(player.nickname)}</AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate text-sm font-medium'>
            {player.nickname}
          </span>
          {showLevel && (
            <div className='flex items-center gap-1'>
              <span className='text-xs text-muted-foreground'>
                Level: {player.level}
              </span>
            </div>
          )}
        </div>
        <GripVertical className='ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground' />

        {showRemoveButton && onRemove && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='absolute -right-2 -top-2 h-5 w-5 rounded-full border bg-background shadow-sm'
            onClick={onRemove}
          >
            <X className='h-3 w-3' />
          </Button>
        )}
      </div>

      {showLevel && (
        <div className='mt-1 w-full'>
          <Progress value={levelPercentage} className='h-1.5' />
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
