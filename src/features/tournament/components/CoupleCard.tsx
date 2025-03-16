import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Couple } from '../api/types';
import { getInitials } from '../api/utils';

interface CoupleCardProps {
  couple: Couple;
  t: any; // Translation function
}

// Component to render a single couple card
export function CoupleCard({ couple, t }: CoupleCardProps) {
  return (
    <div className='rounded-md border p-3'>
      <p className='mb-2 font-medium'>{couple.name}</p>
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
}
