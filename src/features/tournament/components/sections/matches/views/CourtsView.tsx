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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MatchRow } from '../ui/MatchRow';
import { getPriorityMatches } from '@/features/tournament/utils/matchHelpers';
import { groupMatchesByCourt } from '@/features/tournament/utils/matchDisplayHelpers';
import { Couple } from '@/features/tournament/types';

interface CourtsViewProps {
  matches: StagingMatch[];
  stageType: 'group' | 'elimination';
  isUpdatingMatch: boolean;
  availableCourts: number[];
  couples: Couple[];
  getCoupleName: (id: number) => string;
  getCourtName: (match: StagingMatch) => string;
  getGroupName: (match: StagingMatch) => string;
  getBracketName: (match: StagingMatch) => string;
  onOpenResultEntry?: (match: StagingMatch) => void;
  onSaveResult?: (matchId: number, scores: any) => Promise<boolean>;
}

export function CourtsView({
  matches,
  stageType,
  isUpdatingMatch,
  availableCourts,
  couples,
  getCoupleName,
  getCourtName,
  getGroupName,
  getBracketName,
  onOpenResultEntry,
  onSaveResult
}: CourtsViewProps) {
  const t = useTranslations('Dashboard');

  // Group matches by court
  const matchesByCourtId = groupMatchesByCourt(matches, availableCourts);

  // Check if any matches have scheduling data for each court
  const hasScheduledMatchesByCourt: Record<number, boolean> = {};
  Object.entries(matchesByCourtId).forEach(([courtId, courtMatches]) => {
    hasScheduledMatchesByCourt[Number(courtId)] = courtMatches.some(
      (match) => match.scheduled_start
    );
  });

  // Count of courts with matches
  const courtsWithMatchesCount = Object.keys(matchesByCourtId).filter(
    (courtId) => matchesByCourtId[Number(courtId)].length > 0
  ).length;

  // Count of matches without courts
  const unassignedMatches = matches.filter((match) => !match.court_id);
  const matchesWithoutCourt = unassignedMatches.length;

  return (
    <div className='space-y-6'>
      {/* Unassigned matches section */}
      {matchesWithoutCourt > 0 && (
        <Card>
          <CardHeader className='bg-muted/30'>
            <CardTitle className='flex items-center text-lg'>
              <AlertCircle className='mr-2 h-5 w-5 text-amber-500' />
              {t('unassignedMatches', { defaultValue: 'Unassigned Matches' })}
              <Badge variant='outline' className='ml-2'>
                {matchesWithoutCourt}
              </Badge>
            </CardTitle>
            <CardDescription>
              {t('unassignedMatchesDescription', {
                defaultValue:
                  'These matches have not been assigned to any court'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-[320px]'>
                    {t('couples', { defaultValue: 'Couples' })}
                  </TableHead>
                  <TableHead className='w-[120px]'>
                    {t('status', { defaultValue: 'Status' })}
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
                  <TableHead className='w-[100px]'>
                    {t('result', { defaultValue: 'Result' })}
                  </TableHead>
                  <TableHead className='w-[150px]'>
                    {t('actions', { defaultValue: 'Actions' })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPriorityMatches(unassignedMatches).map((match) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    allMatches={matches}
                    showSchedule={false}
                    showGroup={stageType === 'group'}
                    showBracket={stageType === 'elimination'}
                    stageType={stageType}
                    couples={couples}
                    getCoupleName={getCoupleName}
                    getCourtName={getCourtName}
                    getGroupName={getGroupName}
                    getBracketName={getBracketName}
                    onOpenResultEntry={onOpenResultEntry}
                    isUpdatingMatch={isUpdatingMatch}
                    onSaveResult={onSaveResult}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Court-based matches */}
      {courtsWithMatchesCount === 0 ? (
        <Alert>
          <AlertTitle>
            {t('noCourtsAssigned', { defaultValue: 'No Courts Assigned' })}
          </AlertTitle>
          <AlertDescription>
            {t('noCourtsAssignedDescription', {
              defaultValue: 'No matches have been assigned to courts yet'
            })}
          </AlertDescription>
        </Alert>
      ) : (
        Object.entries(matchesByCourtId)
          .filter(([_, matches]) => matches.length > 0)
          .map(([courtId, courtMatches]) => (
            <Card key={courtId} className='overflow-hidden'>
              <CardHeader className='bg-primary/5'>
                <CardTitle>
                  {getCourtName(courtMatches[0]) ||
                    `${t('court', { defaultValue: 'Court' })} ${courtId}`}
                  <Badge variant='outline' className='ml-2'>
                    {courtMatches.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
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
                      {/* Only show schedule column if any matches have scheduling */}
                      {hasScheduledMatchesByCourt[Number(courtId)] && (
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
                    {getPriorityMatches(courtMatches).map((match) => (
                      <MatchRow
                        key={match.id}
                        match={match}
                        allMatches={courtMatches}
                        showSchedule={
                          hasScheduledMatchesByCourt[Number(courtId)]
                        }
                        showGroup={stageType === 'group'}
                        showBracket={stageType === 'elimination'}
                        stageType={stageType}
                        couples={couples}
                        getCoupleName={getCoupleName}
                        getCourtName={getCourtName}
                        getGroupName={getGroupName}
                        getBracketName={getBracketName}
                        onOpenResultEntry={onOpenResultEntry}
                        isUpdatingMatch={isUpdatingMatch}
                        onSaveResult={onSaveResult}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}
