import { useApi } from '@/hooks/useApi';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  PlaytomicPlayer,
  Player,
  TournamentStage,
  StageGroup,
  StageGroupCouple,
  StageCoupleStats,
  Match,
  StageStatsResponse,
  Court
} from './types';

// Function to fetch a tournament by ID
export async function fetchTournament(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string
): Promise<Tournament> {
  const response = await callApi(`/tournament/${tournamentId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch tournament');
  }

  return response.json();
}

// Function to fetch tournament players
export async function fetchTournamentPlayers(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string
): Promise<TournamentPlayer[]> {
  const response = await callApi(`/tournament/${tournamentId}/player/`);

  if (!response.ok) {
    throw new Error('Failed to load players');
  }

  return response.json();
}

// Function to fetch tournament couples
export async function fetchTournamentCouples(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string
): Promise<Couple[]> {
  const response = await callApi(`/tournament/${tournamentId}/couple/`);

  if (!response.ok) {
    throw new Error('Failed to load couples');
  }

  return response.json();
}

// Function to fetch all players
export async function fetchAllPlayers(
  callApi: ReturnType<typeof useApi>
): Promise<Player[]> {
  const response = await callApi('/player/');

  if (!response.ok) {
    throw new Error('Failed to load players');
  }

  return response.json();
}

// Function to add a player to a tournament
export async function addPlayerToTournament(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  playerId: number
): Promise<void> {
  const response = await callApi('/tournament/player/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tournament_id: tournamentId,
      player_id: playerId
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add player');
  }
}

// Function to create a new player
export async function createPlayer(
  callApi: ReturnType<typeof useApi>,
  nickname: string,
  gender: number
): Promise<Player> {
  const response = await callApi('/player/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nickname,
      gender,
      // Default level (3.00)
      level: 300
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create player');
  }

  return response.json();
}

// Function to search for Playtomic players
export async function searchPlaytomicPlayers(
  callApi: ReturnType<typeof useApi>,
  searchTerm: string
): Promise<PlaytomicPlayer[]> {
  const response = await callApi(
    `/player/playtomic-player/?name=${searchTerm}`
  );

  if (!response.ok) {
    throw new Error('Failed to search Playtomic players');
  }

  return response.json();
}

// Function to import a player from Playtomic
export async function importPlaytomicPlayer(
  callApi: ReturnType<typeof useApi>,
  userId: string,
  gender: number
): Promise<Player> {
  const response = await callApi('/player/from-playtomic/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      gender
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to import player');
  }

  return data;
}

// Function to remove a player from a tournament
export async function removePlayerFromTournament(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  playerId: number
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/player/${playerId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to remove player');
  }
}

// Function to create a couple in a tournament
export async function createCouple(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  firstPlayerId: number,
  secondPlayerId: number,
  name: string
): Promise<Couple> {
  const response = await callApi(`/tournament/${tournamentId}/couple/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      first_player_id: firstPlayerId,
      second_player_id: secondPlayerId,
      name
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create couple');
  }

  return data;
}

// Function to update a couple in a tournament
export async function updateCouple(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  coupleId: number,
  firstPlayerId: number,
  secondPlayerId: number,
  name: string
): Promise<Couple> {
  const response = await callApi(
    `/tournament/${tournamentId}/couple/${coupleId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tournament_id: parseInt(tournamentId),
        first_player_id: firstPlayerId,
        second_player_id: secondPlayerId,
        name
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to update couple');
  }

  return data;
}

// Function to delete a couple from a tournament
export async function deleteCouple(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  coupleId: number
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/couple/${coupleId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete couple');
  }
}

// Tournament Stages API Functions

// Function to fetch all stages for a tournament
export async function fetchTournamentStages(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string
): Promise<TournamentStage[]> {
  const response = await callApi(`/tournament/${tournamentId}/stage/`);

  if (!response.ok) {
    throw new Error('Failed to fetch tournament stages');
  }

  return response.json();
}

// Function to fetch a specific stage
export async function fetchStage(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number
): Promise<TournamentStage> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stage details');
  }

  return response.json();
}

// Function to create a new stage
export async function createStage(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageData: Omit<
    TournamentStage,
    'id' | 'tournament_id' | 'created_at' | 'updated_at'
  >
): Promise<TournamentStage> {
  const response = await callApi(`/tournament/${tournamentId}/stage/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(stageData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create stage');
  }

  return response.json();
}

// Function to update a stage
export async function updateStage(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  stageData: Partial<TournamentStage>
): Promise<TournamentStage> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stageData)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update stage');
  }

  return response.json();
}

