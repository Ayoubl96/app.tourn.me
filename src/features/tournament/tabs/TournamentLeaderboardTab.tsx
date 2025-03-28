import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TournamentLeaderboardTabProps {
  t: (key: string, params?: Record<string, any>) => string;
}

export default function TournamentLeaderboardTab({
  t
}: TournamentLeaderboardTabProps) {
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
}
