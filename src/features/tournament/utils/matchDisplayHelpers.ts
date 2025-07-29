import {
  StagingMatch,
  TournamentGroup,
  TournamentBracket
} from '@/api/tournaments/types';
import React from 'react';

// Get court name helper
export const getCourtName = (match: StagingMatch): string => {
  if (!match || typeof match.court_id !== 'number') return '';

  // Try to access court_name property if it exists at runtime
  if ('court_name' in match && typeof (match as any).court_name === 'string') {
    return (match as any).court_name;
  }

  // Fallback to generic court name with ID
  return `Court ${match.court_id}`;
};

// Get group name helper
export const getGroupName = (
  match: StagingMatch,
  stageGroups: TournamentGroup[]
): string => {
  // Try to access group_name property if it exists at runtime
  if ('group_name' in match && typeof (match as any).group_name === 'string') {
    return (match as any).group_name;
  }

  // If group_id exists, try to find the group name from stageGroups
  if (match.group_id) {
    const group = stageGroups.find((g) => g.id === match.group_id);
    if (group) {
      return group.name;
    }
  }

  // Return empty string if no group name found
  return '';
};

// Get bracket name helper
export const getBracketName = (
  match: StagingMatch,
  stageBrackets: TournamentBracket[]
): string => {
  if (!match.bracket_id) return '';

  const bracket = stageBrackets.find((b) => b.id === match.bracket_id);
  if (bracket) {
    return `${bracket.bracket_type.charAt(0).toUpperCase() + bracket.bracket_type.slice(1)} Bracket`;
  }

  return `Bracket #${match.bracket_id}`;
};

// Get match result as JSX-compatible data structure
export interface MatchResultDisplay {
  type: 'no-result' | 'winner-only' | 'detailed-score';
  winnerCoupleId?: number;
  couple1Wins?: number;
  couple2Wins?: number;
  gameScores?: Array<{ couple1Score: number; couple2Score: number }>;
}

// Get match result data for display
export const getMatchResultData = (match: StagingMatch): MatchResultDisplay => {
  if (match.match_result_status !== 'completed') {
    return { type: 'no-result' };
  }

  // If there are no games recorded
  if (!match.games || match.games.length === 0) {
    if (match.winner_couple_id) {
      return {
        type: 'winner-only',
        winnerCoupleId: match.winner_couple_id
      };
    }
    return { type: 'no-result' };
  }

  // Count games won by each couple
  const couple1Wins = match.games.filter(
    (game) => game.winner_id === match.couple1_id
  ).length;
  const couple2Wins = match.games.filter(
    (game) => game.winner_id === match.couple2_id
  ).length;

  // Format game scores
  const gameScores = match.games.map((game) => ({
    couple1Score: game.couple1_score,
    couple2Score: game.couple2_score
  }));

  return {
    type: 'detailed-score',
    couple1Wins,
    couple2Wins,
    gameScores
  };
};

// Helper to group matches by court
export const groupMatchesByCourt = (
  matches: StagingMatch[],
  availableCourts: number[]
) => {
  const matchesByCourt: Record<number, StagingMatch[]> = {};

  // First, create entries for all available courts (even empty ones)
  availableCourts.forEach((courtId) => {
    matchesByCourt[courtId] = [];
  });

  // Then sort the matches into the appropriate court buckets
  matches.forEach((match) => {
    if (match.court_id) {
      if (!matchesByCourt[match.court_id]) {
        matchesByCourt[match.court_id] = [];
      }
      matchesByCourt[match.court_id].push(match);
    }
  });

  // Note: Individual views will use getOrderedMatches which relies on backend ordering
  // This function just groups them, sorting is handled by the consuming components

  return matchesByCourt;
};