// Function to delete a stage
export async function deleteStage(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete stage');
  }
}

// Stage Groups API Functions

// Function to fetch all groups for a stage
export async function fetchStageGroups(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number
): Promise<StageGroup[]> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/group/`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stage groups');
  }

  return response.json();
}

// Function to create a group
export async function createGroup(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  name: string
): Promise<StageGroup> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/group/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create group');
  }

  return response.json();
}

// Function to add a couple to a group
export async function addCoupleToGroup(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  groupId: number,
  coupleId: number
): Promise<StageGroupCouple> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/group/${groupId}/couple`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ couple_id: coupleId })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add couple to group');
  }

  return response.json();
}

// Function to remove a couple from a group
export async function removeCoupleFromGroup(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  groupId: number,
  coupleId: number
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/group/${groupId}/couple/${coupleId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to remove couple from group');
  }
}

// Stage Stats API Functions

// Function to fetch all stats for a stage
export async function fetchStageStats(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  groupId?: number
): Promise<StageCoupleStats[]> {
  const url = groupId
    ? `/tournament/${tournamentId}/stage/${stageId}/stats/?group_id=${groupId}`
    : `/tournament/${tournamentId}/stage/${stageId}/stats/`;

  const response = await callApi(url);

  if (!response.ok) {
    throw new Error('Failed to fetch stage stats');
  }

  return response.json();
}

// Match API Functions

// Function to fetch all tournament matches
export async function fetchTournamentMatches(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  filters?: {
    stage_id?: number;
    couple_id?: number;
    court_id?: number;
  }
): Promise<Match[]> {
  let url = `/tournament/${tournamentId}/match`;

  // Add filters as query parameters if provided
  if (filters) {
    const queryParams = new URLSearchParams();
    if (filters.stage_id)
      queryParams.append('stage_id', filters.stage_id.toString());
    if (filters.couple_id)
      queryParams.append('couple_id', filters.couple_id.toString());
    if (filters.court_id)
      queryParams.append('court_id', filters.court_id.toString());

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }

  const response = await callApi(url);

  if (!response.ok) {
    throw new Error('Failed to load matches');
  }

  return response.json();
}

// Function to fetch stage matches
export async function fetchStageMatches(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  groupId?: number
): Promise<Match[]> {
  let url = `/tournament/${tournamentId}/match/stage/${stageId}`;

  if (groupId) {
    url += `?group_id=${groupId}`;
  }

  const response = await callApi(url);

  if (!response.ok) {
    throw new Error('Failed to load stage matches');
  }

  return response.json();
}

