import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { Player } from '../api/types';
import { getInitials, formatPlayerLevel } from '../api/utils';
import { useTranslations } from 'next-intl';

interface PlayerCardProps {
  player: Player;
  t: any; // Translation function
  onDelete?: (playerId: number) => void;
  disableDelete?: boolean;
  // New props for add functionality
  onAdd?: (playerId: number) => void;
  showAddButton?: boolean;
  isAddDisabled?: boolean;
  isAddLoading?: boolean;
  isAdded?: boolean;
}

// Component to render a single player card
export function PlayerCard({
  player,
  t,
  onDelete,
  disableDelete = false,
  // New add button props with defaults
  onAdd,
  showAddButton = false,
  isAddDisabled = false,
  isAddLoading = false,
  isAdded = false
}: PlayerCardProps) {
  // Get Common translations for actions
  const commonT = useTranslations('Common');

  return (
    <div className='flex h-auto items-center rounded-md border p-2'>
      <Avatar className='mr-2 h-8 w-8'>
        <AvatarImage src={player.picture || ''} alt={player.nickname} />
        <AvatarFallback>{getInitials(player.nickname)}</AvatarFallback>
      </Avatar>
      <div className='flex-1'>
        <p className='text-sm font-medium'>{player.nickname}</p>
        <p className='text-xs text-muted-foreground'>
          {t('level')}: {formatPlayerLevel(player.level)}
        </p>
      </div>

      {/* Action buttons section */}
      <div className='flex items-center gap-2'>
        {/* Add button (when enabled) */}
        {showAddButton && onAdd && (
          <Button
            size='sm'
            onClick={() => onAdd(player.id)}
            disabled={isAddDisabled}
          >
            {isAdded ? t('added') : isAddLoading ? t('adding') : t('add')}
          </Button>
        )}

        {/* Delete dropdown menu (existing functionality) */}
        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                disabled={disableDelete}
              >
                <MoreHorizontal className='h-4 w-4' />
                <span className='sr-only'>{commonT('actions')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem className='cursor-pointer'>
                <Eye className='mr-2 h-4 w-4' />
                {t('viewPlayerDetails')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(player.id)}
                className='cursor-pointer text-destructive focus:text-destructive'
                disabled={disableDelete}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                {t('removePlayer')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
