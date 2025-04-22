import React from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TournamentGamesProps {
  tournament: Tournament;
}

export const TournamentGames: React.FC<TournamentGamesProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('tournament')} {t('games')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground'>{t('gamesDesc')}</p>
      </CardContent>
    </Card>
  );
};
