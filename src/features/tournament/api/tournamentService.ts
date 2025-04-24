import { ApiCaller } from '@/api/common/types';
import {
  fetchTournament,
  fetchTournamentPlayers,
  fetchTournamentCouples,
  addPlayerToTournament,
  removePlayerFromTournament,
  createCouple,
  updateCouple,
  deleteCouple
} from '@/api/tournaments/api';
import {
  fetchPlayers,
  searchPlaytomicPlayers,
  importPlayerFromPlaytomic
} from '@/api/players/api';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  CreateCoupleParams,
  UpdateCoupleParams
} from '@/api/tournaments/types';
import {
  Player,
  PlaytomicPlayer,
  ImportPlaytomicPlayerParams
} from '@/api/players/types';

/**
 * Service class to handle tournament-related API calls
 */
export class TournamentService {
  private callApi: ApiCaller;

  constructor(callApi: ApiCaller) {
    this.callApi = callApi;
  }

  /**
   * Fetch tournament by ID
   */
  async fetchTournament(tournamentId: string | number): Promise<Tournament> {
    return fetchTournament(this.callApi, tournamentId);
  }

  /**
   * Fetch players in a tournament
   */
  async fetchTournamentPlayers(
    tournamentId: string | number
  ): Promise<TournamentPlayer[]> {
    return fetchTournamentPlayers(this.callApi, tournamentId);
  }

  /**
   * Fetch couples in a tournament
   */
  async fetchTournamentCouples(
    tournamentId: string | number
  ): Promise<Couple[]> {
    return fetchTournamentCouples(this.callApi, tournamentId);
  }

  /**
   * Fetch all players
   */
  async fetchAllPlayers(): Promise<Player[]> {
    return fetchPlayers(this.callApi);
  }

  /**
   * Add a player to a tournament
   */
  async addPlayerToTournament(
    tournamentId: string | number,
    playerId: number
  ): Promise<TournamentPlayer> {
    return addPlayerToTournament(this.callApi, Number(tournamentId), playerId);
  }

  /**
   * Remove a player from a tournament
   */
  async removePlayerFromTournament(
    tournamentId: string | number,
    playerId: number
  ): Promise<void> {
    return removePlayerFromTournament(this.callApi, tournamentId, playerId);
  }

  /**
   * Create a couple in a tournament
   */
  async createCouple(
    tournamentId: string | number,
    data: CreateCoupleParams
  ): Promise<Couple> {
    return createCouple(this.callApi, tournamentId, data);
  }

  /**
   * Update a couple in a tournament
   */
  async updateCouple(
    tournamentId: string | number,
    coupleId: number,
    data: UpdateCoupleParams
  ): Promise<Couple> {
    return updateCouple(this.callApi, tournamentId, coupleId, data);
  }

  /**
   * Delete a couple from a tournament
   */
  async deleteCouple(
    tournamentId: string | number,
    coupleId: number
  ): Promise<void> {
    return deleteCouple(this.callApi, tournamentId, coupleId);
  }

  /**
   * Search for players in Playtomic
   */
  async searchPlaytomicPlayers(searchTerm: string): Promise<PlaytomicPlayer[]> {
    return searchPlaytomicPlayers(this.callApi, searchTerm);
  }

  /**
   * Import a player from Playtomic
   */
  async importPlayerFromPlaytomic(
    userId: string,
    gender: string | undefined
  ): Promise<Player> {
    const params: ImportPlaytomicPlayerParams = {
      user_id: userId,
      gender: gender === 'FEMALE' ? 2 : 1 // 1 for male, 2 for female
    };
    return importPlayerFromPlaytomic(this.callApi, params);
  }
}
