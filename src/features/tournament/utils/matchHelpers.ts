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

// Helper functions for new backend ordering system

// Get matches sorted by backend ordering (display_order)
export const getOrderedMatches = (matches: StagingMatch[]): StagingMatch[] => {
  return [...matches].sort((a, b) => {
    // Primary sort: display_order (backend provides optimal ordering)
    if (a.display_order !== null && b.display_order !== null) {
      return a.display_order - b.display_order;
    }

    // If display_order is null, use priority_score
    if (a.priority_score !== null && b.priority_score !== null) {
      return b.priority_score - a.priority_score; // Higher priority score first
    }

    // Fallback to ID order (original database order)
    return a.id - b.id;
  });
};

// Get matches filtered by status
export const getMatchesByStatus = (
  matches: StagingMatch[],
  status: string
): StagingMatch[] => {
  return matches.filter((match) => match.match_result_status === status);
};

// Get matches filtered by timing status
export const getMatchesByTimingStatus = (
  matches: StagingMatch[],
  timingStatus: string
): StagingMatch[] => {
  return matches.filter(
    (match) => getMatchTimingStatus(match) === timingStatus
  );
};

// Helper to group matches by court
export const groupMatchesByCourt = (
  matches: StagingMatch[],
  availableCourts: number[]
): Record<number, StagingMatch[]> => {
  const grouped: Record<number, StagingMatch[]> = {};

  availableCourts.forEach((courtId) => {
    grouped[courtId] = matches.filter((match) => match.court_id === courtId);
  });

  return grouped;
};

// Helper to check if a match is currently live (based on timing status)
export const isMatchLive = (match: StagingMatch): boolean => {
  const timingStatus = getMatchTimingStatus(match);
  return timingStatus === 'in-progress';
};

// Helper to check if a match is upcoming (scheduled soon)
export const isMatchUpcoming = (match: StagingMatch): boolean => {
  const timingStatus = getMatchTimingStatus(match);
  return timingStatus === 'upcoming';
};
