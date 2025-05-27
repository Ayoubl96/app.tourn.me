import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TournamentGroup, TournamentBracket } from '@/api/tournaments/types';
import { MatchFilters as MatchFiltersType } from '@/features/tournament/utils/matchFilters';

interface MatchFiltersProps {
  filters: MatchFiltersType;
  stageType: 'group' | 'elimination';
  availableCourts: number[];
  stageGroups: TournamentGroup[];
  stageBrackets: TournamentBracket[];
  availableGroups: number[];
  availableBrackets: number[];
  toggleStatusFilter: (status: string) => void;
  toggleCourtFilter: (courtId: number) => void;
  toggleGroupFilter: (groupId: number) => void;
  toggleBracketFilter: (bracketId: number) => void;
  setSearchFilter: (search: string) => void;
  onClearFilters: () => void;
}

export function MatchFiltersPanel({
  filters,
  stageType,
  availableCourts,
  stageGroups,
  stageBrackets,
  availableGroups,
  availableBrackets,
  toggleStatusFilter,
  toggleCourtFilter,
  toggleGroupFilter,
  toggleBracketFilter,
  setSearchFilter,
  onClearFilters
}: MatchFiltersProps) {
  const t = useTranslations('Dashboard');

  return (
    <Card className='mb-6'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle>{t('filters', { defaultValue: 'Filters' })}</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClearFilters}
            className='h-8 px-2 text-muted-foreground'
          >
            {t('clearAll', { defaultValue: 'Clear All' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {/* Status Filters */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>
              {t('status', { defaultValue: 'Status' })}
            </h4>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='status-pending'
                  checked={filters.status.includes('pending')}
                  onCheckedChange={() => toggleStatusFilter('pending')}
                />
                <Label htmlFor='status-pending' className='cursor-pointer'>
                  {t('pending', { defaultValue: 'Pending' })}
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='status-completed'
                  checked={filters.status.includes('completed')}
                  onCheckedChange={() => toggleStatusFilter('completed')}
                />
                <Label htmlFor='status-completed' className='cursor-pointer'>
                  {t('completed', { defaultValue: 'Completed' })}
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='status-time-expired'
                  checked={filters.status.includes('time_expired')}
                  onCheckedChange={() => toggleStatusFilter('time_expired')}
                />
                <Label htmlFor='status-time-expired' className='cursor-pointer'>
                  {t('timeExpired', { defaultValue: 'Time Expired' })}
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='status-forfeited'
                  checked={filters.status.includes('forfeited')}
                  onCheckedChange={() => toggleStatusFilter('forfeited')}
                />
                <Label htmlFor='status-forfeited' className='cursor-pointer'>
                  {t('forfeited', { defaultValue: 'Forfeited' })}
                </Label>
              </div>
            </div>
          </div>

          {/* Court Filters */}
          {availableCourts.length > 0 && (
            <div>
              <h4 className='mb-3 text-sm font-medium'>
                {t('courts', { defaultValue: 'Courts' })}
              </h4>
              <div className='max-h-40 space-y-2 overflow-y-auto pr-2'>
                {availableCourts.map((courtId) => (
                  <div
                    key={`court-${courtId}`}
                    className='flex items-center space-x-2'
                  >
                    <Checkbox
                      id={`court-${courtId}`}
                      checked={filters.courts.includes(courtId)}
                      onCheckedChange={() => toggleCourtFilter(courtId)}
                    />
                    <Label
                      htmlFor={`court-${courtId}`}
                      className='cursor-pointer'
                    >
                      {t('court', { defaultValue: 'Court' })} {courtId}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Filters */}
          {stageType === 'group' && availableGroups.length > 0 && (
            <div>
              <h4 className='mb-3 text-sm font-medium'>
                {t('groups', { defaultValue: 'Groups' })}
              </h4>
              <div className='max-h-40 space-y-2 overflow-y-auto pr-2'>
                {stageGroups
                  .filter((g) => availableGroups.includes(g.id))
                  .map((group) => (
                    <div
                      key={`group-${group.id}`}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={filters.groups.includes(group.id)}
                        onCheckedChange={() => toggleGroupFilter(group.id)}
                      />
                      <Label
                        htmlFor={`group-${group.id}`}
                        className='cursor-pointer'
                      >
                        {group.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Bracket Filters */}
          {stageType === 'elimination' && availableBrackets.length > 0 && (
            <div>
              <h4 className='mb-3 text-sm font-medium'>
                {t('brackets', { defaultValue: 'Brackets' })}
              </h4>
              <div className='max-h-40 space-y-2 overflow-y-auto pr-2'>
                {stageBrackets
                  .filter((b) => availableBrackets.includes(b.id))
                  .map((bracket) => (
                    <div
                      key={`bracket-${bracket.id}`}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={`bracket-${bracket.id}`}
                        checked={filters.brackets.includes(bracket.id)}
                        onCheckedChange={() => toggleBracketFilter(bracket.id)}
                      />
                      <Label
                        htmlFor={`bracket-${bracket.id}`}
                        className='cursor-pointer'
                      >
                        {bracket.bracket_type.charAt(0).toUpperCase() +
                          bracket.bracket_type.slice(1)}{' '}
                        {t('bracket', { defaultValue: 'Bracket' })}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>
              {t('search', { defaultValue: 'Search' })}
            </h4>
            <Input
              placeholder={t('searchMatches', {
                defaultValue: 'Search matches...'
              })}
              value={filters.search}
              onChange={(e) => setSearchFilter(e.target.value)}
              className='w-full'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
