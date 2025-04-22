import {
  Couple,
  Player,
  Tournament,
  TournamentPlayer,
  PlaytomicPlayer
} from '../types';

/**
 * Type for any API callable function
 */
type ApiCaller = (url: string, options?: RequestInit) => Promise<Response>;

/**
 * Tournament Service - Provides all API methods related to tournaments
 */
export class TournamentService {
  private callApi: ApiCaller;

  constructor(callApi: ApiCaller) {
    this.callApi = callApi;
  }

  /**
   * Tournament Methods
   */
  async fetchTournament(tournamentId: string): Promise<Tournament> {
    const response = await this.callApi(`/tournament/${tournamentId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tournament');
    }

    return response.json();
  }

  async updateTournament(
    tournamentId: string,
    data: Partial<Tournament>
  ): Promise<Tournament> {
    const response = await this.callApi(`/tournament/${tournamentId}`, {
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
  }

  /**
   * Player Methods
   */
  async fetchTournamentPlayers(
    tournamentId: string
  ): Promise<TournamentPlayer[]> {
    const response = await this.callApi(`/tournament/${tournamentId}/player/`);

    if (!response.ok) {
      throw new Error('Failed to load players');
    }

    return response.json();
  }

  async fetchAllPlayers(): Promise<Player[]> {
    const response = await this.callApi('/player/');

    if (!response.ok) {
      throw new Error('Failed to load players');
    }

    return response.json();
  }

  async addPlayerToTournament(
    tournamentId: string,
    playerId: number
  ): Promise<void> {
    const response = await this.callApi('/tournament/player/', {
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

  async removePlayerFromTournament(
    tournamentId: string,
    playerId: number
  ): Promise<void> {
    const response = await this.callApi(
      `/tournament/${tournamentId}/player/${playerId}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove player');
    }
  }

  async createPlayer(data: {
    nickname: string;
    gender: number;
    level?: number;
  }): Promise<Player> {
    const response = await this.callApi('/player/', {
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
  }

  /**
   * Couple Methods
   */
  async fetchTournamentCouples(tournamentId: string): Promise<Couple[]> {
    const response = await this.callApi(`/tournament/${tournamentId}/couple/`);

    if (!response.ok) {
      throw new Error('Failed to load couples');
    }

    return response.json();
  }

  async createCouple(
    tournamentId: string,
    data: {
      first_player_id: number;
      second_player_id: number;
      name: string;
    }
  ): Promise<Couple> {
    const response = await this.callApi(`/tournament/${tournamentId}/couple`, {
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
  }

  async updateCouple(
    tournamentId: string,
    coupleId: number,
    data: {
      tournament_id: number;
      first_player_id: number;
      second_player_id: number;
      name: string;
    }
  ): Promise<Couple> {
    const response = await this.callApi(
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
  }

  async deleteCouple(tournamentId: string, coupleId: number): Promise<void> {
    const response = await this.callApi(
      `/tournament/${tournamentId}/couple/${coupleId}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.message || 'Failed to delete couple');
    }
  }

  /**
   * Playtomic Methods
   */
  async searchPlaytomicPlayers(searchTerm: string): Promise<PlaytomicPlayer[]> {
    const response = await this.callApi(
      `/player/playtomic-player/?name=${searchTerm}`
    );

    if (!response.ok) {
      throw new Error('Failed to search Playtomic players');
    }

    return response.json();
  }

  async importPlayerFromPlaytomic(
    userId: string,
    gender: number
  ): Promise<Player> {
    const response = await this.callApi('/player/from-playtomic/', {
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
}
