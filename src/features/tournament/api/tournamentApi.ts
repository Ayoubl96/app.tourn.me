import { useApi } from '@/hooks/useApi';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  PlaytomicPlayer,
  Player
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