// Function to create a match
export async function createMatch(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  matchData: {
    couple1_id: number;
    couple2_id: number;
    stage_id?: number;
    group_id?: number;
    court_id?: number;
    match_date?: string;
    match_duration?: number;
    bracket_position?: string;
  }
): Promise<Match> {
  const response = await callApi(`/tournament/${tournamentId}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(matchData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create match');
  }

  return response.json();
}

// Function to update a match with results
export async function updateMatch(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  matchId: number,
  matchData: {
    games?: Array<{ set: number; couple1: number; couple2: number }>;
    winner_couple_id?: number;
    court_id?: number;
    match_date?: string;
    match_duration?: number;
  }
): Promise<Match> {
  const response = await callApi(
    `/tournament/${tournamentId}/match/${matchId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(matchData)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update match');
  }

  return response.json();
}

// Function to delete a match
export async function deleteMatch(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  matchId: number
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/match/${matchId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete match');
  }
}

// Function to delete all tournament matches
export async function deleteAllTournamentMatches(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string
): Promise<void> {
  const response = await callApi(`/tournament/${tournamentId}/match`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete tournament matches');
  }
}

// Function to delete all stage matches
export async function deleteAllStageMatches(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/match/stage/${stageId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete stage matches');
  }
}

// Courts API functions

// Function to fetch all courts
export async function fetchCourts(
  callApi: ReturnType<typeof useApi>
): Promise<Court[]> {
  const response = await callApi('/courts/');

  if (!response.ok) {
    throw new Error('Failed to load courts');
  }

  return response.json();
}

// Function to fetch a court by ID
export async function fetchCourt(
  callApi: ReturnType<typeof useApi>,
  courtId: number
): Promise<Court> {
  const response = await callApi(`/courts/${courtId}`);

  if (!response.ok) {
    throw new Error('Failed to load court');
  }

  return response.json();
}

// Function to create a court
export async function createCourt(
  callApi: ReturnType<typeof useApi>,
  courtData: {
    name: string;
    images?: string[];
  }
): Promise<Court> {
  const response = await callApi('/courts/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courtData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create court');
  }

  return response.json();
}

// Function to update a court
export async function updateCourt(
  callApi: ReturnType<typeof useApi>,
  courtId: number,
  courtData: {
    name?: string;
    images?: string[];
  }
): Promise<Court> {
  const response = await callApi(`/courts/${courtId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courtData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update court');
  }

  return response.json();
}

// Function to delete a court
export async function deleteCourt(
  callApi: ReturnType<typeof useApi>,
  courtId: number
): Promise<void> {
  const response = await callApi(`/courts/${courtId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete court');
  }
}

// Stage Actions API Functions

// Function to form groups
export async function formGroups(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  method: 'equal_size' | 'by_level' | 'random',
  numberOfGroups: number,
  balancingCriteria?: string[]
): Promise<StageGroup[]> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/actions/form-groups`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method,
        number_of_groups: numberOfGroups,
        balancing_criteria: balancingCriteria
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to form groups');
  }

  return response.json();
}

// Function to generate matches
export async function generateMatches(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  matchesPerCouple?: number,
  coupleIds?: number[]
): Promise<Match[]> {
  const payload = matchesPerCouple
    ? { matches_per_couple: matchesPerCouple }
    : { couple_ids: coupleIds };

  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/actions/generate-matches`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate matches');
  }

  return response.json();
}

// Function to advance to next stage
export async function advanceToNextStage(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  nextStageId: number,
  advancementRules: {
    top_n_per_group: number;
    best_third_place?: number;
  }
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/actions/advance-to-next-stage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        next_stage_id: nextStageId,
        advancement_rules: advancementRules
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to advance to next stage');
  }
}

// Function to check stage status
export async function checkStageStatus(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number
): Promise<StageStatsResponse> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/actions/check-stage-status`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to check stage status');
  }

  return response.json();
}

// Get couples for a specific group
export const fetchGroupCouples = async (
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  groupId: number
): Promise<Couple[]> => {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/group/${groupId}/couple`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch group couples');
  }

  return response.json();
};

// Update the updateMatchResult function to use the new format
export async function updateMatchResult(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  matchId: number,
  games: Array<{ set: number; couple1: number; couple2: number }>,
  winnerCoupleId: number
): Promise<Match> {
  return updateMatch(callApi, tournamentId, matchId, {
    games,
    winner_couple_id: winnerCoupleId
  });
}

// Function to delete a stage group
export async function deleteGroup(
  callApi: ReturnType<typeof useApi>,
  tournamentId: string,
  stageId: number,
  groupId: number
): Promise<void> {
  const response = await callApi(
    `/tournament/${tournamentId}/stage/${stageId}/group/${groupId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete group');
  }
}
