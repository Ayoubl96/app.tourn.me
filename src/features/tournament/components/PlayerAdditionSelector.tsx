import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Import, Plus, UserPlus } from 'lucide-react';
import { PlayerAdditionMode } from '../types';

interface PlayerAdditionSelectorProps {
  onSelectOption: (option: PlayerAdditionMode) => void;
}

export const PlayerAdditionSelector: React.FC<PlayerAdditionSelectorProps> = ({
  onSelectOption
}) => {
  const t = useTranslations('Dashboard');

  return (
    <div className='space-y-4 pt-4'>
      <h3 className='text-lg font-medium'>{t('addPlayerOptions')}</h3>
      <p className='mb-4 text-sm text-muted-foreground'>
        {t('selectAddPlayerMethod')}
      </p>

      <div className='space-y-3'>
        <Button
          onClick={() => onSelectOption('existing')}
          variant='outline'
          className='w-full justify-start text-left'
        >
          <UserPlus className='mr-2 h-4 w-4' />
          <div>
            <div className='font-medium'>{t('addExistingPlayer')}</div>
            <div className='text-xs text-muted-foreground'>
              {t('addExistingPlayerDesc')}
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectOption('create')}
          variant='outline'
          className='w-full justify-start text-left'
        >
          <Plus className='mr-2 h-4 w-4' />
          <div>
            <div className='font-medium'>{t('createNewPlayer')}</div>
            <div className='text-xs text-muted-foreground'>
              {t('createPlayerDesc')}
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectOption('import')}
          variant='outline'
          className='w-full justify-start text-left'
        >
          <Import className='mr-2 h-4 w-4' />
          <div>
            <div className='font-medium'>{t('importFromPlaytomic')}</div>
            <div className='text-xs text-muted-foreground'>
              {t('importPlayerDesc')}
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};
