import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/features/tournament/utils/formatters';
import { Couple } from '@/features/tournament/types';

interface CoupleDisplayProps {
  coupleId: number;
  couples: Couple[];
  fallbackName?: string;
  showAvatars?: boolean;
  compact?: boolean;
  className?: string;
}

interface VersusDisplayProps {
  couple1Id: number;
  couple2Id: number;
  couples: Couple[];
  getCoupleName: (id: number) => string;
  showAvatars?: boolean;
  compact?: boolean;
  className?: string;
}

export function CoupleDisplay({
  coupleId,
  couples,
  fallbackName,
  showAvatars = true,
  compact = false,
  className = ''
}: CoupleDisplayProps) {
  const couple = couples.find((c) => c.id === coupleId);

  if (!couple) {
    return (
      <div className={`text-muted-foreground ${className}`}>
        {fallbackName || `Couple #${coupleId}`}
      </div>
    );
  }

  const player1 = couple.first_player;
  const player2 = couple.second_player;

  if (compact) {
    // Compact version - just player names
    return (
      <div className={`${className}`}>
        <div className='text-base font-medium'>
          {player1?.nickname || 'Player 1'} & {player2?.nickname || 'Player 2'}
        </div>
        <div className='text-xs text-muted-foreground'>{couple.name}</div>
      </div>
    );
  }

  // Full version with avatars and individual player info
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Player 1 */}
      <div className='flex items-center gap-2'>
        {showAvatars && (
          <Avatar className='h-6 w-6'>
            <AvatarImage
              src={player1?.picture || ''}
              alt={player1?.nickname || 'Player 1'}
            />
            <AvatarFallback className='text-xs'>
              {getInitials(player1?.nickname)}
            </AvatarFallback>
          </Avatar>
        )}
        <span className='text-base font-medium'>
          {player1?.nickname || 'Player 1'}
        </span>
      </div>

      {/* Player 2 */}
      <div className='flex items-center gap-2'>
        {showAvatars && (
          <Avatar className='h-6 w-6'>
            <AvatarImage
              src={player2?.picture || ''}
              alt={player2?.nickname || 'Player 2'}
            />
            <AvatarFallback className='text-xs'>
              {getInitials(player2?.nickname)}
            </AvatarFallback>
          </Avatar>
        )}
        <span className='text-base font-medium'>
          {player2?.nickname || 'Player 2'}
        </span>
      </div>

      {/* Couple name as subtitle */}
      <div className='mt-1 text-xs text-muted-foreground'>{couple.name}</div>
    </div>
  );
}

// New component for horizontal "Team A vs Team B" display
export function VersusDisplay({
  couple1Id,
  couple2Id,
  couples,
  getCoupleName,
  showAvatars = true,
  compact = false,
  className = ''
}: VersusDisplayProps) {
  const couple1 = couples.find((c) => c.id === couple1Id);
  const couple2 = couples.find((c) => c.id === couple2Id);

  const getCoupleDisplayName = (
    couple: Couple | undefined,
    coupleId: number
  ) => {
    if (!couple) return getCoupleName(coupleId);

    const player1 = couple.first_player;
    const player2 = couple.second_player;

    if (compact) {
      return `${player1?.nickname || 'Player 1'} & ${player2?.nickname || 'Player 2'}`;
    }

    return `${player1?.nickname || 'Player 1'} & ${player2?.nickname || 'Player 2'}`;
  };

  const renderCoupleWithAvatars = (
    couple: Couple | undefined,
    coupleId: number
  ) => {
    if (!couple) {
      return (
        <span className='text-muted-foreground'>{getCoupleName(coupleId)}</span>
      );
    }

    const player1 = couple.first_player;
    const player2 = couple.second_player;

    return (
      <div className='flex items-center gap-1'>
        {showAvatars && (
          <>
            <Avatar className='h-5 w-5'>
              <AvatarImage
                src={player1?.picture || ''}
                alt={player1?.nickname || 'Player 1'}
              />
              <AvatarFallback className='text-xs'>
                {getInitials(player1?.nickname)}
              </AvatarFallback>
            </Avatar>
            <Avatar className='h-5 w-5'>
              <AvatarImage
                src={player2?.picture || ''}
                alt={player2?.nickname || 'Player 2'}
              />
              <AvatarFallback className='text-xs'>
                {getInitials(player2?.nickname)}
              </AvatarFallback>
            </Avatar>
          </>
        )}
        <span className='text-base font-medium'>
          {getCoupleDisplayName(couple, coupleId)}
        </span>
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {renderCoupleWithAvatars(couple1, couple1Id)}
      <span className='text-sm font-medium text-muted-foreground'>vs</span>
      {renderCoupleWithAvatars(couple2, couple2Id)}
    </div>
  );
}
