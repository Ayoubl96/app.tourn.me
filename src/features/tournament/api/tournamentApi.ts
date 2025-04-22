import { Couple, Player, Tournament, TournamentPlayer } from '../types';

// This API layer assumes you have a useApi hook that handles authentication and error handling
export const fetchTournament = async (
  callApi: any,
  tournamentId: string
): Promise<Tournament> => {
  const response = await callApi(`/tournament/${tournamentId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch tournament');
  }

  return response.json();
};

export const updateTournament = async (
  callApi: any,
  tournamentId: string,
  data: Partial<Tournament>
): Promise<Tournament> => {
  const response = await callApi(`/tournament/${tournamentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update tournament');
  }

  return response.json();
};

export const fetchTournamentPlayers = async (
  callApi: any,
  tournamentId: string
): Promise<TournamentPlayer[]> => {
  const response = await callApi(`/tournament/${tournamentId}/player/`);

  if (!response.ok) {
    throw new Error('Failed to load players');
  }

  return response.json();
};

export const fetchTournamentCouples = async (
  callApi: any,
  tournamentId: string
): Promise<Couple[]> => {
  const response = await callApi(`/tournament/${tournamentId}/couple/`);

  if (!response.ok) {
    throw new Error('Failed to load couples');
  }

  return response.json();
};

export const fetchAllPlayers = async (callApi: any): Promise<Player[]> => {
  const response = await callApi('/player/');

  if (!response.ok) {
    throw new Error('Failed to load players');
  }

  return response.json();
};

export const addPlayerToTournament = async (
  callApi: any,
  tournamentId: string,
  playerId: number
): Promise<void> => {
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
};

export const removePlayerFromTournament = async (
  callApi: any,
  tournamentId: string,
  playerId: number
): Promise<void> => {
  const response = await callApi(
    `/tournament/${tournamentId}/player/${playerId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to remove player');
  }
};

export const createPlayer = async (
  callApi: any,
  data: { nickname: string; gender: number; level?: number }
): Promise<Player> => {
  const response = await callApi('/player/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...data,
      level: data.level || 300 // Default level (3.00)
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create player');
  }

  return response.json();
};

export const importPlayerFromPlaytomic = async (
  callApi: any,
  userId: string,
  gender: number
): Promise<Player> => {
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
};

export const searchPlaytomicPlayers = async (
  callApi: any,
  searchTerm: string
) => {
  const response = await callApi(
    `/player/playtomic-player/?name=${searchTerm}`
  );

  if (!response.ok) {
    throw new Error('Failed to search Playtomic players');
  }

  return response.json();
};

export const createCouple = async (
  callApi: any,
  tournamentId: string,
  data: {
    first_player_id: number;
    second_player_id: number;
    name: string;
  }
): Promise<Couple> => {
  const response = await callApi(`/tournament/${tournamentId}/couple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.message || 'Failed to create couple');
  }

  return responseData;
};

export const updateCouple = async (
  callApi: any,
  tournamentId: string,
  coupleId: number,
  data: {
    tournament_id: number;
    first_player_id: number;
    second_player_id: number;
    name: string;
  }
): Promise<Couple> => {
  const response = await callApi(
    `/tournament/${tournamentId}/couple/${coupleId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.message || 'Failed to update couple');
  }

  return responseData;
};

export const deleteCouple = async (
  callApi: any,
  tournamentId: string,
  coupleId: number
): Promise<void> => {
  const response = await callApi(
    `/tournament/${tournamentId}/couple/${coupleId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Failed to delete couple');
  }
};
