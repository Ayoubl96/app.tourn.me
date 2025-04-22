import React from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TournamentLeaderboardProps {
  tournament: Tournament;
}

export const TournamentLeaderboard: React.FC<TournamentLeaderboardProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('leaderboard')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground'>{t('leaderboardDesc')}</p>
      </CardContent>
    </Card>
  );
};
