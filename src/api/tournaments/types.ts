import { Player } from '@/api/players/types';

/**
 * Tournament entity type
 */
export interface Tournament {
  id: number;
  name: string;
  description: string;
  images: string[];
  company_id: number;
  start_date: string;
  end_date: string;
  players_number: number;
  full_description?: any;
}

/**
 * Tournament player relationship
 */
export interface TournamentPlayer {
  tournament_id: number;
  player_id: number;
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  player: Player;
}

/**
 * Couple entity type
 */
export interface Couple {
  id: number;
  tournament_id: number;
  first_player_id: number;
  second_player_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  first_player: Player;
  second_player: Player;
}

/**
 * Tournament status types
 */
export type TournamentStatus = 'ended' | 'ongoing' | 'upcoming';

/**
 * Tournament creation parameters
 */
export interface CreateTournamentParams {
  name: string;
  description: string;
  full_description?: any;
  players_number?: number;
  start_date?: string;
  end_date?: string;
  images?: string[];
}

/**
 * Tournament update parameters
 */
export interface UpdateTournamentParams
  extends Partial<CreateTournamentParams> {}

/**
 * Couple creation parameters
 */
export interface CreateCoupleParams {
  first_player_id: number;
  second_player_id: number;
  name: string;
}

/**
 * Couple update parameters
 */
export interface UpdateCoupleParams extends Partial<CreateCoupleParams> {}

/**
 * Tournament Court type
 */
export interface TournamentCourt {
  id: number;
  court_id: number;
  tournament_id: number;
  availability_start: string;
  availability_end: string;
  created_at: string;
  updated_at: string;
  court: {
    id: number;
    name: string;
    size: number;
    active: boolean;
    images: string[];
  };
}

/**
 * Add Court to Tournament params
 */
export interface AddCourtToTournamentParams {
  court_id: number;
  availability_start: string;
  availability_end: string;
}

/**
 * Update Tournament Court params
 */
export interface UpdateTournamentCourtParams {
  availability_start: string;
  availability_end: string;
}
