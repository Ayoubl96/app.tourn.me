import { ApiCaller } from '@/api/common/types';
import { handleApiResponse } from '@/api/common/apiClient';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  CreateTournamentParams,
  UpdateTournamentParams,
  CreateCoupleParams,
  UpdateCoupleParams,
  TournamentCourt,
  AddCourtToTournamentParams,
  UpdateTournamentCourtParams,
  TournamentStage,
  CreateTournamentStageParams,
  UpdateTournamentStageParams,
  TournamentGroup,
  CreateTournamentGroupParams,
  UpdateTournamentGroupParams,
  GroupCouple,
  AddCoupleToGroupParams,
  AutoAssignCouplesParams,
  GroupStandingsResponse,
  TournamentBracket,
  CreateTournamentBracketParams,
  UpdateTournamentBracketParams,
  ScheduleMatchParams,
  CourtAvailability,
  AutoScheduleMatchesParams,
  StagingMatch,
  TournamentStandingsResponse,
  MatchOrderingStrategy,
  TournamentMatchOrderInfo,
  CalculateMatchOrderRequest,
  CalculateMatchOrderResponse
} from './types';

/**
 * Tournament API functions
 */

// Fetch a tournament by ID
export const fetchTournament = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<Tournament> => {
  const response = await callApi(`/tournaments/${tournamentId}`);
  return handleApiResponse<Tournament>(response);
};

// Fetch all tournaments
export const fetchTournaments = async (
  callApi: ApiCaller
): Promise<Tournament[]> => {
  const response = await callApi('/tournaments/');
  return handleApiResponse<Tournament[]>(response);
};

// Create a new tournament
export const createTournament = async (
  callApi: ApiCaller,
  params: CreateTournamentParams
): Promise<Tournament> => {
  const response = await callApi('/tournaments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<Tournament>(response);
};

// Update an existing tournament
export const updateTournament = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  params: UpdateTournamentParams
): Promise<Tournament> => {
  const response = await callApi(`/tournaments/${tournamentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<Tournament>(response);
};

// Delete a tournament
export const deleteTournament = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<void> => {
  const response = await callApi(`/tournaments/${tournamentId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete tournament');
  }
};

/**
 * Tournament Players API functions
 */

// Fetch players in a tournament
export const fetchTournamentPlayers = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<TournamentPlayer[]> => {
  const response = await callApi(`/tournaments/${tournamentId}/player/`);
  return handleApiResponse<TournamentPlayer[]>(response);
};

// Add a player to a tournament
export const addPlayerToTournament = async (
  callApi: ApiCaller,
  tournamentId: number,
  playerId: number
): Promise<TournamentPlayer> => {
  const response = await callApi(`/tournaments/${tournamentId}/player/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ player_id: playerId, tournament_id: tournamentId })
  });
  return handleApiResponse<TournamentPlayer>(response);
};

// Remove a player from a tournament
export const removePlayerFromTournament = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  playerId: number
): Promise<void> => {
  const response = await callApi(
    `/tournaments/${tournamentId}/player/${playerId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to remove player from tournament');
  }
};

/**
 * Tournament Couples API functions
 */

// Fetch couples in a tournament
export const fetchTournamentCouples = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<Couple[]> => {
  const response = await callApi(`/tournaments/${tournamentId}/couple/`);
  return handleApiResponse<Couple[]>(response);
};

// Create a couple in a tournament
export const createCouple = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  params: CreateCoupleParams
): Promise<Couple> => {
  const response = await callApi(`/tournaments/${tournamentId}/couple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<Couple>(response);
};

// Update a couple in a tournament
export const updateCouple = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  coupleId: number,
  params: UpdateCoupleParams
): Promise<Couple> => {
  const response = await callApi(
    `/tournaments/${tournamentId}/couple/${coupleId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }
  );
  return handleApiResponse<Couple>(response);
};

// Delete a couple from a tournament
export const deleteCouple = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  coupleId: number
): Promise<void> => {
  const response = await callApi(
    `/tournaments/${tournamentId}/couple/${coupleId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete couple');
  }
};

/**
 * Tournament Courts API functions
 */

// Fetch courts in a tournament
export const fetchTournamentCourts = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<TournamentCourt[]> => {
  const response = await callApi(`/tournaments/${tournamentId}/court`);
  return handleApiResponse<TournamentCourt[]>(response);
};

// Add a court to a tournament
export const addCourtToTournament = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  params: AddCourtToTournamentParams
): Promise<TournamentCourt> => {
  const response = await callApi(`/tournaments/${tournamentId}/court`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<TournamentCourt>(response);
};

// Update a court in a tournament
export const updateTournamentCourt = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  courtId: number,
  params: UpdateTournamentCourtParams
): Promise<TournamentCourt> => {
  const response = await callApi(
    `/tournaments/${tournamentId}/court/${courtId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }
  );
  return handleApiResponse<TournamentCourt>(response);
};

