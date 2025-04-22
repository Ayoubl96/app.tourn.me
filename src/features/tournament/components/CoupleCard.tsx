import React from 'react';
import { useTranslations } from 'next-intl';
import { Couple } from '../types';
import { getInitials } from '../utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface CoupleCardProps {
  couple: Couple;
  onEdit?: (couple: Couple) => void;
  onDelete?: (coupleId: number) => void;
  disableActions?: boolean;
}

export const CoupleCard: React.FC<CoupleCardProps> = ({
  couple,
  onEdit,
  onDelete,
  disableActions = false
}) => {
  const t = useTranslations('Dashboard');

  return (
    <div className='rounded-md border p-3'>
      <div className='mb-2 flex items-center justify-between'>
        <p className='font-medium'>{couple.name}</p>
        {onEdit && onDelete && (
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onEdit(couple)}
              disabled={disableActions}
              title={t('editCouple')}
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive'
              onClick={() => onDelete(couple.id)}
              disabled={disableActions}
              title={t('deleteCouple')}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>
      <div className='mb-2 flex items-center gap-2'>
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
};
