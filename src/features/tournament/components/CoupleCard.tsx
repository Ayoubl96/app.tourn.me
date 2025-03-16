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
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Couple } from '../api/types';
import { getInitials } from '../api/utils';
import { useTranslations } from 'next-intl';

interface CoupleCardProps {
  couple: Couple;
  t: any; // Translation function
  onEdit?: (couple: Couple) => void;
  onDelete?: (coupleId: number) => void;
  disableActions?: boolean;
}

// Component to render a single couple card
export function CoupleCard({
  couple,
  t,
  onEdit,
  onDelete,
  disableActions = false
}: CoupleCardProps) {
  // Get Common translations for actions
  const commonT = useTranslations('Common');

  return (
    <div className='rounded-md border p-3'>
      <div className='flex items-center justify-between'>
        <p className='font-medium'>{couple.name}</p>

        {/* Actions dropdown */}
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                disabled={disableActions}
              >
                <MoreHorizontal className='h-4 w-4' />
                <span className='sr-only'>{commonT('actions')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(couple)}
                  className='cursor-pointer'
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  {t('editCouple')}
                </DropdownMenuItem>
              )}

              {onEdit && onDelete && <DropdownMenuSeparator />}

              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(couple.id)}
                  className='cursor-pointer text-destructive focus:text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  {t('removeCouple')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className='mb-2 mt-2 flex items-center gap-2'>
        <Avatar className='h-8 w-8'>
          <AvatarImage
            src={couple.first_player.picture || ''}
            alt={couple.first_player.nickname}
          />
          <AvatarFallback>
            {getInitials(couple.first_player.nickname)}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <p className='text-sm'>{couple.first_player.nickname}</p>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Avatar className='h-8 w-8'>
          <AvatarImage
            src={couple.second_player.picture || ''}
            alt={couple.second_player.nickname}
          />
          <AvatarFallback>
            {getInitials(couple.second_player.nickname)}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <p className='text-sm'>{couple.second_player.nickname}</p>
        </div>
      </div>
    </div>
  );
}
