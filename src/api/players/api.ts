import { ApiCaller } from '@/api/common/types';
import { handleApiResponse } from '@/api/common/apiClient';
import {
  Player,
  PlaytomicPlayer,
  CreatePlayerParams,
  UpdatePlayerParams,
  ImportPlaytomicPlayerParams
} from './types';

/**
 * Players API functions
 */

// Fetch all players
export const fetchPlayers = async (callApi: ApiCaller): Promise<Player[]> => {
  const response = await callApi('/players/');
  return handleApiResponse<Player[]>(response);
};

// Fetch a player by ID
export const fetchPlayer = async (
  callApi: ApiCaller,
  playerId: number
): Promise<Player> => {
  const response = await callApi(`/players/${playerId}`);
  return handleApiResponse<Player>(response);
};

// Create a new player
export const createPlayer = async (
  callApi: ApiCaller,
  params: CreatePlayerParams
): Promise<Player> => {
  const response = await callApi('/players/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<Player>(response);
};

// Update an existing player
export const updatePlayer = async (
  callApi: ApiCaller,
  playerId: number,
  params: UpdatePlayerParams
): Promise<Player> => {
  const response = await callApi(`/players/${playerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<Player>(response);
};

// Delete a player
export const deletePlayer = async (
  callApi: ApiCaller,
  playerId: number
): Promise<void> => {
  const response = await callApi(`/players/${playerId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete player');
  }
};

/**
 * Playtomic integration API functions
 */

// Search for players in Playtomic
export const searchPlaytomicPlayers = async (
  callApi: ApiCaller,
  searchTerm: string
): Promise<PlaytomicPlayer[]> => {
  const response = await callApi(
    `/players/playtomic-player/?name=${searchTerm}`
  );
  return handleApiResponse<PlaytomicPlayer[]>(response);
};

// Import a player from Playtomic
export const importPlayerFromPlaytomic = async (
  callApi: ApiCaller,
  params: ImportPlaytomicPlayerParams
): Promise<Player> => {
  const response = await callApi('/players/from-playtomic/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      playtomic_id: params.user_id,
      gender: params.gender
    })
  });
  return handleApiResponse<Player>(response);
};
