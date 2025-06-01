import React from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { MatchRow } from '../ui/MatchRow';
import { getPriorityMatches } from '@/features/tournament/utils/matchHelpers';
import { Couple } from '@/features/tournament/types';

interface TableViewProps {
  matches: StagingMatch[];
  stageType: 'group' | 'elimination';
  isUpdatingMatch: boolean;
  couples: Couple[];
  getCoupleName: (id: number) => string;
  getCourtName: (match: StagingMatch) => string;
  getGroupName: (match: StagingMatch) => string;
  getBracketName: (match: StagingMatch) => string;
  onOpenResultEntry?: (match: StagingMatch) => void;
  onSaveResult?: (matchId: number, scores: any) => Promise<boolean>;
}

export function TableView({
  matches,
  stageType,
  isUpdatingMatch,
  couples,
  getCoupleName,
  getCourtName,
  getGroupName,
  getBracketName,
  onOpenResultEntry,
  onSaveResult
}: TableViewProps) {
  const t = useTranslations('Dashboard');

  // Check if any matches have scheduling data
  const hasScheduledMatches = matches.some((match) => match.scheduled_start);

  // Prioritize matches for display order
  const sortedMatches = getPriorityMatches(matches);

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='min-w-[320px]'>
                  {t('couples', { defaultValue: 'Couples' })}
                </TableHead>
                <TableHead className='w-[120px]'>
                  {t('status', { defaultValue: 'Status' })}
                </TableHead>
                <TableHead className='w-[120px]'>
                  {t('court', { defaultValue: 'Court' })}
                </TableHead>
                {stageType === 'group' && (
                  <TableHead className='w-[120px]'>
                    {t('group', { defaultValue: 'Group' })}
                  </TableHead>
                )}
                {stageType === 'elimination' && (
                  <TableHead className='w-[120px]'>
                    {t('bracket', { defaultValue: 'Bracket' })}
                  </TableHead>
                )}
                {hasScheduledMatches && (
                  <TableHead className='w-[150px]'>
                    {t('schedule', { defaultValue: 'Schedule' })}
                  </TableHead>
                )}
                <TableHead className='w-[100px]'>
                  {t('result', { defaultValue: 'Result' })}
                </TableHead>
                <TableHead className='w-[150px]'>
                  {t('actions', { defaultValue: 'Actions' })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  allMatches={matches}
                  showSchedule={hasScheduledMatches}
                  showGroup={stageType === 'group'}
                  showBracket={stageType === 'elimination'}
                  stageType={stageType}
                  couples={couples}
                  getCoupleName={getCoupleName}
                  getCourtName={getCourtName}
                  getGroupName={getGroupName}
                  getBracketName={getBracketName}
                  onOpenResultEntry={onOpenResultEntry}
                  onSaveResult={onSaveResult}
                  isUpdatingMatch={isUpdatingMatch}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
