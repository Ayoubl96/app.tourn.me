'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MatchCard } from './MatchCard';
import { EmptyState } from '../../shared/EmptyState';

interface CourtViewProps {
  matches: StagingMatch[];
  getCoupleName: (id: number) => string;
  getCourtName: (courtId: number | null) => string;
  onMatchUpdate: () => void;
}

export const CourtView: React.FC<CourtViewProps> = ({
  matches,
  getCoupleName,
  getCourtName,
  onMatchUpdate
}) => {
  const t = useTranslations('Dashboard');

  // Group matches by court
  const matchesByCourt = matches.reduce(
    (acc, match) => {
      const courtId = match.court_id || 'unassigned';
      if (!acc[courtId]) {
        acc[courtId] = [];
      }
      acc[courtId].push(match);
      return acc;
    },
    {} as Record<string | number, StagingMatch[]>
  );

  // Get court keys sorted - assigned courts first, then unassigned
  const courtKeys = Object.keys(matchesByCourt).sort((a, b) => {
    if (a === 'unassigned') return 1;
    if (b === 'unassigned') return -1;
    return parseInt(a) - parseInt(b);
  });

  if (courtKeys.length === 0) {
    return (
      <EmptyState
        icon={() => <MapPin className='h-8 w-8' />}
        title={t('noMatchesFound', { defaultValue: 'No matches found' })}
        description={t('noMatchesFoundDescription', {
          defaultValue: 'No matches available to display by court.'
        })}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {courtKeys.map((courtKey) => {
        const courtMatches = matchesByCourt[courtKey];
        const courtId = courtKey === 'unassigned' ? null : parseInt(courtKey);
        const courtName = getCourtName(courtId);
        const matchCount = courtMatches.length;

        return (
          <Card key={courtKey} className='w-full'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  {courtName}
                </CardTitle>
                <Badge variant='secondary' className='text-xs'>
                  {matchCount} {matchCount === 1 ? t('match') : t('matches')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className='pt-0'>
              <div className='space-y-4'>
                {courtMatches
                  .sort((a, b) => {
                    // Sort by scheduled time if available, otherwise by match order
                    if (a.scheduled_start && b.scheduled_start) {
                      return (
                        new Date(a.scheduled_start).getTime() -
                        new Date(b.scheduled_start).getTime()
                      );
                    }
                    if (a.display_order && b.display_order) {
                      return a.display_order - b.display_order;
                    }
                    return a.id - b.id;
                  })
                  .map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      getCoupleName={getCoupleName}
                      getCourtName={getCourtName}
                      onMatchUpdate={onMatchUpdate}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
