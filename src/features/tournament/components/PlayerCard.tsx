import React from 'react';
import { useTranslations } from 'next-intl';
import { Player } from '../types';
import { getInitials, formatPlayerLevel } from '../utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface PlayerCardProps {
  player: Player;
  onDelete?: (playerId: number) => void;
  disableDelete?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onDelete,
  disableDelete = false
}) => {
  const t = useTranslations('Dashboard');
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
  );
};
