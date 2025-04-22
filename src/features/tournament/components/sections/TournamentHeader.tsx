import React from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { getTournamentStatus } from '../../utils/formatters';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/lib/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TournamentHeaderProps {
  tournament: Tournament;
}

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  tournament
}) => {
  const t = useTranslations('Dashboard');
  const status = getTournamentStatus(tournament);

  return (
    <div className='flex flex-col space-y-2 md:flex-row md:items-center md:justify-between'>
      <div>
        <Link
          href='/dashboard/tournament/overview'
          className='mb-2 flex items-center text-sm font-medium text-muted-foreground hover:text-primary'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          {t('backTo')} {t('tournament')}
        </Link>
        <Heading title={tournament.name} description={tournament.description} />
      </div>
      <div>
        <Badge
          variant={
            status === 'ongoing'
              ? 'default'
              : status === 'upcoming'
                ? 'outline'
                : 'secondary'
          }
          className='text-base'
        >
          {t(status)}
        </Badge>
      </div>
    </div>
  );
};
