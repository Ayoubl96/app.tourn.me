import React from 'react';
import { Couple } from '../../types';
import { DraggableItem } from '@/components/dnd';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '../../utils/formatters';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DraggableCoupleCardProps {
  couple: Couple;
  groupId?: number;
  onRemove?: () => void;
  isRemovingCouple?: boolean;
  isDragging?: boolean;
}

export function DraggableCoupleCard({
  couple,
  groupId,
  onRemove,
  isRemovingCouple,
  isDragging
}: DraggableCoupleCardProps) {
  const t = useTranslations('Dashboard');

  // Create appropriate ID based on if it's in a group or not
  const itemId = groupId
    ? `group-couple-${groupId}-${couple.id}`
    : `couple-${couple.id}`;

  return (
    <DraggableItem
      id={itemId}
      className={`block w-full rounded-md border bg-card p-3 transition-all ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>{getInitials(couple.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>{couple.name}</span>
            <div className='flex gap-1 text-xs text-muted-foreground'>
              <span>{couple.first_player.nickname}</span>
              <span>&</span>
              <span>{couple.second_player.nickname}</span>
            </div>
          </div>
        </div>

        {groupId && onRemove && (
          <Button
            variant='ghost'
            size='icon'
            onClick={onRemove}
            disabled={isRemovingCouple}
            className='h-6 w-6'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>
    </DraggableItem>
  );
}
