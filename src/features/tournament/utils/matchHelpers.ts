import { StagingMatch } from '@/api/tournaments/types';
import { format, isToday, parseISO, isAfter, isBefore } from 'date-fns';

// Get match status with timing context
export const getMatchTimingStatus = (match: StagingMatch) => {
  if (!match.scheduled_start) return 'not-scheduled';

  const now = new Date();
  const startTime = parseISO(match.scheduled_start);
  const endTime = match.scheduled_end ? parseISO(match.scheduled_end) : null;

  if (endTime && isAfter(now, endTime)) {
    return 'ended';
  } else if (isAfter(now, startTime)) {
    return 'in-progress';
  } else if (
    isAfter(startTime, now) &&
    isBefore(startTime, new Date(now.getTime() + 30 * 60000))
  ) {
    return 'upcoming';
  } else {
    return 'scheduled';
  }
};

// Format time for display
export const formatMatchTime = (timeString: string) => {
  if (!timeString) return '';
  const date = parseISO(timeString);
  return format(date, 'h:mm a');
};

// Format date for display
export const formatMatchDate = (timeString: string) => {
  if (!timeString) return '';
  const date = parseISO(timeString);
  return isToday(date) ? 'Today' : format(date, 'MMM d, yyyy');
};

// Helper to determine if a match is the current one playing
export const isCurrentMatch = (
  match: StagingMatch,
  allMatches: StagingMatch[],
  index: number
): boolean => {
  // First, check if the match is scheduled and in progress
  const timingStatus = getMatchTimingStatus(match);
  if (timingStatus === 'in-progress') return true;

  // If the match is pending and there are no ongoing matches,
  // consider the first pending match as current
  if (match.match_result_status === 'pending') {
    // Check if any match is in progress on this court
    const anyMatchInProgress = allMatches.some(
      (m) => getMatchTimingStatus(m) === 'in-progress'
    );

    // If there are no ongoing matches and this is the first pending match in the list
    if (!anyMatchInProgress) {
      // Find pending matches for this court
      const pendingMatches = allMatches.filter(
        (m) => m.match_result_status === 'pending'
      );
      // If this is the first pending match for this court
      return pendingMatches.length > 0 && pendingMatches[0].id === match.id;
    }
  }

  return false;
};

// Helper to check if a match can be played next
export const canBePlayedNext = (
  match: StagingMatch,
  allMatches: StagingMatch[]
): boolean => {
  // Skip completed, in progress, or already scheduled matches
  if (
    match.match_result_status !== 'pending' ||
    getMatchTimingStatus(match) === 'in-progress' ||
    (match.scheduled_start && new Date(match.scheduled_start) > new Date())
  ) {
    return false;
  }

  // Group all pending matches by court
  const matchesByCourtId: Record<string, StagingMatch[]> = {};

  allMatches.forEach((m) => {
    if (m.court_id) {
      const courtId = m.court_id.toString();
      if (!matchesByCourtId[courtId]) {
        matchesByCourtId[courtId] = [];
      }
      matchesByCourtId[courtId].push(m);
    }
  });

  // For courts with no in-progress matches, check if this is the next match
  for (const courtId in matchesByCourtId) {
    const courtMatches = matchesByCourtId[courtId];
    const anyInProgress = courtMatches.some(
      (m) => getMatchTimingStatus(m) === 'in-progress'
    );

    if (!anyInProgress) {
      // Get pending matches for this court
      const pendingMatches = courtMatches.filter(
        (m) => m.match_result_status === 'pending'
      );
      // If this match is the first pending match for an available court
      if (pendingMatches.length > 0 && pendingMatches[0].id === match.id) {
        return true;
      }
    }
  }

  // If the match doesn't have a court yet, check if it's the first unassigned match
  if (!match.court_id) {
    const unassignedMatches = allMatches.filter(
      (m) => !m.court_id && m.match_result_status === 'pending'
    );
    return unassignedMatches.length > 0 && unassignedMatches[0].id === match.id;
  }

  return false;
};

// Update the priority sorting function to prioritize live matches better
export const getPriorityMatches = (matches: StagingMatch[]): StagingMatch[] => {
  return [...matches].sort((a, b) => {
    const aStatus = getMatchTimingStatus(a);
    const bStatus = getMatchTimingStatus(b);
    const aIsCurrent = isCurrentMatch(a, matches, 0);
    const bIsCurrent = isCurrentMatch(b, matches, 0);
    const aCanPlay = canBePlayedNext(a, matches);
    const bCanPlay = canBePlayedNext(b, matches);

    // Priority 1: In-progress matches first (highest priority)
    if (aStatus === 'in-progress' && bStatus !== 'in-progress') return -1;
    if (bStatus === 'in-progress' && aStatus !== 'in-progress') return 1;

    // Priority 2: Current matches (manually determined as active)
    if (aIsCurrent && !bIsCurrent) return -1;
    if (bIsCurrent && !aIsCurrent) return 1;

    // Priority 3: Matches that can be played next
    if (aCanPlay && !bCanPlay) return -1;
    if (bCanPlay && !aCanPlay) return 1;

    // Priority 4: Upcoming matches (scheduled soon)
    if (aStatus === 'upcoming' && bStatus !== 'upcoming') return -1;
    if (bStatus === 'upcoming' && aStatus !== 'upcoming') return 1;

    // Priority 5: Scheduled matches by time
    if (a.scheduled_start && b.scheduled_start) {
      return (
        new Date(a.scheduled_start).getTime() -
        new Date(b.scheduled_start).getTime()
      );
    }

    // Priority 6: Scheduled before unscheduled
    if (a.scheduled_start && !b.scheduled_start) return -1;
    if (b.scheduled_start && !a.scheduled_start) return 1;

    // Priority 7: Pending matches before completed
    if (
      a.match_result_status === 'pending' &&
      b.match_result_status !== 'pending'
    )
      return -1;
    if (
      b.match_result_status === 'pending' &&
      a.match_result_status !== 'pending'
    )
      return 1;

    // Priority 8: Keep original order (backend order) for same priority matches
    return a.id - b.id;
  });
};
