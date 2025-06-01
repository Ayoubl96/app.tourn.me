import React from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import {
  getMatchTimingStatus,
  getPriorityMatches
} from '@/features/tournament/utils/matchHelpers';
import { groupMatchesByCourt } from '@/features/tournament/utils/matchDisplayHelpers';
import { CalendarClock } from 'lucide-react';
import { MatchCard } from '../ui/MatchCard';
import { Couple } from '@/features/tournament/types';

interface CourtCardViewProps {
  matches: StagingMatch[];
  availableCourts: number[];
  couples: Couple[];
  getCoupleName: (id: number) => string;
  getCourtName: (match: StagingMatch) => string;
  getGroupName: (match: StagingMatch) => string;
  getBracketName: (match: StagingMatch) => string;
  onSaveResult?: (matchId: number, scores: any) => Promise<boolean>;
}

export function CourtCardView({
  matches,
  availableCourts,
  couples,
  getCoupleName,
  getCourtName,
  getGroupName,
  getBracketName,
  onSaveResult
}: CourtCardViewProps) {
  const t = useTranslations('Dashboard');

  // Group all matches by court
  const matchesByCourtId = groupMatchesByCourt(matches, availableCourts);

  // Active/In Progress matches - priority is:
  // 1. Matches with "in-progress" status
  // 2. Current matches (manually determined as active)
  // 3. Matches that can be played next
  // 4. Upcoming matches (scheduled soon)

  // First, group all available courts
  const courtGroups: Record<string, StagingMatch[]> = {};

  availableCourts.forEach((courtId) => {
    const courtMatches = matches.filter(
      (m) => m.court_id === courtId && m.match_result_status === 'pending'
    );

    if (courtMatches.length > 0) {
      // Use the improved priority sorting function
      const sortedMatches = getPriorityMatches(courtMatches);

      const venueName = getCourtName(sortedMatches[0]).split(' - ')[0];
      if (!courtGroups[venueName]) {
        courtGroups[venueName] = [];
      }

      // Only take the active/next match for each court
      courtGroups[venueName].push(sortedMatches[0]);
    }
  });

  // Get upcoming matches (scheduled but not started) - prioritize live matches first
  const upcomingMatches = getPriorityMatches(
    matches.filter(
      (match) =>
        (getMatchTimingStatus(match) === 'scheduled' ||
          getMatchTimingStatus(match) === 'not-scheduled') &&
        match.match_result_status === 'pending' &&
        !Object.values(courtGroups).flat().includes(match)
    )
  ); // Show all upcoming matches instead of limiting to 6

  // Get completed matches - most recent first
  const completedMatches = matches
    .filter((match) => match.match_result_status === 'completed')
    .sort((a, b) => {
      // Sort by completed time, most recent first
      // Most recent would be the ones with higher IDs assuming sequential assignment
      return b.id - a.id;
    }); // Show all completed matches instead of limiting to 6

  return (
    <div className='space-y-8'>
      {/* Current matches on courts */}
      {Object.keys(courtGroups).length > 0 && (
        <div>
          <h3 className='mb-5 text-2xl font-medium'>
            {t('currentMatches', { defaultValue: 'Current Matches' })}
          </h3>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
            {Object.entries(courtGroups).map(([venue, courtMatches]) => (
              <div key={venue} className='space-y-4'>
                <h4 className='text-lg font-medium text-foreground/90'>
                  {venue}
                </h4>
                <div className='space-y-4'>
                  {courtMatches.map((match, index) => {
                    const courtNumber = getCourtName(match);

                    return (
                      <div key={match.id} className='space-y-2'>
                        <h5 className='text-base font-medium text-foreground/80'>
                          {courtNumber}
                        </h5>
                        <MatchCard
                          match={match}
                          allMatches={matches}
                          couples={couples}
                          getCoupleName={getCoupleName}
                          getGroupName={getGroupName}
                          getBracketName={getBracketName}
                          index={index}
                          onSaveResult={onSaveResult}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two columns layout for Upcoming and Recent Games */}
      <div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
        {/* Upcoming Games */}
        <div>
          <h3 className='mb-5 text-2xl font-medium'>
            {t('upcomingGames', { defaultValue: 'Upcoming Games' })}
          </h3>
          <div className='space-y-4'>
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  allMatches={matches}
                  couples={couples}
                  getCoupleName={getCoupleName}
                  getGroupName={getGroupName}
                  getBracketName={getBracketName}
                  index={index}
                  onSaveResult={onSaveResult}
                />
              ))
            ) : (
              <Card className='bg-muted/30'>
                <CardContent className='p-6 text-center'>
                  <CardDescription>
                    {t('noUpcomingGames', {
                      defaultValue: 'No upcoming games scheduled'
                    })}
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Games */}
        <div>
          <h3 className='mb-5 text-2xl font-medium'>
            {t('recentGames', { defaultValue: 'Recent Games' })}
          </h3>
          <div className='space-y-4'>
            {completedMatches.length > 0 ? (
              completedMatches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  allMatches={matches}
                  couples={couples}
                  getCoupleName={getCoupleName}
                  getGroupName={getGroupName}
                  getBracketName={getBracketName}
                  index={index}
                  onSaveResult={onSaveResult}
                />
              ))
            ) : (
              <Card className='bg-muted/30'>
                <CardContent className='flex items-center justify-center p-12 text-center'>
                  <div>
                    <CalendarClock className='mx-auto mb-4 h-12 w-12 text-muted-foreground/40' />
                    <CardDescription>
                      {t('gamesWillAppearHere', {
                        defaultValue:
                          'Games will appear here once they are completed'
                      })}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
