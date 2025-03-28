import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { CoupleForm } from '@/features/tournament/components/CoupleForm';
import { Couple, TournamentPlayer } from '@/features/tournament/api/types';

interface CoupleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentPlayers: TournamentPlayer[];
  couples: Couple[];
  existingCouple?: Couple;
  onComplete: () => void;
  onCancel: () => void;
  t: (key: string, params?: Record<string, any>) => string;
}

export function CoupleFormDialog({
  open,
  onOpenChange,
  tournamentId,
  tournamentPlayers,
  couples,
  existingCouple,
  onComplete,
  onCancel,
  t
}: CoupleFormDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full overflow-y-auto sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>
            {existingCouple ? t('editCouple') : t('createCouple')}
          </SheetTitle>
        </SheetHeader>
        <div className='mt-6'>
          <CoupleForm
            tournamentId={tournamentId}
            tournamentPlayers={tournamentPlayers}
            couples={couples}
            existingCouple={existingCouple}
            onComplete={onComplete}
            onCancel={onCancel}
            t={t}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
