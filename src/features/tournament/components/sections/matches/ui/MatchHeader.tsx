import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, PlayCircle, List, LayoutGrid, Grid } from 'lucide-react';

interface MatchHeaderProps {
  activeFilterCount: number;
  viewType: 'table' | 'courts' | 'cards';
  onToggleFilters: () => void;
  onGenerateMatches: () => void;
  onViewTypeChange: (viewType: 'table' | 'courts' | 'cards') => void;
}

export function MatchHeader({
  activeFilterCount,
  viewType,
  onToggleFilters,
  onGenerateMatches,
  onViewTypeChange
}: MatchHeaderProps) {
  const t = useTranslations('Dashboard');

  return (
    <div className='space-y-4'>
      {/* Header with title and buttons */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <h3 className='text-lg font-medium'>
          {t('matchManagement', { defaultValue: 'Match Management' })}
        </h3>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onToggleFilters}
            className={activeFilterCount > 0 ? 'border-primary' : ''}
          >
            <Filter className='mr-1 h-4 w-4' />
            {t('filter', { defaultValue: 'Filter' })}
            {activeFilterCount > 0 && (
              <Badge className='ml-1 flex h-5 w-5 items-center justify-center p-0'>
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            onClick={onGenerateMatches}
            size='sm'
            className='flex items-center gap-1'
          >
            <PlayCircle className='mr-1 h-4 w-4' />
            {t('generateMatches', { defaultValue: 'Generate Matches' })}
          </Button>
        </div>
      </div>

      {/* View type selector */}
      <div className='flex justify-end'>
        <div className='flex items-center rounded-md bg-muted/50 p-1'>
          <Button
            variant={viewType === 'table' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => onViewTypeChange('table')}
            className='flex items-center gap-1'
          >
            <List className='mr-1 h-4 w-4' />
            {t('tableView', { defaultValue: 'Table View' })}
          </Button>
          <Button
            variant={viewType === 'courts' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => onViewTypeChange('courts')}
            className='flex items-center gap-1'
          >
            <LayoutGrid className='mr-1 h-4 w-4' />
            {t('courtView', { defaultValue: 'Court View' })}
          </Button>
          <Button
            variant={viewType === 'cards' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => onViewTypeChange('cards')}
            className='flex items-center gap-1'
          >
            <Grid className='mr-1 h-4 w-4' />
            {t('cardView', { defaultValue: 'Card View' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
