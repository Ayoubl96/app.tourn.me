import React from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { TournamentEditForm } from '../forms/TournamentEditForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

interface TournamentManageProps {
  tournament: Tournament;
}

export const TournamentManage: React.FC<TournamentManageProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');

  // Handle form submission success
  const handleEditSuccess = () => {
    // Could refresh the tournament data here if needed
    window.location.reload(); // Simple approach to refresh all data
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>
          {t('manage')} {t('tournament')}
        </CardTitle>
        <CardDescription>{t('editTournamentDetails')}</CardDescription>
      </CardHeader>
      <CardContent>
        <TournamentEditForm
          tournament={tournament}
          onSuccess={handleEditSuccess}
        />
      </CardContent>
    </Card>
  );
};