// Remove a court from a tournament
export const removeCourtFromTournament = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  courtId: number
): Promise<void> => {
  const response = await callApi(
    `/tournaments/${tournamentId}/court/${courtId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to remove court from tournament');
  }
};

/**
 * Tournament Staging API functions
 */

// Fetch tournament stages
export const fetchTournamentStages = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<TournamentStage[]> => {
  const response = await callApi(`/staging/tournament/${tournamentId}/stage`);
  return handleApiResponse<TournamentStage[]>(response);
};

// Fetch a stage by ID
export const fetchStageById = async (
  callApi: ApiCaller,
  stageId: string | number
): Promise<TournamentStage> => {
  const response = await callApi(`/staging/stage/${stageId}`);
  return handleApiResponse<TournamentStage>(response);
};

// Create a tournament stage
export const createTournamentStage = async (
  callApi: ApiCaller,
  params: CreateTournamentStageParams
): Promise<TournamentStage> => {
  const response = await callApi(
    `/staging/tournament/${params.tournament_id}/stage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }
  );
  return handleApiResponse<TournamentStage>(response);
};

// Update a tournament stage
export const updateTournamentStage = async (
  callApi: ApiCaller,
  stageId: string | number,
  params: UpdateTournamentStageParams
): Promise<TournamentStage> => {
  const response = await callApi(`/staging/stage/${stageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<TournamentStage>(response);
};

// Delete a tournament stage
export const deleteTournamentStage = async (
  callApi: ApiCaller,
  stageId: string | number
): Promise<void> => {
  const response = await callApi(`/staging/stage/${stageId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete stage');
  }
};

// Fetch stage groups
export const fetchStageGroups = async (
  callApi: ApiCaller,
  stageId: string | number
): Promise<TournamentGroup[]> => {
  const response = await callApi(`/staging/stage/${stageId}/group`);
  return handleApiResponse<TournamentGroup[]>(response);
};

// Fetch a group by ID
export const fetchGroupById = async (
  callApi: ApiCaller,
  groupId: string | number
): Promise<TournamentGroup> => {
  const response = await callApi(`/staging/group/${groupId}`);
  return handleApiResponse<TournamentGroup>(response);
};

// Create a tournament group
export const createTournamentGroup = async (
  callApi: ApiCaller,
  params: CreateTournamentGroupParams
): Promise<TournamentGroup> => {
  const response = await callApi(`/staging/stage/${params.stage_id}/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<TournamentGroup>(response);
};

// Update a tournament group
export const updateTournamentGroup = async (
  callApi: ApiCaller,
  groupId: string | number,
  params: UpdateTournamentGroupParams
): Promise<TournamentGroup> => {
  const response = await callApi(`/staging/group/${groupId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<TournamentGroup>(response);
};

// Delete a tournament group
export const deleteTournamentGroup = async (
  callApi: ApiCaller,
  groupId: string | number
): Promise<void> => {
  const response = await callApi(`/staging/group/${groupId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete group');
  }
};

// Add couple to group
export const addCoupleToGroup = async (
  callApi: ApiCaller,
  params: AddCoupleToGroupParams
): Promise<GroupCouple> => {
  const response = await callApi(`/staging/group/${params.group_id}/couple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<GroupCouple>(response);
};

// Get group couples
export const fetchGroupCouples = async (
  callApi: ApiCaller,
  groupId: string | number
): Promise<GroupCouple[]> => {
  const response = await callApi(`/staging/group/${groupId}/couple`);
  return handleApiResponse<GroupCouple[]>(response);
};

// Remove couple from group
export const removeCoupleFromGroup = async (
  callApi: ApiCaller,
  groupId: string | number,
  coupleId: string | number
): Promise<void> => {
  const response = await callApi(
    `/staging/group/${groupId}/couple/${coupleId}`,
    {
      method: 'DELETE'
    }
  );
  if (!response.ok) {
    throw new Error('Failed to remove couple from group');
  }
};

// Auto-assign couples to groups
export const autoAssignCouples = async (
  callApi: ApiCaller,
  stageId: string | number,
  params: AutoAssignCouplesParams
): Promise<void> => {
  const response = await callApi(
    `/staging/stage/${stageId}/assign-couples?method=${params.method}`,
    {
      method: 'POST'
    }
  );
  if (!response.ok) {
    throw new Error('Failed to auto-assign couples');
  }
};

// Get group standings
export const fetchGroupStandings = async (
  callApi: ApiCaller,
  groupId: string | number
): Promise<GroupStandingsResponse> => {
  const response = await callApi(`/staging/group/${groupId}/standings`);
  return handleApiResponse<GroupStandingsResponse>(response);
};

// Fetch stage brackets
export const fetchStageBrackets = async (
  callApi: ApiCaller,
  stageId: string | number
): Promise<TournamentBracket[]> => {
  const response = await callApi(`/staging/stage/${stageId}/bracket`);
  return handleApiResponse<TournamentBracket[]>(response);
};

// Fetch a bracket by ID
export const fetchBracketById = async (
  callApi: ApiCaller,
  bracketId: string | number
): Promise<TournamentBracket> => {
  const response = await callApi(`/staging/bracket/${bracketId}`);
  return handleApiResponse<TournamentBracket>(response);
};

// Create a tournament bracket
export const createTournamentBracket = async (
  callApi: ApiCaller,
  params: CreateTournamentBracketParams
): Promise<TournamentBracket> => {
  const response = await callApi(`/staging/stage/${params.stage_id}/bracket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<TournamentBracket>(response);
};

// Update a tournament bracket
export const updateTournamentBracket = async (
  callApi: ApiCaller,
  bracketId: string | number,
  params: UpdateTournamentBracketParams
): Promise<TournamentBracket> => {
  const response = await callApi(`/staging/bracket/${bracketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<TournamentBracket>(response);
};

// Delete a tournament bracket
export const deleteTournamentBracket = async (
  callApi: ApiCaller,
  bracketId: string | number
): Promise<void> => {
  const response = await callApi(`/staging/bracket/${bracketId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete bracket');
  }
};

// Generate bracket matches
export const generateBracketMatches = async (
  callApi: ApiCaller,
  bracketId: string | number,
  couples?: number[]
): Promise<void> => {
  const response = await callApi(
    `/staging/bracket/${bracketId}/generate-matches`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: couples ? JSON.stringify({ couples }) : undefined
    }
  );
  if (!response.ok) {
    throw new Error('Failed to generate bracket matches');
  }
};

// Generate group matches
export const generateGroupMatches = async (
  callApi: ApiCaller,
  groupId: string | number
): Promise<void> => {
  const response = await callApi(`/staging/group/${groupId}/generate-matches`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to generate group matches');
  }
};

// Schedule a match
export const scheduleMatch = async (
  callApi: ApiCaller,
  matchId: string | number,
  params: ScheduleMatchParams
): Promise<void> => {
  const queryParams = new URLSearchParams();
  queryParams.append('court_id', params.court_id.toString());
  queryParams.append('start_time', params.start_time);

  if (params.end_time) {
    queryParams.append('end_time', params.end_time);
  }

  if (params.is_time_limited !== undefined) {
    queryParams.append('is_time_limited', params.is_time_limited.toString());
  }

  if (params.time_limit_minutes) {
    queryParams.append(
      'time_limit_minutes',
      params.time_limit_minutes.toString()
    );
  }

  const response = await callApi(
    `/staging/match/${matchId}/schedule?${queryParams.toString()}`,
    {
      method: 'POST'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to schedule match');
  }
};

// Unschedule a match
export const unscheduleMatch = async (
  callApi: ApiCaller,
  matchId: string | number
): Promise<void> => {
  const response = await callApi(`/staging/match/${matchId}/schedule`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to unschedule match');
  }
};

// Get court availability
export const fetchCourtAvailability = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  date: string
): Promise<CourtAvailability[]> => {
  const response = await callApi(
    `/staging/tournament/${tournamentId}/court-availability?date=${date}`
  );
  return handleApiResponse<CourtAvailability[]>(response);
};

// Auto-schedule matches
export const autoScheduleMatches = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  params: AutoScheduleMatchesParams
): Promise<void> => {
  const queryParams = new URLSearchParams();
  queryParams.append('start_date', params.start_date);

  if (params.end_date) {
    queryParams.append('end_date', params.end_date);
  }

  const response = await callApi(
    `/staging/tournament/${tournamentId}/auto-schedule?${queryParams.toString()}`,
    {
      method: 'POST'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to auto-schedule matches');
  }
};

/**
 * Match Management API functions
 */

// Fetch all matches for a tournament
export const fetchTournamentMatches = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<StagingMatch[]> => {
  const response = await callApi(`/staging/tournament/${tournamentId}/matches`);
  return handleApiResponse<StagingMatch[]>(response);
};

// Fetch all matches for a stage
export const fetchStageMatches = async (
  callApi: ApiCaller,
  stageId: string | number
): Promise<StagingMatch[]> => {
  const response = await callApi(`/staging/stage/${stageId}/matches`);
  return handleApiResponse<StagingMatch[]>(response);
};

// Fetch all matches for a group
export const fetchGroupMatches = async (
  callApi: ApiCaller,
  groupId: string | number
): Promise<StagingMatch[]> => {
  const response = await callApi(`/staging/group/${groupId}/matches`);
  return handleApiResponse<StagingMatch[]>(response);
};

// Fetch all matches for a bracket
export const fetchBracketMatches = async (
  callApi: ApiCaller,
  bracketId: string | number
): Promise<StagingMatch[]> => {
  const response = await callApi(`/staging/bracket/${bracketId}/matches`);
  return handleApiResponse<StagingMatch[]>(response);
};

// Fetch details for a specific match
export const fetchMatchById = async (
  callApi: ApiCaller,
  matchId: string | number
): Promise<StagingMatch> => {
  const response = await callApi(`/staging/match/${matchId}`);
  return handleApiResponse<StagingMatch>(response);
};

// Update match details
export const updateMatch = async (
  callApi: ApiCaller,
  matchId: string | number,
  matchData: Partial<StagingMatch>
): Promise<StagingMatch> => {
  const response = await callApi(`/staging/match/${matchId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(matchData)
  });
  return handleApiResponse<StagingMatch>(response);
};

/**
 * Match Ordering API functions
 */

// Calculate tournament match order
export const calculateTournamentMatchOrder = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  request: CalculateMatchOrderRequest
): Promise<CalculateMatchOrderResponse> => {
  const response = await callApi(
    `/staging/tournament/${tournamentId}/calculate-match-order?strategy=${request.strategy}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  );
  return handleApiResponse<CalculateMatchOrderResponse>(response);
};

// Calculate stage match order
export const calculateStageMatchOrder = async (
  callApi: ApiCaller,
  stageId: string | number,
  request: CalculateMatchOrderRequest
): Promise<CalculateMatchOrderResponse> => {
  const response = await callApi(
    `/staging/stage/${stageId}/calculate-match-order?strategy=${request.strategy}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  );
  return handleApiResponse<CalculateMatchOrderResponse>(response);
};

// Get tournament match order info
export const getTournamentMatchOrderInfo = async (
  callApi: ApiCaller,
  tournamentId: string | number
): Promise<TournamentMatchOrderInfo> => {
  const response = await callApi(
    `/staging/tournament/${tournamentId}/match-order-info`
  );
  return handleApiResponse<TournamentMatchOrderInfo>(response);
};

/**
 * Tournament Standings API functions
 */

// Fetch tournament standings for group phase
export const fetchTournamentStandings = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  groupId?: string | number
): Promise<TournamentStandingsResponse> => {
  let url = `/staging/tournament/${tournamentId}/standings`;

  if (groupId) {
    url += `?group_id=${groupId}`;
  }

  const response = await callApi(url);
  return handleApiResponse<TournamentStandingsResponse>(response);
};

// Recalculate tournament statistics
export const recalculateTournamentStats = async (
  callApi: ApiCaller,
  tournamentId: string | number,
  groupId?: string | number
): Promise<void> => {
  let url = `/staging/tournament/${tournamentId}/stats/recalculate`;

  if (groupId) {
    url += `?group_id=${groupId}`;
  }

  const response = await callApi(url, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Failed to recalculate tournament statistics');
  }
};
