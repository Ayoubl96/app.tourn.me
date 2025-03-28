import React from 'react';
import Image from 'next/image';
import { Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/features/tournament/api/utils';
import { LexicalRenderer } from '@/features/tournament/components/LexicalRenderer';
import { useTournament } from '@/features/tournament/context/TournamentContext';

interface TournamentOverviewTabProps {
  t: (key: string, params?: Record<string, any>) => string;
}

export default function TournamentOverviewTab({
  t
}: TournamentOverviewTabProps) {
  const { tournament } = useTournament();

  if (!tournament) {
    return null;
  }

  const startDate = new Date(tournament.start_date);
  const endDate = new Date(tournament.end_date);

  return (
    <>
      {/* Tournament Header Info */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Tournament Image */}
        <Card className='overflow-hidden'>
          <div className='relative h-64 w-full'>
            {tournament.images && tournament.images.length > 0 ? (
              <Image
                src={tournament.images[0]}
                alt={tournament.name}
                fill
                className='object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-muted'>
                <span className='text-muted-foreground'>
                  {t('noItemsFound')}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Tournament Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tournamentDetails')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-muted-foreground' />
              <div>
                <div className='font-medium'>{t('dates')}</div>
                <div className='text-sm text-muted-foreground'>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {formatTime(startDate)} - {formatTime(endDate)}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-muted-foreground' />
              <div>
                <div className='font-medium'>{t('players')}</div>
                <div className='text-sm text-muted-foreground'>
                  {tournament.players_number} {t('players').toLowerCase()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Description */}
      {tournament.full_description && (
        <Card>
          <CardHeader>
            <CardTitle>{t('fullDescription')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='prose dark:prose-invert max-w-none'>
              <LexicalRenderer lexicalData={tournament.full_description} />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
