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
  UpdateTournamentCourtParams
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
